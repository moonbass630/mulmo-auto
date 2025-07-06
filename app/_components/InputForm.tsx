'use client'

import { useState, useRef, useEffect } from 'react'
import { useActionState } from 'react'
import { submitTextForm, generateMulmoScript } from '../lib/actions/chatgpt'
import { runFfmpegAll } from '../lib/actions/ffmpeg'
import { saveScriptToFile, runMulmoMovie } from '../lib/actions/mulmocast'

export default function InputForm() {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }, [value])

  // 台本作成用
  const initialState = { result: '' }
  const [state, formAction, isPending] = useActionState(submitTextForm, initialState)
  
  const [editableResult, setEditableResult] = useState('')
  const [editableScript, setEditableScript] = useState('')

  // MulmoScript生成用
  const scriptInitialState = { result: '' }
  const [scriptState, scriptAction, scriptIsPending] = useActionState(generateMulmoScript, scriptInitialState)

  // MulmoScriptファイル出力用
  const saveInitialState = { result: '' }
  const [saveState, saveAction, saveIsPending] = useActionState(saveScriptToFile, saveInitialState)

  // Mulmo Movie処理ステート
  const mulmoInitialState = { result: '' }
  const [mulmoState, mulmoAction, mulmoIsPending] = useActionState(runMulmoMovie, mulmoInitialState)


  // FFmpeg処理ステート
  type FfmpegState = { result: string }
  const ffmpegInitialState: FfmpegState = { result: '' }
  const [ffmpegState, ffmpegAction, ffmpegIsPending] = useActionState<FfmpegState, void>(
    runFfmpegAll,
    ffmpegInitialState
  )

  // 台本の返答が更新されたらeditableResultにセット
  useEffect(() => {
    setEditableResult(state.result)
  }, [state.result])

  // MulmoScript生成結果が更新されたらeditableScriptにセット
  useEffect(() => {
    setEditableScript(scriptState.result)
  }, [scriptState.result])

  return (
    <div>
      {/* 台本作成フォーム */}
      <form action={formAction}>
        <div className="py-12 text-gray-600">
          <div className="mx-auto flex flex-col bg-white shadow-md p-8 md:w-1/2">
            <h2 className="text-lg mb-4">ChatGPT台本作成</h2>
            <div className="mb-4">
              <label htmlFor="input" className="text-sm block mb-1">入力</label>
              <textarea
                id="input"
                name="input"
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="ここに台本の内容を入力してください"
                rows={1}
                className="
                  w-full bg-white rounded border border-gray-300
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                  outline-none py-2 px-3 leading-6 resize-none overflow-hidden
                "
              />
            </div>
            <button
              type="submit"
              className={`text-white px-4 py-2 rounded
                  ${isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'}
                `}
              disabled={isPending}
            >
              {isPending ? '送信中...' : '送信'}
            </button>
            {state.result && (
              <div className="mt-4 p-4 bg-gray-100 rounded max-w-full">
                <label htmlFor="editableResult" className="block font-bold mb-2">ChatGPTの返答（編集可能）：</label>
                <textarea
                  id="editableResult"
                  value={editableResult}
                  onChange={(e) => setEditableResult(e.target.value)}
                  rows={10}
                  className="
                    w-full bg-white rounded border border-gray-300
                    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                    outline-none py-2 px-3 leading-6 resize-y
                  "
                />
              </div>
            )}
          </div>
        </div>
      </form>

      {/* MulmoScript生成フォーム */}
      {state.result && (
        <form action={scriptAction}>
          {/* hidden inputで台本の結果を渡す */}
          <input type="hidden" name="scriptInput" value={editableResult} />
          <div className="py-4 text-gray-600">
            <div className="mx-auto flex flex-col bg-white shadow-md p-8 md:w-1/2">
              <h2 className="text-lg mb-4">MulmoScript生成</h2>
              <button
                type="submit"
                disabled={scriptIsPending}
                className={`text-white px-4 py-2 rounded bg-green-600 hover:bg-green-700
                  ${scriptIsPending ? 'cursor-not-allowed opacity-50' : ''}
                `}
              >
                {scriptIsPending ? '生成中...' : 'MulmoScript生成'}
              </button>
              {scriptState.result && (
                <div className="mt-4 p-4 bg-gray-100 rounded max-w-full">
                  <label htmlFor="editableScript" className="block font-bold mb-2">生成されたMulmoScript（編集可能）：</label>
                  <textarea
                    id="editableScript"
                    value={editableScript}
                    onChange={(e) => setEditableScript(e.target.value)}
                    rows={10}
                    className="
                      w-full bg-white rounded border border-gray-300
                      focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                      outline-none py-2 px-3 leading-6 resize-y
                    "
                  />
                </div>
              )}
            </div>
          </div>
        </form>
      )}
      {/* 保存ボタン */}
      {editableScript.trim() && (
        <form action={saveAction}>
          <input type="hidden" name="editableScript" value={editableScript} />
          <div className="py-4 text-gray-600">
            <div className="mx-auto flex flex-col bg-white shadow-md p-8 md:w-1/2">
              <h2 className="text-lg mb-4">MulmoScriptをファイルに保存</h2>
              <button
                type="submit"
                disabled={saveIsPending}
                className={`text-white px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 ${
                  saveIsPending ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                {saveIsPending ? '保存中...' : '保存する'}
              </button>
              {saveState.result && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <p className="font-bold mb-2">結果:</p>
                  <pre className="text-sm whitespace-pre-wrap">{saveState.result}</pre>
                </div>
              )}
            </div>
          </div>
        </form>
      )}
      {/* 保存成功後のファイル名を抽出して、mulmo movie 実行ボタン表示 */}
      {saveState.result && saveState.result.includes('保存成功') && (
        <form action={mulmoAction}>
          <input
            type="hidden"
            name="filename"
            value={saveState.result.split(': ').pop()?.trim().split('/').pop() ?? ''}
          />
          <div className="py-4 text-gray-600">
            <div className="mx-auto flex flex-col bg-white shadow-md p-8 md:w-1/2">
              <h2 className="text-lg mb-4">Mulmoで動画作成</h2>
              <button
                type="submit"
                disabled={mulmoIsPending}
                className={`text-white px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 ${
                  mulmoIsPending ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                {mulmoIsPending ? '実行中...' : 'mulmo movie 実行'}
              </button>
              {mulmoState.result && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <p className="font-bold mb-2">実行結果:</p>
                  <pre className="text-sm whitespace-pre-wrap">{mulmoState.result}</pre>
                </div>
              )}
            </div>
          </div>
        </form>
      )}
      {/* FFmpeg実行ボタン */}
      <div className="py-4 text-gray-600">
        <div className="mx-auto flex flex-col bg-white shadow-md p-8 md:w-1/2">
          <h2 className="text-lg mb-4">動画の後ろ2秒をカット</h2>
          <button
            onClick={() => ffmpegAction()} // ← form不要
            disabled={ffmpegIsPending}
            className={`text-white px-4 py-2 rounded bg-red-600 hover:bg-red-700 ${
              ffmpegIsPending ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            {ffmpegIsPending ? '処理中...' : 'FFmpeg実行'}
          </button>
          {ffmpegState.result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p className="font-bold mb-2">結果:</p>
              <pre className="text-sm whitespace-pre-wrap">{ffmpegState.result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
