const ALGORITHM = 'AES-GCM'
const IV_LENGTH = 12 // Recommended for AES-GCM
const SECRET_KEY = process.env.APP_SECRET || 'fallback-secret-key-at-least-32-chars-long-123'

// Helper to convert string to key
async function getKey() {
  const encoder = new TextEncoder()
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET_KEY).slice(0, 32), // Ensure 32 bytes for AES-256
    { name: 'PBKDF2' }, // We'll just usage raw import for simplicity if length is sufficient, but let's use direct import for simplicity in this context or create a hash
    false,
    ['deriveBits', 'deriveKey']
  )

  // Better approach: Hash the secret to get a consistent 32-byte key
  const keyData = await globalThis.crypto.subtle.digest('SHA-256', encoder.encode(SECRET_KEY))

  return globalThis.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  )
}

export const encrypt = async (text: string): Promise<string> => {
  const key = await getKey()
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encoder = new TextEncoder()

  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(text)
  )

  // Convert buffer to hex/base64 for storage
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
  const encryptedHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('')

  return `${ivHex}:${encryptedHex}`
}

export const decrypt = async (text: string): Promise<string> => {
  const [ivHex, encryptedHex] = text.split(':')
  if (!ivHex || !encryptedHex) throw new Error('Invalid encrypted format')

  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
  const encrypted = new Uint8Array(encryptedHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))

  const key = await getKey()

  try {
    const decrypted = await globalThis.crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encrypted
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (e) {
    throw new Error('Decryption failed')
  }
}
