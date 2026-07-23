import type { CaptionPlatformResult } from '../../server/caption-gen/types'

export type { CaptionPlatformResult }

export type GeneratePayload = {
  images: string[]
  tone?: string
  mediaHint?: string
  apiKey: string
  model: string
}

/**
 * 生产环境走 base 前缀：/caption/api/caption-gen
 * 这样经 dandanhub 的 /caption/* 代理能打到文案站 Function，
 * 而不会打到 hub 根路径 /api/caption-gen（会 404）。
 */
export function getCaptionApiUrl(): string {
  const configured = import.meta.env.VITE_CAPTION_API_URL as string | undefined
  if (configured?.trim()) return configured.trim()
  const base = import.meta.env.BASE_URL || '/'
  const normalized = base.endsWith('/') ? base : `${base}/`
  return `${normalized}api/caption-gen`
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
