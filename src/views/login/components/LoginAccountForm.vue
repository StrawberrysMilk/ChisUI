<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, shallowRef, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { toast } from 'vue-sonner'
import { Input } from '@/components/ui/input'
import Identify from '@/components/Identify/identify.vue'
import { useAuthStore } from '@/store/authStore'
import { useUserInfoStore } from '@/store/global'

interface LoginForm {
  account: string
  password: string
  verificationCode: string
}

type FormErrors = Partial<Record<keyof LoginForm, string>>

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const userInfoStore = useUserInfoStore()
const passwordInput = useTemplateRef<InstanceType<typeof Input>>('passwordInput')
const captchaInput = useTemplateRef<InstanceType<typeof Input>>('captchaInput')

const form = reactive<LoginForm>({ account: '', password: '', verificationCode: '' })
const errors = reactive<FormErrors>({})
const identifyCode = shallowRef('')
const isSubmitting = shallowRef(false)
const submitText = shallowRef('登录')
const showPassword = shallowRef(false)

const canSubmit = computed(() =>
  Boolean(form.account.trim() && form.password && form.verificationCode.length === 3),
)

function focusInput(input: InstanceType<typeof Input> | null) {
  const element = input?.$el as HTMLInputElement | undefined
  element?.focus()
}

function refreshCode(focus = false) {
  identifyCode.value = Array.from({ length: 3 }, () =>
    '1234567890'.charAt(Math.floor(Math.random() * 10)),
  ).join('')
  form.verificationCode = ''
  delete errors.verificationCode
  if (focus) nextTick(() => focusInput(captchaInput.value))
}

function clearFieldError(field: keyof LoginForm) {
  delete errors[field]
}

function validateForm() {
  errors.account = form.account.trim() ? undefined : '请输入账号'
  errors.password = form.password ? undefined : '请输入密码'
  errors.verificationCode = !form.verificationCode
    ? '请输入验证码'
    : form.verificationCode.length !== 3
      ? '请输入3位验证码'
      : form.verificationCode !== identifyCode.value
        ? '验证码有误'
        : undefined
  return !Object.values(errors).some(Boolean)
}

async function handleSubmit() {
  if (isSubmitting.value || !validateForm()) {
    if (errors.verificationCode === '验证码有误') refreshCode(true)
    return
  }

  isSubmitting.value = true
  submitText.value = '载入缓存中...'

  try {
    const loginOutput = await authStore.Login({ gh: form.account.trim(), mm: form.password })
    if (!loginOutput?.menus?.length) throw new Error('无菜单权限，请联系管理员')

    submitText.value = '加载菜单...'
    await authStore.LoadMenuList(form.account.trim())

    submitText.value = '登录中...'
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      && !route.query.redirect.startsWith('//')
      ? route.query.redirect
      : ''
    const activeApp = userInfoStore.apps.find((app) => app.active === true || app.active === 'Y')
    await router.replace(redirect || activeApp?.router || '/home')
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败，请重试'
    toast.error(message)
    refreshCode()
    if (message.includes('账号') || message.includes('密码')) {
      errors.password = message
      form.password = ''
      await nextTick()
      focusInput(passwordInput.value)
    }
  } finally {
    isSubmitting.value = false
    submitText.value = '登录'
  }
}

onMounted(() => refreshCode())
</script>

<template>
  <form class="account-form" novalidate @submit.prevent="handleSubmit">
    <div class="field-group">
      <label class="field-label" for="username">账号</label>
      <div class="input-wrap">
        <Icon icon="solar:user-linear" aria-hidden="true" />
        <Input id="username" v-model="form.account" autocomplete="username" placeholder="请输入账号"
          :aria-invalid="Boolean(errors.account)" @input="clearFieldError('account')" />
      </div>
      <p v-if="errors.account" class="field-error">{{ errors.account }}</p>
    </div>

    <div class="field-group">
      <label class="field-label" for="password">密码</label>
      <div class="input-wrap">
        <Icon icon="solar:lock-password-linear" aria-hidden="true" />
        <Input id="password" ref="passwordInput" v-model="form.password"
          :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="请输入密码"
          :aria-invalid="Boolean(errors.password)" @input="clearFieldError('password')" />
        <button type="button" class="password-toggle" :aria-label="showPassword ? '隐藏密码' : '显示密码'"
          :title="showPassword ? '隐藏密码' : '显示密码'" @click="showPassword = !showPassword">
          <Icon :icon="showPassword ? 'solar:eye-closed-linear' : 'solar:eye-linear'" />
        </button>
      </div>
      <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
    </div>

    <div class="field-group">
      <label class="field-label" for="captcha">验证码</label>
      <div class="captcha-row">
        <div class="input-wrap">
          <Icon icon="solar:shield-check-linear" aria-hidden="true" />
          <Input id="captcha" ref="captchaInput" v-model="form.verificationCode" inputmode="numeric"
            maxlength="3" autocomplete="off" placeholder="请输入3位验证码"
            :aria-invalid="Boolean(errors.verificationCode)" @input="clearFieldError('verificationCode')" />
        </div>
        <button type="button" class="captcha" title="刷新验证码" @click="refreshCode(true)">
          <Identify :content-height="40" :content-width="104" :identify-code="identifyCode" />
        </button>
      </div>
      <p v-if="errors.verificationCode" class="field-error">{{ errors.verificationCode }}</p>
    </div>

    <Button type="submit" size="lg" class="submit-button" :disabled="isSubmitting || !canSubmit">
      <Icon v-if="isSubmitting" icon="svg-spinners:180-ring-with-bg" data-icon="inline-start" />
      {{ submitText }}
    </Button>
  </form>
</template>

<style scoped>
.account-form { display: flex; flex-direction: column; gap: 20px; }
.field-group { display: grid; min-height: 60px; grid-template-columns: 56px minmax(0, 1fr); align-items: start; gap: 7px 14px; }
.field-label { align-self: center; color: var(--foreground); font-size: 13px; font-weight: 500; text-align: right; }
.input-wrap { position: relative; display: flex; align-items: center; flex: 1; }
.input-wrap > svg { position: absolute; left: 12px; z-index: 1; color: var(--muted-foreground); font-size: 18px; pointer-events: none; }
.input-wrap input { height: 44px; padding-left: 40px; }
.input-wrap:has(.password-toggle) input { padding-right: 40px; }
.password-toggle { position: absolute; right: 4px; display: grid; width: 32px; height: 32px; place-items: center; border-radius: 4px; color: var(--muted-foreground); }
.password-toggle:hover { color: var(--foreground); background: var(--accent); }
.captcha-row { display: grid; grid-template-columns: minmax(0, 1fr) 112px; gap: 10px; }
.captcha { height: 44px; overflow: hidden; border: 1px solid var(--border); border-radius: 6px; }
.captcha canvas { display: block; }
.field-error { grid-column: 2; color: var(--destructive); font-size: 12px; line-height: 1; }
.submit-button { width: calc(100% - 70px); margin: 2px 0 0 70px; background: #1677a8; color: #fff; }
.submit-button:hover:not(:disabled) { background: #126b97; }
.submit-button:disabled { background: #9ca3af; color: #fff; opacity: 1; }

@media (max-width: 420px) {
  .field-group { grid-template-columns: 48px minmax(0, 1fr); gap-inline: 8px; }
  .submit-button { width: calc(100% - 56px); margin-left: 56px; }
}
</style>
