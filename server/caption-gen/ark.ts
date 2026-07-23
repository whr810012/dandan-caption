import { SYSTEM_PROMPT } from './prompts'
import { buildUserText, extractJsonObject, normalizeCaptionResult } from './parse'
import type { CaptionPlatformResult } from './types'

/** Chat Completions：https://ark.cn-beijing.volces.com/api/v3/chat/completions */
export const DEFAULT_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'

/** 官方 Model ID（Seed-2.1-pro 260628，支持图/视频理解） */
export const DEFAULT_MODEL = 'doubao-seed-2-1-pro-260628'

const MODEL_ALIASES: Record<string, string> = {
  'doubao-seed-2-1-pro': DEFAULT_MODEL,
}

const INVALID_MODELS = new Set([
  'doubao-1.5-vision-pro-32k-250115',
  'doubao-1.5-vision-pro',
  'doubao-1-5-vision-pro-32k-250115',
  'doubao-seed-1-6-vision-250815',
])

export function resolveModelId(model?: string): string {
  const value = model?.trim() || ''
  if (!value || INVALID_MODELS.has(value)) return DEFAULT_MODEL
  if (MODEL_ALIASES[value]) return MODEL_ALIASES[value]
  return value
}

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

/**
 * 按官方 Chat Completions 示例调用视觉理解：
 * messages[].content = [{ type: image_url, image_url: { url } }, { type: text, text }]
 * model = doubao-seed-2-1-pro-260628
 * reasoning_effort = minimal（文案场景无需深度思考，降延迟/费用）
 */
export async function callArkVision(options: ArkCallOptions): Promise<CaptionPlatformResult> {
  const model = resolveModelId(options.model)
  const endpoint = options.endpoint?.trim() || DEFAULT_ENDPOINT
  const apiKey = options.apiKey
    .trim()
    .replace(/^Bearer\s+/i, '')
    .replace(/^["']|["']$/g, '')
    .trim()
  if (!apiKey) {
    throw new Error('API Key 为空')
  }

  const content: ContentPart[] = options.images.map((url) => ({
    type: 'image_url',
    image_url: { url },
  }))
  content.push({ type: 'text', text: buildUserText(options.tone, options.mediaHint) })

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content },
      ],
      // 官方 Seed-2.1 支持；minimal = 不思考，适合结构化文案
      reasoning_effort: 'minimal',
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
