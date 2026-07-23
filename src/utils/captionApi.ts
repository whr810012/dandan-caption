import type { CaptionPlatformResult } from '../../server/caption-gen/types'

export type { CaptionPlatformResult }

export type GeneratePayload = {
  images: string[]
  tone?: string
  mediaHint?: string
  apiKey: string
  model: string
}

export function getCaptionApiUrl(): string {
  const configured = import.meta.env.VITE_CAPTION_API_URL as string | undefined
  if (configured?.trim()) return configured.trim()
  return '/api/caption-gen'
}

export async function generateCaptions(payload: GeneratePayload): Promise<CaptionPlatformResult> {
  const response = await fetch(getCaptionApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  let data: { result?: CaptionPlatformResult; error?: string } = {}
  try {
    data = (await response.json()) as typeof data
  } catch {
    throw new Error(`服务返回异常（HTTP ${response.status}）`)
  }

  if (!response.ok || !data.result) {
    throw new Error(data.error || `生成失败（HTTP ${response.status}）`)
  }

  return data.result
}
