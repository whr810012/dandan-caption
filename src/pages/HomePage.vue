<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import ApiKeySheet from '../components/ApiKeySheet.vue'
import MediaUpload from '../components/MediaUpload.vue'
import ResultCards from '../components/ResultCards.vue'
import { useWorkspaceStore } from '../stores/workspace'
import { hasArkApiKey } from '../utils/aiKeyStorage'

const store = useWorkspaceStore()
const { tone, result, loading, error, showKeySheet, canGenerate, items } = storeToRefs(store)
const keyConfigured = ref(hasArkApiKey())

const tonePresets = ['探店种草', '干货分享', '轻松吐槽', '氛围感日常', '产品开箱']

function openKey() {
  store.showKeySheet = true
}

function pickTone(value: string) {
  store.tone = store.tone === value ? '' : value
}

async function onGenerate() {
  await store.generate()
}

function onKeySaved() {
  keyConfigured.value = hasArkApiKey()
  void store.generate()
}
</script>

<template>
  <div class="page">
    <header class="top">
      <a class="brand" href="/caption/" aria-label="蛋蛋文案首页">
        <span class="brand__egg" aria-hidden="true" />
        <span>
          <strong>蛋蛋文案</strong>
          <small>DANDAN CAPTION</small>
        </span>
      </a>
      <nav>
        <a class="nav-link" href="/">蛋蛋中心</a>
        <button
          class="key-pill"
          :class="{ 'key-pill--on': keyConfigured }"
          type="button"
          @click="openKey"
        >
          <i aria-hidden="true" />
          {{ keyConfigured ? 'Key 已就绪' : '配置 Key' }}
        </button>
      </nav>
    </header>

    <main>
      <section class="hero">
        <div class="hero__copy">
          <p class="kicker">UPLOAD · READ · WRITE</p>
          <h1>蛋蛋文案</h1>
          <p class="lead">丢进一张图或一段视频，马上拿到小红书、抖音、朋友圈三套能直接发的文案。</p>
        </div>
        <aside class="hero__rail" aria-hidden="true">
          <span class="rail-chip rail-chip--xhs">小红书</span>
          <span class="rail-chip rail-chip--dy">抖音</span>
          <span class="rail-chip rail-chip--wx">朋友圈</span>
        </aside>
      </section>

      <section class="workbench">
        <div class="panel panel--in">
          <div class="panel__head">
            <div>
              <span class="step">01</span>
              <h2>放进画面</h2>
            </div>
            <span class="mono">MEDIA</span>
          </div>

          <MediaUpload />

          <div class="tone-block">
            <div class="tone-block__label">
              <span>语气偏好</span>
              <small>可选 · 点选或自填</small>
            </div>
            <div class="chips" role="group" aria-label="语气预设">
              <button
                v-for="preset in tonePresets"
                :key="preset"
                class="chip"
                :class="{ 'chip--on': tone === preset }"
                type="button"
                @click="pickTone(preset)"
              >
                {{ preset }}
              </button>
            </div>
            <input
              v-model="tone"
              class="tone-input"
              type="text"
              placeholder="自定义主题 / 语气，例如：周末咖啡店探店"
            />
          </div>

          <div class="gen-bar">
            <button
              class="btn btn--pear btn--lg btn--block"
              type="button"
              :disabled="!canGenerate"
              @click="onGenerate"
            >
              <span v-if="loading" class="btn__spin" aria-hidden="true" />
              {{ loading ? '正在读图写文…' : result ? '再写一套' : '生成三平台文案' }}
            </button>
            <p class="gen-hint">
              <template v-if="items.length">已选 {{ items.length }} 个素材</template>
              <template v-else>先上传图片或视频</template>
            </p>
            <p v-if="error" class="error" role="alert">{{ error }}</p>
          </div>
        </div>

        <div class="panel panel--out">
          <div class="panel__head">
            <div>
              <span class="step step--cyan">02</span>
              <h2>拿走文案</h2>
            </div>
            <span class="mono">COPY</span>
          </div>

          <ResultCards v-if="result" :result="result" />

          <div v-else class="empty">
            <p class="empty__title">文案会在这里排好队</p>
            <div class="platform-preview">
              <article class="preview-tile preview-tile--xhs">
                <strong>小红书</strong>
                <span>标题 + 正文 + 话题</span>
              </article>
              <article class="preview-tile preview-tile--dy">
                <strong>抖音</strong>
                <span>标题 + 口播 + 话题</span>
              </article>
              <article class="preview-tile preview-tile--wx">
                <strong>朋友圈</strong>
                <span>短而真诚的一句</span>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="foot">
      <span>BYOK · 火山方舟视觉理解</span>
      <span>© 蛋蛋文案</span>
    </footer>

    <ApiKeySheet
      :open="showKeySheet"
      @close="store.showKeySheet = false"
      @saved="onKeySaved"
    />
  </div>
