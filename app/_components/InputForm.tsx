'use client'

import { useState, useRef, useEffect } from 'react'
import { useActionState } from 'react'
import { submitTextForm, generateMulmoScript } from '../lib/actions/chatgpt'
import { runFfmpeg } from '../lib/actions/ffmpeg'

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

  // MulmoScript生成用
  const scriptInitialState = { result: '' }
  const [scriptState, scriptAction, scriptIsPending] = useActionState(generateMulmoScript, scriptInitialState)

  // FFmpeg処理ステート
type FfmpegState = { result: string }
const ffmpegInitialState: FfmpegState = { result: '' }
const [ffmpegState, ffmpegAction, ffmpegIsPending] = useActionState<FfmpegState, void>(
  runFfmpeg,
  ffmpegInitialState
)

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
                <p>ChatGPTの返答：</p>
                <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words text-sm">
                  {state.result}
                </pre>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* MulmoScript生成フォーム */}
      {state.result && (
        <form action={scriptAction}>
          {/* hidden inputで台本の結果を渡す */}
          <input type="hidden" name="scriptInput" value={state.result} />
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
                  <p className="font-bold mb-2">生成されたMulmoScript：</p>
                  <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words text-sm">
                    {scriptState.result}
                  </pre>
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
