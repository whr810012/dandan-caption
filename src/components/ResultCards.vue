<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CaptionPlatformResult } from '../utils/captionApi'

const props = defineProps<{
  result: CaptionPlatformResult
}>()

type Platform = 'xhs' | 'douyin' | 'moments'

const active = ref<Platform>('xhs')
const copied = ref('')

const tabs: { id: Platform; label: string; hint: string }[] = [
  { id: 'xhs', label: '小红书', hint: '标题 · 正文 · 话题' },
  { id: 'douyin', label: '抖音', hint: '标题 · 口播 · 话题' },
  { id: 'moments', label: '朋友圈', hint: '短文案' },
]

const currentText = computed(() => {
  const r = props.result
  if (active.value === 'xhs') {
    const tags = r.xhs.tags.map((t) => `#${t}`).join(' ')
    return [r.xhs.title, '', r.xhs.body, '', tags].filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n')
  }
  if (active.value === 'douyin') {
    const tags = r.douyin.tags.map((t) => `#${t}`).join(' ')
    return [r.douyin.title, '', r.douyin.script, '', tags].join('\n')
  }
  return r.moments.text
})

async function copyAll() {
  await navigator.clipboard.writeText(currentText.value)
  copied.value = active.value
  window.setTimeout(() => {
    if (copied.value === active.value) copied.value = ''
  }, 1600)
}
</script>

<template>
  <section class="results">
    <div class="tabs" role="tablist" aria-label="平台">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ 'tab--on': active === tab.id }"
        type="button"
        role="tab"
        :aria-selected="active === tab.id"
        @click="active = tab.id"
      >
        <strong>{{ tab.label }}</strong>
        <span>{{ tab.hint }}</span>
      </button>
    </div>

    <article class="card" role="tabpanel">
      <template v-if="active === 'xhs'">
        <h3>{{ result.xhs.title }}</h3>
        <p class="body">{{ result.xhs.body }}</p>
        <ul class="tags">
          <li v-for="tag in result.xhs.tags" :key="tag">#{{ tag }}</li>
        </ul>
      </template>
      <template v-else-if="active === 'douyin'">
        <h3>{{ result.douyin.title }}</h3>
        <p class="body">{{ result.douyin.script }}</p>
        <ul class="tags">
          <li v-for="tag in result.douyin.tags" :key="tag">#{{ tag }}</li>
        </ul>
      </template>
      <template v-else>
        <p class="body body--moments">{{ result.moments.text }}</p>
      </template>

      <button class="btn btn--coral btn--sm copy" type="button" @click="copyAll">
        {{ copied === active ? '已复制' : '复制全文' }}
      </button>
    </article>
  </section>
</template>

<style scoped>
.results {
  display: grid;
  gap: 12px;
}

.tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.tab {
  display: grid;
  gap: 2px;
  min-width: 0;
  padding: 12px 10px;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition:
    background 160ms,
    border-color 160ms,
    transform 140ms var(--ease-press);
}

.tab strong {
  font-size: 0.95rem;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.tab span {
  color: var(--color-muted);
  font-size: 0.72rem;
  overflow-wrap: anywhere;
}

.tab--on {
  border-color: color-mix(in oklab, var(--color-accent-2) 55%, var(--color-line));
  background: color-mix(in oklab, var(--color-accent-2) 14%, white);
  transform: translateY(-1px);
}

.tab:focus-visible {
  outline: 3px solid var(--color-accent-2);
  outline-offset: 2px;
}

.card {
  position: relative;
  padding: 22px 20px 64px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  background: #fff;
  box-shadow: var(--shadow-soft);
  min-height: 220px;
}

.card h3 {
  margin: 0 0 12px;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-style: normal;
  overflow-wrap: anywhere;
}

.body {
  margin: 0;
  white-space: pre-wrap;
  color: var(--color-ink-soft);
  overflow-wrap: anywhere;
}

.body--moments {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--color-ink);
  font-weight: 500;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

.tags li {
  padding: 5px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-paper-2);
  color: var(--color-ink-soft);
  font-size: 0.8rem;
  font-weight: 600;
}

.copy {
  position: absolute;
  right: 16px;
  bottom: 16px;
}
</style>
