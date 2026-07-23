import { SYSTEM_PROMPT } from './prompts'
import { buildUserText, extractJsonObject, normalizeCaptionResult } from './parse'
import type { CaptionPlatformResult } from './types'

const DEFAULT_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const DEFAULT_MODEL = 'doubao-1.5-vision-pro-32k-250115'

export type ArkCallOptions = {
  apiKey: string
  images: string[]
  tone?: string
  mediaHint?: string
  model?: string
  endpoint?: string
}

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

export async function callArkVision(options: ArkCallOptions): Promise<CaptionPlatformResult> {
  const model = options.model?.trim() || DEFAULT_MODEL
  const endpoint = options.endpoint?.trim() || DEFAULT_ENDPOINT

  const content: ContentPart[] = options.images.map((url) => ({
    type: 'image_url',
    image_url: { url },
  }))
  content.push({ type: 'text', text: buildUserText(options.tone, options.mediaHint) })

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(55_000),
  })

  const rawText = await response.text()
  let payload: Record<string, unknown> = {}
  try {
    payload = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {}
  } catch {
    throw new Error(`方舟返回非 JSON（HTTP ${response.status}）`)
  }

  if (!response.ok) {
    const errObj = payload.error as { message?: string } | string | undefined
    const message =
      typeof errObj === 'string'
        ? errObj
        : errObj?.message || (payload.message as string) || `方舟请求失败（HTTP ${response.status}）`
    throw new Error(message)
  }

  const choices = payload.choices as Array<{ message?: { content?: string } }> | undefined
  const contentText = choices?.[0]?.message?.content
  if (!contentText || typeof contentText !== 'string') {
    throw new Error('方舟未返回文案内容')
  }

  return normalizeCaptionResult(extractJsonObject(contentText))
}

export { DEFAULT_MODEL, DEFAULT_ENDPOINT }
