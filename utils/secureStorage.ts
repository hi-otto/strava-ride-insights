import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { gzipSync, gunzipSync } from 'node:zlib'

const ALGORITHM = 'aes-256-cbc'

/**
 * Derives a 32-byte key from the provided string using SHA-256.
 */
function deriveKey(key: string): Buffer {
  return createHash('sha256').update(key).digest()
}

/**
 * Compresses data with Gzip and encrypts it using AES-256-CBC with the derived key.
 * Prepends the 16-byte IV to the result.
 */
export function encryptAndCompress(data: any, key: string): Buffer {
  const derivedKey = deriveKey(key)
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, derivedKey, iv)

  const jsonString = JSON.stringify(data)
  const compressed = gzipSync(jsonString)

  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()])

  // Return IV + Encrypted Data
  return Buffer.concat([iv, encrypted])
}

/**
 * Decrypts data using AES-256-CBC (extracting IV from start) and decompresses with Gzip.
 * Returns the original data object.
 * Throws error if decryption fails (e.g., wrong key).
 */
export function decompressAndDecrypt(buffer: Buffer, key: string): any {
  const derivedKey = deriveKey(key)

  // Extract IV (first 16 bytes)
  const iv = buffer.subarray(0, 16)
  const encryptedData = buffer.subarray(16)

  const decipher = createDecipheriv(ALGORITHM, derivedKey, iv)

  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()])

  const decompressed = gunzipSync(decrypted)
  return JSON.parse(decompressed.toString('utf-8'))
}
