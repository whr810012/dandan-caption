const KEY_STORAGE = 'dandan.caption.arkApiKey'
const MODEL_STORAGE = 'dandan.caption.arkModel'

/**
 * 官方 Model ID（含版本日期），可直接调预置推理：
 * https://console.volcengine.com/ark/region:cn-beijing/model/detail?name=doubao-seed-2-1-pro
 */
export const DEFAULT_ARK_MODEL = 'doubao-seed-2-1-pro-260628'
export const MODEL_PLACEHOLDER = 'doubao-seed-2-1-pro-260628'

/** 缺版本号的商品名 → 补全为官方 Model ID */
const MODEL_ALIASES: Record<string, string> = {
  'doubao-seed-2-1-pro': DEFAULT_ARK_MODEL,
}

/** 已下线 / 无效，需换掉 */
const INVALID_MODELS = new Set([
  'doubao-1.5-vision-pro-32k-250115',
  'doubao-1.5-vision-pro',
  'doubao-1-5-vision-pro-32k-250115',
  'doubao-seed-1-6-vision-250815',
])

export const ARK_API_KEY_URL = 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey'
export const ARK_ENDPOINT_URL =
  'https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint'
export const ARK_MODEL_LIST_URL = 'https://www.volcengine.com/docs/82379/1330310'
export const ARK_VISION_DOC_URL = 'https://www.volcengine.com/docs/82379/1399008?lang=zh'
export const ARK_SEED21_MODEL_URL =
  'https://console.volcengine.com/ark/region:cn-beijing/model/detail?name=doubao-seed-2-1-pro&agentMode=close'

export function normalizeArkApiKey(raw: string): string {
  return raw
    .trim()
    .replace(/^Bearer\s+/i, '')
    .replace(/^["']|["']$/g, '')
    .trim()
}

/** 统一解析：别名补全、无效清空、空则默认官方 Model ID */
export function resolveArkModel(model?: string | null): string {
  const value = model?.trim() || ''
  if (!value) return DEFAULT_ARK_MODEL
  if (INVALID_MODELS.has(value)) return DEFAULT_ARK_MODEL
  if (MODEL_ALIASES[value]) return MODEL_ALIASES[value]
  return value
}

/** 返回校验错误；空字符串表示可用 */
export function validateArkModel(model: string): string {
  const value = model.trim()
  if (!value) return ''
  if (INVALID_MODELS.has(value)) {
    return `「${value}」已不可用，请改用 ${DEFAULT_ARK_MODEL} 或 ep- 接入点`
  }
  if (MODEL_ALIASES[value]) {
    return `请改用完整 Model ID：${MODEL_ALIASES[value]}（不要省略版本号 -260628）`
  }
  return ''
}

export function getArkApiKey(): string {
  try {
    return normalizeArkApiKey(localStorage.getItem(KEY_STORAGE) ?? '')
  } catch {
    return ''
  }
}

export function setArkApiKey(key: string): void {
  localStorage.setItem(KEY_STORAGE, normalizeArkApiKey(key))
}

export function clearArkApiKey(): void {
  localStorage.removeItem(KEY_STORAGE)
}

export function hasArkApiKey(): boolean {
  return getArkApiKey().length > 0
}

export function getArkModel(): string {
  try {
    const resolved = resolveArkModel(localStorage.getItem(MODEL_STORAGE))
    localStorage.setItem(MODEL_STORAGE, resolved)
    return resolved
  } catch {
    return DEFAULT_ARK_MODEL
  }
}

export function setArkModel(model: string): void {
  localStorage.setItem(MODEL_STORAGE, resolveArkModel(model))
}