</template>

<style scoped>
.page {
  width: min(1180px, calc(100% - 28px));
  margin: 0 auto;
  padding: 16px 0 48px;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
}

.brand__egg {
  width: 36px;
  height: 44px;
  border-radius: 50% 50% 48% 48%;
  background: var(--color-ink);
  box-shadow: inset 0 -12px 0 var(--color-accent);
  animation: wobble 3.2s ease-in-out infinite;
}

@keyframes wobble {
  0%,
  100% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

.brand:hover .brand__egg {
  animation-duration: 0.7s;
}

.brand strong {
  display: block;
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.brand small {
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
}

nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-link {
  color: var(--color-ink-soft);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}

.nav-link:hover {
  color: var(--color-accent-2);
}

.key-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.55rem 0.95rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: #fff;
  color: var(--color-ink);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 160ms,
    border-color 160ms,
    transform 140ms var(--ease-press);
}

.key-pill i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-muted);
}

.key-pill--on {
  border-color: color-mix(in oklab, var(--color-mint) 45%, var(--color-line));
  background: color-mix(in oklab, var(--color-mint) 18%, white);
}

.key-pill--on i {
  background: oklch(55% 0.16 150);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-mint) 35%, transparent);
}

.key-pill:hover {
  transform: translateY(-1px);
}

.key-pill:focus-visible {
  outline: 3px solid var(--color-accent-2);
  outline-offset: 2px;
}

.hero {
  display: grid;
  gap: 18px;
  margin-bottom: 20px;
  animation: fade-up 420ms var(--ease-press) both;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.kicker {
  margin: 0 0 8px;
  color: var(--color-accent-2);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.hero h1 {
  margin: 0;
  font-size: clamp(2.6rem, 9vw, 4.4rem);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 0.98;
  font-style: normal;
  overflow-wrap: anywhere;
}

.lead {
  max-width: 34rem;
  margin: 14px 0 0;
  color: var(--color-ink-soft);
  font-size: 1.08rem;
}

.hero__rail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: start;
}

.rail-chip {
  padding: 0.55rem 0.9rem;
  border-radius: var(--radius-pill);
  font-size: 0.82rem;
  font-weight: 800;
  animation: fade-up 520ms var(--ease-press) both;
}

.rail-chip--xhs {
  background: color-mix(in oklab, var(--color-xhs) 16%, white);
  color: var(--color-xhs);
  animation-delay: 40ms;
}

.rail-chip--dy {
  background: color-mix(in oklab, var(--color-douyin) 12%, white);
  color: var(--color-douyin);
  animation-delay: 90ms;
}

.rail-chip--wx {
  background: color-mix(in oklab, var(--color-moments) 18%, white);
  color: var(--color-moments);
  animation-delay: 140ms;
}

.workbench {
  display: grid;
  gap: 14px;
  animation: fade-up 520ms 60ms var(--ease-press) both;
}

.panel {
  padding: 20px;
  border: 1px solid var(--color-line);
  border-radius: 28px;
  box-shadow: var(--shadow-soft);
  transition:
    transform 180ms var(--ease-press),
    box-shadow 180ms;
}

.panel--in {
  background: color-mix(in oklab, var(--color-accent) 10%, white);
}

.panel--out {
  background: color-mix(in oklab, var(--color-accent-2) 8%, white);
  min-height: 420px;
}

.panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.panel__head > div {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.step {
  display: inline-grid;
  place-items: center;
  min-width: 2rem;
  padding: 0.2rem 0.45rem;
  border-radius: 10px;
  background: var(--color-ink);
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
}

.step--cyan {
  background: var(--color-accent-2);
  color: #fff;
}

.panel__head h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  font-style: normal;
  overflow-wrap: anywhere;
}

.mono {
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.tone-block {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.tone-block__label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.88rem;
  font-weight: 700;
}

.tone-block__label small {
  color: var(--color-muted);
  font-weight: 500;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 0.45rem 0.85rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: #fff;
  color: var(--color-ink-soft);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 150ms,
    border-color 150ms,
    color 150ms,
    transform 140ms var(--ease-press);
}

.chip:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--color-accent-2) 40%, var(--color-line));
}

