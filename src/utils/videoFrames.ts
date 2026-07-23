import { compressDataUrl } from './mediaCompress'

export type VideoFrameBundle = {
  frames: string[]
  durationSec: number
  width: number
  height: number
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('视频定位失败'))
    }
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
    }
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)
    video.currentTime = Math.min(Math.max(time, 0), Math.max(video.duration - 0.05, 0))
  })
}

function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth || 640
  canvas.height = video.videoHeight || 360
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法抽取视频帧')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.85)
}

export async function extractVideoFrames(file: File, frameCount = 7): Promise<VideoFrameBundle> {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.preload = 'auto'
  video.muted = true
  video.playsInline = true
  video.src = url

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error('视频读取失败'))
    })

    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1
    const count = Math.max(3, Math.min(frameCount, 8))
    const times: number[] = []
    for (let i = 0; i < count; i += 1) {
      const t = ((i + 0.5) / count) * duration
      times.push(t)
    }

    const frames: string[] = []
    for (const time of times) {
      await seekVideo(video, time)
      const raw = captureFrame(video)
      frames.push(await compressDataUrl(raw, 960))
    }

    return {
      frames,
      durationSec: duration,
      width: video.videoWidth,
      height: video.videoHeight,
    }
  } finally {
    URL.revokeObjectURL(url)
    video.removeAttribute('src')
    video.load()
  }
}
