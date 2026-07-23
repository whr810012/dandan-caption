<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ARK_API_KEY_URL,
  ARK_VISION_DOC_URL,
  getArkApiKey,
  getArkModel,
  setArkApiKey,
  setArkModel,
} from '../utils/aiKeyStorage'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const apiKey = ref('')
const model = ref('')
const showKey = ref(false)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    apiKey.value = getArkApiKey()
    model.value = getArkModel()
  },
  { immediate: true },
)

const canSave = computed(() => apiKey.value.trim().length > 0)

function save() {
  if (!canSave.value) return
  setArkApiKey(apiKey.value)
  setArkModel(model.value)
  emit('saved')
  emit('close')
}
</script>

<template>
  <div v-if="open" class="sheet" role="dialog" aria-modal="true" aria-labelledby="key-title">
    <button class="sheet__backdrop" type="button" aria-label="关闭" @click="emit('close')" />
    <div class="sheet__panel">
      <p class="mono">BYOK · VOLCENGINE ARK</p>
      <h2 id="key-title">填写你的方舟 Key</h2>
      <p class="lead">
        Key 只保存在本机浏览器，请求经本站代理转发到火山方舟，不会写入我们的服务器配置。
      </p>

      <label class="field">
        <span>Ark API Key</span>
        <div class="row">
          <input
            v-model="apiKey"
            :type="showKey ? 'text' : 'password'"
            autocomplete="off"
            placeholder="粘贴方舟 API Key"
          />
          <button class="btn btn--ghost btn--sm" type="button" @click="showKey = !showKey">
            {{ showKey ? '隐藏' : '显示' }}
          </button>
        </div>
      </label>

      <label class="field">
        <span>视觉模型 / 接入点 ID</span>
        <input v-model="model" type="text" placeholder="如 doubao-1.5-vision-pro-32k-250115" />
      </label>

      <p class="links">
        <a :href="ARK_API_KEY_URL" target="_blank" rel="noopener">获取 API Key</a>
        ·
        <a :href="ARK_VISION_DOC_URL" target="_blank" rel="noopener">视觉理解文档</a>
      </p>

      <div class="actions">
        <button class="btn btn--ghost" type="button" @click="emit('close')">取消</button>
        <button class="btn btn--ink" type="button" :disabled="!canSave" @click="save">保存并继续</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sheet {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: end center;
  padding: 16px;
}

.sheet__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: oklch(20% 0.02 250 / 0.45);
  cursor: pointer;
}

.sheet__panel {
  position: relative;
  z-index: 1;
  width: min(520px, 100%);
  padding: 28px 24px 22px;
  border: 1px solid var(--color-line);
  border-radius: 28px 28px 18px 18px;
  background: var(--color-paper);
  box-shadow: var(--shadow-soft);
  animation: rise 220ms var(--ease-press);
}

@keyframes rise {
  from {
    transform: translateY(18px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.mono {
  margin: 0 0 8px;
  color: var(--color-accent-2);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h2 {
  margin: 0;
  font-size: clamp(1.4rem, 4vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  font-style: normal;
}

.lead {
  margin: 10px 0 20px;
  color: var(--color-ink-soft);
  font-size: 0.95rem;
}

.field {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 0.85rem;
  font-weight: 600;
}

.field input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--color-line);
  border-radius: 12px;
  background: #fff;
  color: var(--color-ink);
}

.field input:focus-visible {
  outline: 3px solid var(--color-accent-2);
  outline-offset: 2px;
}

.row {
  display: flex;
  gap: 8px;
}

.row input {
  flex: 1;
  min-width: 0;
}

.links {
  margin: 0 0 18px;
  color: var(--color-muted);
  font-size: 0.85rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

@media (min-width: 760px) {
  .sheet {
    place-items: center;
  }

  .sheet__panel {
    border-radius: 24px;
  }
}
</style>
