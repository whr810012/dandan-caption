export type CaptionPlatformResult = {
  xhs: { title: string; body: string; tags: string[] }
  douyin: { title: string; script: string; tags: string[] }
  moments: { text: string }
}

export type CaptionGenRequest = {
  images?: string[]
  tone?: string
  apiKey?: string
  model?: string
  mediaHint?: string
}

export type CaptionGenResponse = {
  result?: CaptionPlatformResult
  error?: string
  mock?: boolean
}

export type HandlerEnv = {
  arkApiKey?: string
  arkModel?: string
  arkEndpoint?: string
  allowedOrigin?: string
  maxPayloadBytes?: number
}
