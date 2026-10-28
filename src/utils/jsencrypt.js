import JSEncrypt from 'jsencrypt'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAOCChRyV/HPxKdq1COc1kLtUw9lJXyxa' +
'QlePxYRTc+lbik1tt+IjJIeqJlhxa8BKyNnt3voOY71MBQqtcHZmEs0CAwEAAQ=='

const privateKey = 'MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA4IKFHJX8c/Ep2rUI' +
'5zWQu1TD2UlfLFpCV4/FhFNz6VuKTW234iMkh6omWHFrwErI2e3e+g5jvUwFCq1w' +
'dmYSzQIDAQABAkBxY/pu8aHLvSXyfDS+8eLjenBgMhqLgBq5trd/mdaVKOAGDhuy' +
'gK+IDmnPPpSwWP909wmqTgNgeeO5o9wieTkBAiEA/+tp8MGbQF7eWJMHeu9sqsat' +
'ducz/NljKT7o2yNcVNECIQDglJRcm5fufIa9LSQeDa0FzkZTdaLTrMVXg9AMCnNN' +
'PQIhAKi4xMyUZ82FfiN5M7pJ9SOV/rDgdvbhPy3nKs+mvW2xAiBqHCmhO+7kQrgS' +
'6CI5hPKsXJMD2gAODYLMX75MAiAKbQIga6w39t+dHJjHuRcx76Jy9Bwa7nwmxiYE' +
'a/YXN4Vvk0o='

// 加密
export function encrypt (txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  return encryptor.encrypt(txt)
}

// 解密
export function decrypt (txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey)
  return encryptor.decrypt(txt)
}

// 加密
export function encryptByPublicKey (txt, publicKey) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  return encryptor.encrypt(txt)
}

// 解密
export function decryptByPrivateKey (txt, privateKey) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey)
  return encryptor.decrypt(txt)
}
