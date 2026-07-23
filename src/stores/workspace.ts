import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { generateCaptions, type CaptionPlatformResult } from '../utils/captionApi'
import { getArkApiKey, getArkModel, resolveArkModel, validateArkModel } from '../utils/aiKeyStorage'
import { compressImageFile } from '../utils/mediaCompress'
import { extractVideoFrames } from '../utils/videoFrames'

export type MediaItem = {
  id: string
  kind: 'image' | 'video'
  name: string
  previewUrl: string
  /** data URLs sent to API */
  payloads: string[]
  hint?: string
}

const MAX_IMAGES = 9

export const useWorkspaceStore = defineStore('workspace', () => {
  const items = ref<MediaItem[]>([])
  const tone = ref('')
  const result = ref<CaptionPlatformResult | null>(null)
  const loading = ref(false)
  const error = ref('')
  const showKeySheet = ref(false)

  const canGenerate = computed(() => items.value.length > 0 && !loading.value)

  function revokeItem(item: MediaItem) {
    if (item.previewUrl.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl)
  }

  function clearMedia() {
    items.value.forEach(revokeItem)
    items.value = []
    result.value = null
    error.value = ''
  }

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList)
    error.value = ''

    for (const file of files) {
      if (file.type.startsWith('video/')) {
        if (items.value.some((item) => item.kind === 'video')) {
          error.value = '一次仅支持一个视频；请先清空后再换'
          break
        }
        if (items.value.some((item) => item.kind === 'image')) {
          error.value = '图片与视频请分开生成'
          break
        }
        loading.value = true
        try {
          const bundle = await extractVideoFrames(file)
          const previewUrl = URL.createObjectURL(file)
          items.value = [
            {
              id: crypto.randomUUID(),
              kind: 'video',
              name: file.name,
              previewUrl,
              payloads: bundle.frames,
              hint: `短视频关键帧 ${bundle.frames.length} 张，约 ${bundle.durationSec.toFixed(1)} 秒，${bundle.width}×${bundle.height}`,
            },
          ]
        } catch (err) {
          error.value = err instanceof Error ? err.message : '视频处理失败'
        } finally {
          loading.value = false
        }
        break
      }

      if (!file.type.startsWith('image/')) {
        error.value = '仅支持图片或视频'
        continue
      }
      if (items.value.some((item) => item.kind === 'video')) {
        error.value = '已有视频时请先清空，再上传图片'
        break
      }
      if (items.value.length >= MAX_IMAGES) {
        error.value = `最多 ${MAX_IMAGES} 张图片`
        break
      }

      try {
        const dataUrl = await compressImageFile(file)
        const previewUrl = URL.createObjectURL(file)
        items.value.push({
          id: crypto.randomUUID(),
          kind: 'image',
          name: file.name,
          previewUrl,
          payloads: [dataUrl],
        })
      } catch (err) {
        error.value = err instanceof Error ? err.message : '图片处理失败'
      }
    }
  }

  function removeItem(id: string) {
    const target = items.value.find((item) => item.id === id)
    if (target) revokeItem(target)
    items.value = items.value.filter((item) => item.id !== id)
  }

  async function generate() {
    error.value = ''
    const apiKey = getArkApiKey()
    if (!apiKey) {
      showKeySheet.value = true
      return
    }

    const model = resolveArkModel(getArkModel())
    const modelError = validateArkModel(model)
    if (modelError) {
      error.value = modelError
      showKeySheet.value = true
      return
    }

    const images = items.value.flatMap((item) => item.payloads)
    if (images.length === 0) {
      error.value = '请先上传图片或视频'
      return
    }

    const mediaHint = items.value
      .map((item) => item.hint)
      .filter(Boolean)
      .join('；')

    loading.value = true
    try {
      result.value = await generateCaptions({
        images,
        tone: tone.value,
        mediaHint,
        apiKey,
        model,
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : '生成失败'
      result.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    tone,
    result,
    loading,
    error,
    showKeySheet,
    canGenerate,
    addFiles,
    removeItem,
    clearMedia,
    generate,
  }
})
