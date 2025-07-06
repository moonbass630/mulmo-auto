'use server'

import { writeFileSync } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export type SaveScriptState = { result: string }

export async function saveScriptToFile(_: SaveScriptState, formData: FormData): Promise<SaveScriptState> {
  const content = formData.get('editableScript')

  if (typeof content !== 'string') {
    return { result: '保存失敗: 無効なデータ' }
  }
  // 現在の日時をフォーマット：YYYYMMDDHHMMSS
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(
    now.getHours()
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}`

  // ファイル名にタイムスタンプを使用
  const filename = `${timestamp}.json`
  const outputPath = path.join(`${process.env.MULMO_SCRIPT_PATH}`, filename)
  writeFileSync(outputPath, content, 'utf-8')

  return { result: `保存成功: ${outputPath}` }
}

// mulmo movie 実行処理
export type MulmoRunState = { result: string }

export async function runMulmoMovie(_: MulmoRunState, formData: FormData): Promise<MulmoRunState> {
  const filename = formData.get('filename')
  if (typeof filename !== 'string') {
    return { result: '実行失敗: ファイル名が無効です' }
  }

  const scriptpath = process.env.MULMO_SCRIPT_PATH
  if (!scriptpath) {
    return { result: '実行失敗: 環境変数 MULMO_SCRIPT_PATH が設定されていません。' }
  }
  const filepath = path.join(scriptpath, filename)
  console.log(filepath)

  // const command = `mulmo movie ${filepath} -c ja -o ./movies/output`
  const command = `mulmo movie ${filepath} -c ja -o ${process.env.OUTPUT_DIR_PATH}`
  try {
    const { stdout, stderr } = await execAsync(command)

    return { result: `実行成功:\n${stdout || stderr}` }
  } catch (error: any) {
    return { result: `実行失敗:\n${error.message}` }
  }
}