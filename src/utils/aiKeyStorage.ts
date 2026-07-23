const KEY_STORAGE = 'dandan.caption.arkApiKey'
const MODEL_STORAGE = 'dandan.caption.arkModel'

export const DEFAULT_ARK_MODEL = 'doubao-1.5-vision-pro-32k-250115'
export const ARK_API_KEY_URL = 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey'
export const ARK_VISION_DOC_URL = 'https://www.volcengine.com/docs/82379/1362931'

export function getArkApiKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE)?.trim() ?? ''
  } catch {
    return ''
  }
}

export function setArkApiKey(key: string): void {
  localStorage.setItem(KEY_STORAGE, key.trim())
}

export function clearArkApiKey(): void {
  localStorage.removeItem(KEY_STORAGE)
}

export function hasArkApiKey(): boolean {
  return getArkApiKey().length > 0
}

export function getArkModel(): string {
  try {
    return localStorage.getItem(MODEL_STORAGE)?.trim() || DEFAULT_ARK_MODEL
  } catch {
    return DEFAULT_ARK_MODEL
  }
}

export function setArkModel(model: string): void {
  const value = model.trim() || DEFAULT_ARK_MODEL
  localStorage.setItem(MODEL_STORAGE, value)
}