.chip--on {
  border-color: transparent;
  background: var(--color-ink);
  color: var(--color-accent);
}

.chip:focus-visible {
  outline: 3px solid var(--color-accent-2);
  outline-offset: 2px;
}

.tone-input {
  width: 100%;
  padding: 0.8rem 0.95rem;
  border: 1px solid var(--color-line);
  border-radius: 14px;
  background: #fff;
}

.tone-input:focus-visible {
  outline: 3px solid var(--color-accent-2);
  outline-offset: 2px;
}

.gen-bar {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.gen-hint {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.82rem;
  font-weight: 600;
}

.error {
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: color-mix(in oklab, var(--color-accent-3) 12%, white);
  color: var(--color-accent-3);
  font-size: 0.88rem;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.empty {
  display: grid;
  gap: 16px;
  padding: 8px 0 4px;
}

.empty__title {
  margin: 0;
  color: var(--color-ink-soft);
  font-size: 1rem;
  font-weight: 700;
}

.platform-preview {
  display: grid;
  gap: 10px;
}

.preview-tile {
  display: grid;
  gap: 4px;
  padding: 16px 18px;
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--shadow-soft);
  transition:
    transform 160ms var(--ease-press),
    background 160ms;
}

.preview-tile:hover {
  transform: translateY(-3px);
}

.preview-tile strong {
  font-size: 1rem;
  font-weight: 800;
}

.preview-tile span {
  color: var(--color-muted);
  font-size: 0.85rem;
}

.preview-tile--xhs {
  background: color-mix(in oklab, var(--color-xhs) 8%, white);
}

.preview-tile--xhs:hover {
  background: color-mix(in oklab, var(--color-xhs) 14%, white);
}

.preview-tile--dy {
  background: color-mix(in oklab, var(--color-douyin) 7%, white);
}

.preview-tile--dy:hover {
  background: color-mix(in oklab, var(--color-douyin) 12%, white);
}

.preview-tile--wx {
  background: color-mix(in oklab, var(--color-moments) 10%, white);
}

.preview-tile--wx:hover {
  background: color-mix(in oklab, var(--color-moments) 16%, white);
}

.foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;
  color: var(--color-muted);
  font-size: 0.78rem;
}

@media (min-width: 760px) {
  .hero {
    grid-template-columns: minmax(0, 1.3fr) auto;
    align-items: end;
  }

  .hero__rail {
    flex-direction: column;
    align-items: stretch;
  }

  .platform-preview {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 960px) {
  .workbench {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    align-items: start;
  }

  .panel--out {
    position: sticky;
    top: 16px;
  }
}

@media (max-width: 759px) {
  .tone-block__label {
    flex-direction: column;
    align-items: flex-start;
  }

  .foot {
    flex-direction: column;
  }
}
</style>
