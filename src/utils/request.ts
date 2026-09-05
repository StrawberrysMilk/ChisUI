import axios from 'axios'
import type { App } from 'vue'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'vue-sonner'
import { VueAxios as AxiosPlugin } from './axios'
import AESHelper from './AESHelper'
import { ACCESS_JTI, ACCESS_TOKEN, LOGIN_INFO } from '@/store/mutation-types'
import { readStorage } from '@/utils/storage'
import { requestPasswordChange, requestSessionRecovery } from '@/utils/authEvents'

type Payload = Record<string, any>

const instance = axios.create({
  baseURL: '/api/api',
  timeout: 60000,
})

const err = async (error: any) => {
  if (axios.isCancel(error)) return Promise.reject(error)

  const status = error.response?.status
  const data = error.response?.data
  const errorMessage = data?.message || error.message || '请求失败'
  const token = localStorage.getItem(ACCESS_TOKEN)

  if (status === 403) {
    const requirement = data?.data === 'PWD_EXPIRED'
      ? 'expired'
      : data?.data === 'PWD_STRENGTH'
        ? 'complexity'
        : null
    if (requirement) {
      requestPasswordChange(requirement)
      toast.warning('需要修改密码', { description: errorMessage })
    } else {
      toast.error('无权访问', { description: errorMessage })
    }
  } else if (status === 429) {
    toast.warning('系统访问高峰期', { description: '请稍后再试' })
  } else if (status === 404) {
    toast.error('接口不存在 (404)', { description: `请求地址：${error.config?.url || ''}` })
  } else if (status >= 500) {
    toast.error(errorMessage)
  } else if (status === 401 && !(data?.result?.isLogin) && token) {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const isAuthenticationRequest = /\/Login\/(GetLoginUserInfo|GetGHUserInfo|Logout)/i.test(config?.url || '')
    if (!config?._retry && !isAuthenticationRequest) {
      await requestSessionRecovery()
      config._retry = true
      return instance.request(config)
    }
  }

  return Promise.reject(error)
}

window._axiosPromiseArr = []

function createEncryptedBody(config: InternalAxiosRequestConfig) {
  config.cancelToken = new axios.CancelToken((cancel) => {
    window._axiosPromiseArr.push({ cancel })
  })

  const token = localStorage.getItem(ACCESS_TOKEN)
  const jti = localStorage.getItem(ACCESS_JTI)
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (jti) config.headers.JTI = jti

  const body = config.data as Payload | FormData | null | undefined
  if (body instanceof FormData) return config

  if (config.url && body?.signal) {
    config.signal = body.signal
    delete body.signal
  }

  const savedLoginInfo = readStorage<Payload>(LOGIN_INFO, {}, 'session')
  let loginInfo: Payload = token ? { ...savedLoginInfo } : { ...(body || {}) }

  if (body == null && !(config as any).parameter && config.params == null) {
    loginInfo.ISWEB = true
    config.data = { ISWEB: true, RSASTR: AESHelper.Encrypt(JSON.stringify(loginInfo)) }
    return config
  }

  if (body?.requestData && typeof body.requestData === 'object') {
    loginInfo = { ...body.requestData, ...loginInfo }
  }
  loginInfo.ISWEB = true

  let objects: Payload
  if (body?.objName && typeof body.objName === 'string') {
    objects = { [body.objName]: body[body.objName] }
  } else if (body?.NoParm === true) {
    objects = { ...body }
  } else if (body?.isOld === true) {
    objects = { ...body }
    delete objects.isOld
  } else {
    objects = body ? { pramInfo: body } : {}
  }

  const parameters = (config as any).parameter
  for (const item of Array.isArray(parameters) ? parameters : parameters ? [parameters] : []) {
    if (typeof item.objName === 'string') objects[item.objName] = item[item.objName]
  }

  delete objects.NoParm
  if (body?.delRequest === true) delete objects.requestData

  const envelope: Payload = { Objects: objects, ...loginInfo }
  delete envelope.dataInput
  delete envelope.DataInput
  config.data = { ISWEB: true, RSASTR: AESHelper.Encrypt(JSON.stringify(envelope)) }
  return config
}

async function decompressBase64(value: string) {
  const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
  const format = bytes[0] === 0x1f && bytes[1] === 0x8b ? 'gzip' : 'deflate'
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format))
  return new Response(stream).text()
}

async function normalizeResponse(response: AxiosResponse) {
  if (response.headers['content-disposition']) return response

  const original = response.data
  if (!original) return original
  if (typeof original === 'object') return original

  const decrypted = AESHelper.Decrypt(original)
  const result = JSON.parse(`{"datas":${decrypted}}`).datas as Payload

  if (typeof result.data === 'string') {
    try {
      const decompressed = await decompressBase64(result.data)
      try {
        result.data = JSON.parse(decompressed)
      } catch {
        result.data = decompressed
      }
    } catch {
      // Some endpoints return an ordinary string rather than compressed data.
    }
  }

  if (Array.isArray(result.data) && result.data[0]?.estoom) result.data.shift()
  return result
}

instance.interceptors.request.use(createEncryptedBody, err)
instance.interceptors.response.use(normalizeResponse, err)

const installer = {
  vm: {},
  install(app: App) {
    app.use(AxiosPlugin, instance)
  },
}

export { installer as VueAxios, instance as axiosInstance }
