/**
 * @jest-environment node
 */
import { encryptAndCompress, decompressAndDecrypt } from './secureStorage'
import { randomBytes } from 'crypto'

describe('secureStorage', () => {
  const testKey = 'test-encryption-key-123'
  const testData = {
    id: 12345,
    name: 'Morning Ride',
    distance: 10000,
    timestamp: new Date().toISOString(),
    complex: {
      nested: true,
      data: [1, 2, 3],
    },
  }

  it('should encrypt and decrypt data correctly', () => {
    const encrypted = encryptAndCompress(testData, testKey)
    expect(Buffer.isBuffer(encrypted)).toBe(true)

    // Should verify it's not just the JSON string (compression/encryption happened)
    expect(encrypted.toString()).not.toContain('Morning Ride')

    const decrypted = decompressAndDecrypt(encrypted, testKey)
    expect(decrypted).toEqual(testData)
  })

  it('should fail to decrypt with wrong key', () => {
    const encrypted = encryptAndCompress(testData, testKey)
    const wrongKey = 'wrong-encryption-key-456'

    expect(() => {
      decompressAndDecrypt(encrypted, wrongKey)
    }).toThrow()
  })

  it('should handle large data', () => {
    const largeData = Array(1000).fill(testData)
    const encrypted = encryptAndCompress(largeData, testKey)
    const decrypted = decompressAndDecrypt(encrypted, testKey)
    expect(decrypted).toEqual(largeData)
  })
})
