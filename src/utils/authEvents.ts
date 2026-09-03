export type PasswordRequirement = 'expired' | 'complexity'
export type PasswordDialogMode = PasswordRequirement | 'manual'

const SESSION_EXPIRED_EVENT = 'pmui:session-expired'
const PASSWORD_REQUIRED_EVENT = 'pmui:password-required'

let recoveryPromise: Promise<void> | null = null
let resolveRecovery: (() => void) | null = null
let rejectRecovery: ((reason?: unknown) => void) | null = null

export function requestSessionRecovery() {
  if (!recoveryPromise) {
    recoveryPromise = new Promise<void>((resolve, reject) => {
      resolveRecovery = resolve
      rejectRecovery = reject
    })
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
  }
  return recoveryPromise
}

export function completeSessionRecovery() {
  resolveRecovery?.()
  resetRecovery()
}

export function cancelSessionRecovery(reason = new Error('登录会话已结束')) {
  rejectRecovery?.(reason)
  resetRecovery()
}

function resetRecovery() {
  recoveryPromise = null
  resolveRecovery = null
  rejectRecovery = null
}

export function requestPasswordChange(requirement: PasswordDialogMode) {
  window.dispatchEvent(new CustomEvent<PasswordDialogMode>(PASSWORD_REQUIRED_EVENT, { detail: requirement }))
}

export const authEventNames = {
  sessionExpired: SESSION_EXPIRED_EVENT,
  passwordRequired: PASSWORD_REQUIRED_EVENT,
} as const
