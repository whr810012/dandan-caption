<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import ApiKeySheet from '../components/ApiKeySheet.vue'
import MediaUpload from '../components/MediaUpload.vue'
import ResultCards from '../components/ResultCards.vue'
import { useWorkspaceStore } from '../stores/workspace'
import { hasArkApiKey } from '../utils/aiKeyStorage'

const store = useWorkspaceStore()
const { tone, result, loading, error, showKeySheet, canGenerate } = storeToRefs(store)
const keyConfigured = ref(hasArkApiKey())

function openKey() {
  store.showKeySheet = true
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
        <a href="/">蛋蛋中心</a>
        <button class="btn btn--ghost btn--sm" type="button" @click="openKey">
          {{ keyConfigured ? 'Key 已配置' : '配置 Key' }}
        </button>
      </nav>
    </header>

    <main>
      <section class="hero">
        <p class="kicker">UPLOAD · PARSE · POST</p>
        <h1>蛋蛋文案</h1>
        <p class="lead">上传图片或视频，AI 读懂画面，写出小红书、抖音、朋友圈三套可直接发的文案。</p>
      </section>

      <section class="workbench">
        <div class="panel panel--input">
          <div class="panel__head">
            <h2>1. 素材</h2>
            <span class="mono">MEDIA</span>
          </div>
          <MediaUpload />

          <label class="tone">
            <span>主题 / 语气（可选）</span>
            <input v-model="tone" type="text" placeholder="例如：探店种草、干货分享、轻松吐槽" />
          </label>

          <div class="gen-row">
            <button
              class="btn btn--ink"
              type="button"
              :disabled="!canGenerate"
              @click="onGenerate"
            >
              {{ loading ? '生成中…' : result ? '再生成' : '生成三平台文案' }}
            </button>
            <p v-if="error" class="error" role="alert">{{ error }}</p>
          </div>
        </div>

        <div class="panel panel--out">
          <div class="panel__head">
            <h2>2. 文案</h2>
            <span class="mono">COPY</span>
          </div>
          <ResultCards v-if="result" :result="result" />
          <div v-else class="empty">
            <p>左边放进画面，右边出现三套文案。</p>
            <ul>
              <li>小红书：标题 + 正文 + 话题</li>
              <li>抖音：标题 + 口播 + 话题</li>
              <li>朋友圈：短而真诚</li>
            </ul>
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
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  padding: 18px 0 40px;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
}

.brand__egg {
  width: 34px;
  height: 42px;
  border-radius: 50% 50% 48% 48%;
  background: var(--color-ink);
  box-shadow: inset 0 -10px 0 var(--color-accent);
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

.brand strong {
  display: block;
  font-size: 1.05rem;
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

nav > a {
  color: var(--color-ink-soft);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}

.hero {
  margin-bottom: 22px;
  animation: fade-up 480ms var(--ease-press) both;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
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
  letter-spacing: 0.12em;
}

.hero h1 {
  margin: 0;
  font-size: clamp(2.4rem, 8vw, 4.2rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1.05;
  font-style: normal;
  overflow-wrap: anywhere;
}

.lead {
  max-width: 36rem;
  margin: 12px 0 0;
  color: var(--color-ink-soft);
  font-size: 1.05rem;
}

.workbench {
  display: grid;
  gap: 14px;
  animation: fade-up 560ms 80ms var(--ease-press) both;
}

.panel {
  padding: 18px;
  border: 1px solid var(--color-line);
  border-radius: 28px;
  background: color-mix(in oklab, white 78%, var(--color-paper));
  box-shadow: var(--shadow-soft);
}

.panel__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
}

.panel__head h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-style: normal;
}

.mono {
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.tone {
  display: grid;
  gap: 8px;
  margin-top: 16px;
  font-size: 0.85rem;
  font-weight: 600;
}

.tone input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--color-line);
  border-radius: 12px;
  background: #fff;
}

.tone input:focus-visible {
  outline: 3px solid var(--color-accent-2);
  outline-offset: 2px;
}

.gen-row {
  display: grid;
  gap: 10px;
  margin-top: 16px;
  justify-items: start;
}

.error {
  margin: 0;
  color: var(--color-accent-3);
  font-size: 0.9rem;
  font-weight: 600;
}

.empty {
  padding: 28px 8px 12px;
  color: var(--color-muted);
}

.empty p {
  margin: 0 0 12px;
  color: var(--color-ink-soft);
  font-weight: 600;
}

.empty ul {
  margin: 0;
  padding-left: 1.1rem;
}

.foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;
  color: var(--color-muted);
  font-size: 0.78rem;
}

@media (min-width: 900px) {
  .workbench {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    align-items: start;
  }

  .hero {
    margin-bottom: 28px;
  }
}
</style>
