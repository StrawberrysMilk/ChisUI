/**
 * 慢病AES工具类
 */
import CryptoJS from 'crypto-js'
//
export default {
  Encrypt(word: string): string {
    const key = CryptoJS.enc.Utf8.parse('C0D2ACC1205B4028A4888CAC475FBE35')
    const srcs = CryptoJS.enc.Utf8.parse(word)
    const encrypted = CryptoJS.AES.encrypt(srcs, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return encrypted.toString()
  },
  Decrypt(word: string): string {
    const key = CryptoJS.enc.Utf8.parse('C0D2ACC1205B4028A4888CAC475FBE35')
    const decrypt = CryptoJS.AES.decrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return decrypt.toString(CryptoJS.enc.Utf8)
  }
}
