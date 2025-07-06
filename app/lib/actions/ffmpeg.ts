// src/lib/actions/ffmpeg.ts
'use server'

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR_PATH = process.env.OUTPUT_DIR_PATH!;
const PROCESSED_DIR_PATH = process.env.PROCESSED_DIR_PATH!;

function getVideoDuration(filePath: string): number {
  const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${filePath}`;
  const output = execSync(cmd).toString().trim();
  const duration = parseFloat(output);
  if (isNaN(duration)) throw new Error('無効な動画時間です。');
  return duration;
}

function trimVideo(input: string, output: string, duration: number): void {
  const trimmedDuration = (duration - 2).toFixed(2);
  const ffmpegCmd = [
    `ffmpeg -i "${input}"`,
    `-filter_complex "[0:v]trim=0:${trimmedDuration},setpts=PTS-STARTPTS[v];[0:a]asetpts=PTS-STARTPTS[a]"`,
    `-map "[v]" -map "[a]"`,
    `-c:v libx264 -c:a aac`,
    `"${output}"`,
    `-y`
  ].join(' ');

  execSync(ffmpegCmd, { stdio: 'inherit' });
}

export type FfmpegState = { result: string }

// export async function runFfmpeg(prevState: FfmpegState, _payload: void): Promise<FfmpegState> {
//   try {
//     if (!fs.existsSync(inputFile)) throw new Error(`ファイルが存在しません: ${inputFile}`);
//     const duration = getVideoDuration(inputFile);
//     if (duration <= 2) throw new Error(`動画が短すぎます (${duration}秒)`);

//     trimVideo(inputFile, outputFile, duration);
//     return { result: `✅ 完了: ${outputFile}` }
//   } catch (err: any) {
//     return { result: `❌ エラー: ${err.message}` }
//   }
// }

export async function runFfmpegAll(): Promise<FfmpegState> {
  try {
    const files = fs.readdirSync(OUTPUT_DIR_PATH).filter(f => f.endsWith('.mp4'))
    if (files.length === 0) return { result: '⚠️ mp4ファイルが見つかりません。' }

    const logs: string[] = []

    for (const file of files) {
      const inputPath = path.join(OUTPUT_DIR_PATH, file)
      const outputPath = path.join(PROCESSED_DIR_PATH, file.replace(/\.mp4$/, '_processed.mp4'))

      try {
        const duration = getVideoDuration(inputPath)
        if (duration <= 2) {
          logs.push(`⏭️ スキップ（短すぎ）: ${file} (${duration}秒)`)
          continue
        }

        trimVideo(inputPath, outputPath, duration)
        logs.push(`✅ 処理完了: ${file} → ${path.basename(outputPath)}`)

        fs.unlinkSync(inputPath)
        logs.push(`🗑️ 削除: ${file}`)
      } catch (err: any) {
        logs.push(`❌ エラー (${file}): ${err.message}`)
      }
    }

    return { result: logs.join('\n') }

  } catch (err: any) {
    return { result: `❌ 全体エラー: ${err.message}` }
  }
}