import CryptoJS from 'crypto-js';

// Encryption key - In production, this should be stored securely (e.g., Keychain/Keystore)
// For now, we derive it from a combination of app-specific data
const getEncryptionKey = (): string => {
  // This is a simplified approach - production apps should use platform-specific secure storage
  const appIdentifier = 'fortibody_app_v1';
  const deviceInfo = 'device_specific_salt'; // Would be device ID in production

  // Derive a consistent key
  return CryptoJS.SHA256(appIdentifier + deviceInfo)
    .toString(CryptoJS.enc.Hex)
    .substring(0, 32);
};

// Encryption service for sensitive data
export class EncryptionService {
  private static instance: EncryptionService;
  private readonly ALGORITHM = 'AES';
  private readonly IV_LENGTH = 16;
  private readonly SALT_LENGTH = 16;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  // Encrypt sensitive data
  encrypt(plainText: string): string {
    try {
      const key = getEncryptionKey();
      const salt = CryptoJS.lib.WordArray.random(this.SALT_LENGTH);
      const iv = CryptoJS.lib.WordArray.random(this.IV_LENGTH);

      const encrypted = CryptoJS.AES.encrypt(
        plainText,
        CryptoJS.enc.Hex.parse(key),
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      // Combine salt + iv + encrypted data for storage
      const combined = salt.toString() + iv.toString() + encrypted.toString();
      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt sensitive data
  decrypt(encryptedText: string): string {
    try {
      const key = getEncryptionKey();

      // Decode from Base64
      const combined = CryptoJS.enc.Base64.parse(encryptedText).toString(
        CryptoJS.enc.Utf8
      );

      // Extract salt, iv, and encrypted data
      const salt = CryptoJS.enc.Hex.parse(
        combined.substring(0, this.SALT_LENGTH * 2)
      );
      const iv = CryptoJS.enc.Hex.parse(
        combined.substring(
          this.SALT_LENGTH * 2,
          (this.SALT_LENGTH + this.IV_LENGTH) * 2
        )
      );
      const encrypted = combined.substring(
        (this.SALT_LENGTH + this.IV_LENGTH) * 2
      );

      const decrypted = CryptoJS.AES.decrypt(
        encrypted,
        CryptoJS.enc.Hex.parse(key),
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Hash sensitive data (one-way, for passwords)
  hash(data: string): string {
    const salt = CryptoJS.lib.WordArray.random(16);
    const hash = CryptoJS.PBKDF2(data, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    });

    return salt.toString() + hash.toString();
  }

  // Verify hashed data
  verifyHash(data: string, hashedData: string): boolean {
    try {
      const salt = hashedData.substring(0, 32);
      const storedHash = hashedData.substring(32);

      const computedHash = CryptoJS.PBKDF2(data, CryptoJS.enc.Hex.parse(salt), {
        keySize: 256 / 32,
        iterations: 10000,
      }).toString();

      return computedHash === storedHash;
    } catch (error) {
      console.error('Hash verification failed:', error);
      return false;
    }
  }

  // Generate secure random token
  generateSecureToken(length: number = 32): string {
    const randomWords = CryptoJS.lib.WordArray.random(length);
    return randomWords.toString(CryptoJS.enc.Hex);
  }

  // Encrypt object
  encryptObject<T>(obj: T): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  // Decrypt object
  decryptObject<T>(encryptedText: string): T {
    const jsonString = this.decrypt(encryptedText);
    return JSON.parse(jsonString) as T;
  }
}

// Export singleton instance
export const encryptionService = EncryptionService.getInstance();
