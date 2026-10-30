/**
 * RSA 加解密工具（底层依赖 jsencrypt 库）
 */
import JSEncrypt from 'jsencrypt'

// 密钥对生成 http://web.chacuo.net/netrsakeypair
const publicKey =
  'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAOCChRyV/HPxKdq1COc1kLtUw9lJXyxa' +
  'QlePxYRTc+lbik1tt+IjJIeqJlhxa8BKyNnt3voOY71MBQqtcHZmEs0CAwEAAQ=='

const privateKey =
  'MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA4IKFHJX8c/Ep2rUI' +
  '5zWQu1TD2UlfLFpCV4/FhFNz6VuKTW234iMkh6omWHFrwErI2e3e+g5jvUwFCq1w' +
  'dmYSzQIDAQABAkBxY/pu8aHLvSXyfDS+8eLjenBgMhqLgBq5trd/mdaVKOAGDhuy' +
  'gK+IDmnPPpSwWP909wmqTgNgeeO5o9wieTkBAiEA/+tp8MGbQF7eWJMHeu9sqsat' +
  'ducz/NljKT7o2yNcVNECIQDglJRcm5fufIa9LSQeDa0FzkZTdaLTrMVXg9AMCnNN' +
  'PQIhAKi4xMyUZ82FfiN5M7pJ9SOV/rDgdvbhPy3nKs+mvW2xAiBqHCmhO+7kQrgS' +
  '6CI5hPKsXJMD2gAODYLMX75MAiAKbQIga6w39t+dHJjHuRcx76Jy9Bwa7nwmxiYE' +
  'a/YXN4Vvk0o='

/**
 * 使用内置公钥加密
 * @param txt 待加密明文
 * @returns 加密后的密文，失败时返回 false
 */
export function encrypt(txt: string): string | false {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  return encryptor.encrypt(txt)
}

/**
 * 使用内置私钥解密
 * @param txt 待解密密文
 * @returns 解密后的明文，失败时返回 false
 */
export function decrypt(txt: string): string | false {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey)
  return encryptor.decrypt(txt)
}

/**
 * 使用自定义公钥加密
 * @param txt 待加密明文
 * @param pubKey RSA 公钥
 * @returns 加密后的密文，失败时返回 false
 */
export function encryptByPublicKey(txt: string, pubKey: string): string | false {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(pubKey)
  return encryptor.encrypt(txt)
}

/**
 * 使用自定义私钥解密
 * @param txt 待解密密文
 * @param privKey RSA 私钥
 * @returns 解密后的明文，失败时返回 false
 */
export function decryptByPrivateKey(txt: string, privKey: string): string | false {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privKey)
  return encryptor.decrypt(txt)
}
