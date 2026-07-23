import type { CaptionPlatformResult } from './types'

export function estimateBase64Bytes(dataUrl: string): number {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1]! : dataUrl
  return Math.floor((base64.length * 3) / 4)
}

export function buildUserText(tone?: string, mediaHint?: string): string {
  const parts = ['请根据以上画面生成三平台文案。']
  if (mediaHint?.trim()) parts.push(`媒体说明：${mediaHint.trim()}`)
  if (tone?.trim()) parts.push(`主题/语气偏好：${tone.trim()}`)
  parts.push('严格只返回 JSON。')
  return parts.join('\n')
}

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim())
    }
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1))
    }
    throw new Error('模型未返回有效 JSON')
  }
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function asTags(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item).replace(/^#/, '').trim())
    .filter(Boolean)
    .slice(0, 8)
}

export function normalizeCaptionResult(raw: unknown): CaptionPlatformResult {
  if (!raw || typeof raw !== 'object') {
    throw new Error('文案结构无效')
  }
  const data = raw as Record<string, unknown>
  const xhs = (data.xhs ?? {}) as Record<string, unknown>
  const douyin = (data.douyin ?? {}) as Record<string, unknown>
  const moments = (data.moments ?? {}) as Record<string, unknown>

  const result: CaptionPlatformResult = {
    xhs: {
      title: asString(xhs.title),
      body: asString(xhs.body),
      tags: asTags(xhs.tags),
    },
    douyin: {
      title: asString(douyin.title),
      script: asString(douyin.script),
      tags: asTags(douyin.tags),
    },
    moments: {
      text: asString(moments.text),
    },
  }

  if (!result.xhs.title && !result.xhs.body && !result.douyin.script && !result.moments.text) {
    throw new Error('文案内容为空，请重试')
  }

  return result
}
