// app/lib/actions/chatgpt.ts
'use server'

import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function submitTextForm(
  prevState: { result: string },
  formData: FormData
): Promise<{ result: string }> {
  const inputText = formData.get('input') as string

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: inputText }],
      temperature: 0.7,
    })

    const reply = response.choices[0]?.message?.content || 'No response.'
    return { result: reply }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return { result: 'エラーが発生しました。' }
  }
}

export async function generateMulmoScript(
  prevState: { result: string },
  formData: FormData
): Promise<{ result: string }> {
  const inputText = formData.get('scriptInput') as string
  const instruction = process.env.MULMOCAST_INSTRUCTION
  const template = process.env.MULMOCAST_JSON_TEMPLATE
  console.log("instruction:" + instruction)
  console.log("template:" + template)

  if (!instruction || !template) {
    throw new Error('Environment variables MULMOCAST_INSTRUCTION or MULMOCAST_JSON_TEMPLATE are not defined')
  }

  const prompt = instruction + template + inputText // 必要に応じて結合調整してください

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const reply = response.choices[0]?.message?.content || 'No response.'
    return { result: reply }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return { result: 'エラーが発生しました。' }
  }
}