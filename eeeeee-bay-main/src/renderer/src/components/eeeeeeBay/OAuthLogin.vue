<template>
  <div class="oauth-login">
    <div class="oauth-login__content">
      <div class="oauth-login__logo-wrapper">
        <img :src="logo" alt="eeeeee-bay logo" class="oauth-login__logo" />
      </div>
      <h1 class="oauth-login__title">Connect your eeeeee-bay account</h1>
      <button :disabled="loading" class="oauth-login__button" @click="login">
        <span v-if="!loading">Login with eBay</span>
        <span v-else>Logging in...</span>
      </button>
      <p v-if="error" class="oauth-login__error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ebayOAuthLogin } from '../../api'
const emit = defineEmits(['token'])
const loading = ref(false)
const error = ref('')
const logo = new URL('../../assets/E.svg', import.meta.url).href

const clientId = import.meta.env.VITE_EBAY_CLIENT_ID || ''
const scope =
  import.meta.env.VITE_EBAY_SCOPE ||
  'https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly'
const sandbox = import.meta.env.VITE_EBAY_SANDBOX === 'true'

async function login(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    if (!clientId) throw new Error('Missing eBay Client ID in .env')
    const token = await ebayOAuthLogin(clientId, scope, 3000, sandbox)
    if (token) {
      emit('token', token)
    } else {
      error.value = 'OAuth window closed or no token received.'
    }
  } catch (e: unknown) {
    error.value = (e as Error).message
    console.error('[OAuthLogin] Exception:', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.oauth-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: radial-gradient(
    circle at top,
    var(--ev-surface-2, #1e1f2b),
    var(--ev-surface-1, #070e51)
  );
}

.oauth-login__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
  padding: 3rem 4rem;
}

.oauth-login__logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: sway 1.5s ease-in-out infinite;
}

.oauth-login__logo {
  width: 250px;
  height: 250px;
  animation: pulse 0.5s ease-in-out infinite;
}

.oauth-login__title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--ev-text-primary, #ffffff);
}

.oauth-login__button {
  padding: 0.75rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ev-text-inverse, #0d0f1a);
  background: var(--ev-accent, #f5b400);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.oauth-login__button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.oauth-login__button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(245, 180, 0, 0.3);
}

.oauth-login__error {
  color: var(--ev-message-error, #ff6b6b);
  margin: 0;
}

@keyframes pulse {
  0%,
  20% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.15);
  }
  30% {
    transform: scale(1);
  }
}

@keyframes sway {
  0%,
  20% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(15deg);
  }
  30% {
    transform: rotate(0deg);
  }
}
</style>
