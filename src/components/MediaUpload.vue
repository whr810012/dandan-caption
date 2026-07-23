<script setup lang="ts">
import { ref } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'

const store = useWorkspaceStore()
const dragging = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function openPicker() {
  inputRef.value?.click()
}

async function onFiles(files: FileList | null) {
  if (!files?.length) return
  await store.addFiles(files)
}

function onDrop(event: DragEvent) {
  dragging.value = false
  void onFiles(event.dataTransfer?.files ?? null)
}
</script>

<template>
  <section class="upload">
    <div
      class="drop"
      :class="{ 'drop--active': dragging }"
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      role="button"
      tabindex="0"
      aria-label="上传图片或视频"
    >
      <span class="drop__mark" aria-hidden="true">↑</span>
      <strong>把图片或短视频丢进来</strong>
      <p>最多 9 张图，或 1 个视频（自动抽关键帧）</p>
      <input
        ref="inputRef"
        class="sr-only"
        type="file"
        accept="image/*,video/*"
        multiple
        @change="
          onFiles(($event.target as HTMLInputElement).files);
          ($event.target as HTMLInputElement).value = ''
        "
      />
    </div>

    <div v-if="store.items.length" class="thumbs">
      <article v-for="item in store.items" :key="item.id" class="thumb">
        <video v-if="item.kind === 'video'" :src="item.previewUrl" muted playsinline />
        <img v-else :src="item.previewUrl" :alt="item.name" />
        <button class="thumb__x" type="button" aria-label="移除" @click="store.removeItem(item.id)">×</button>
        <span class="thumb__label">{{ item.kind === 'video' ? '视频' : '图片' }}</span>
      </article>
      <button class="btn btn--ghost btn--sm clear" type="button" @click="store.clearMedia">清空</button>
    </div>
  </section>
</template>

<style scoped>
.upload {
  display: grid;
  gap: 14px;
}

.drop {
  display: grid;
  place-items: center;
  gap: 6px;
  min-height: 180px;
  padding: 28px 20px;
  border: 2px dashed color-mix(in oklab, var(--color-ink) 18%, transparent);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--color-accent) 22%, white), transparent 70%),
    #fff;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 160ms,
    transform 160ms var(--ease-press),
    background 160ms;
}

.drop:hover,
.drop--active {
  border-color: var(--color-accent-2);
  transform: translateY(-2px);
}

.drop__mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 4px;
  border-radius: 50%;
  background: var(--color-ink);
  color: var(--color-accent);
  font-size: 1.25rem;
  font-weight: 800;
}

.drop strong {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.drop p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
}

.thumb {
  position: relative;
  width: 88px;
  height: 88px;
  overflow: hidden;
  border-radius: 14px;
  background: var(--color-paper-3);
  box-shadow: var(--shadow-soft);
}

.thumb img,
.thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb__x {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  background: oklch(20% 0.02 250 / 0.72);
  color: #fff;
  cursor: pointer;
}

.thumb__label {
  position: absolute;
  left: 6px;
  bottom: 6px;
  padding: 2px 6px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.88);
  font-size: 10px;
  font-weight: 700;
}

.clear {
  align-self: center;
}
</style>
