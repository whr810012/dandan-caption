import { callArkVision, DEFAULT_MODEL } from './ark'
import { estimateBase64Bytes } from './parse'
import type { CaptionGenRequest, CaptionGenResponse, CaptionPlatformResult, HandlerEnv } from './types'

const DEFAULT_MAX_PAYLOAD = 5.5 * 1024 * 1024
const MAX_IMAGES = 9

export function corsHeaders(origin = '*', contentType = 'application/json'): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': contentType,
  }
}

function mockResult(tone?: string): CaptionPlatformResult {
  const tip = tone?.trim() ? `（${tone.trim()}）` : ''
  return {
    xhs: {
      title: `今日份画面分享${tip}`,
      body: '刚拍到这组画面，光影和细节都挺有感觉。先存档，也想问问你们会怎么配文～',
      tags: ['日常碎片', '记录生活', '氛围感'],
    },
    douyin: {
      title: `画面一帧就心动${tip}`,
      script: '先看这帧画面。不用说太多，把感觉留下就好。你更喜欢哪一刻？评论区告诉我。',
      tags: ['日常vlog', '氛围感'],
    },
    moments: {
      text: '把这一刻留下来。光刚刚好，人刚刚好。',
    },
  }
}

export async function handleCaptionGen(
  body: CaptionGenRequest,
  env: HandlerEnv = {},
): Promise<{ status: number; body: CaptionGenResponse }> {
  const images = Array.isArray(body.images) ? body.images.filter((item) => typeof item === 'string' && item) : []
  const tone = typeof body.tone === 'string' ? body.tone : ''
  const mediaHint = typeof body.mediaHint === 'string' ? body.mediaHint : ''
  const maxBytes = env.maxPayloadBytes ?? DEFAULT_MAX_PAYLOAD

  if (images.length === 0) {
    return { status: 400, body: { error: '请至少上传一张图片或视频关键帧' } }
  }
  if (images.length > MAX_IMAGES) {
    return { status: 400, body: { error: `最多支持 ${MAX_IMAGES} 张图片/帧` } }
  }

  let totalBytes = 0
  for (const image of images) {
    if (!image.startsWith('data:image/')) {
      return { status: 400, body: { error: '图片须为 data URL（data:image/...）' } }
    }
    totalBytes += estimateBase64Bytes(image)
  }
  if (totalBytes > maxBytes) {
    return { status: 413, body: { error: '素材过大，请减少图片数量或改用更短视频后重试' } }
  }

  const apiKey = (body.apiKey || env.arkApiKey || '').trim()
  if (!apiKey) {
    return { status: 400, body: { error: '请先填写火山方舟 Ark API Key' } }
  }

  if (apiKey === 'mock') {
    return { status: 200, body: { result: mockResult(tone), mock: true } }
  }

  const model = (body.model || env.arkModel || DEFAULT_MODEL).trim()

  try {
    const result = await callArkVision({
      apiKey,
      images,
      tone,
      mediaHint,
      model,
      endpoint: env.arkEndpoint,
    })
    return { status: 200, body: { result } }
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成失败'
    if (message.includes('timeout') || message.includes('aborted') || message.includes('超时')) {
      return { status: 504, body: { error: '生成超时，请减少图片或缩短视频后重试' } }
    }
    return { status: 502, body: { error: message } }
  }
}
