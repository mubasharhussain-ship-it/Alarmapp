
export class BiometricAuth {
  static async isSupported(): Promise<boolean> {
    return 'credentials' in navigator && 'create' in navigator.credentials;
  }

  static async authenticate(): Promise<boolean> {
    try {
      if (!await this.isSupported()) {
        return false;
      }

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "Alarm Clock" },
          user: {
            id: new TextEncoder().encode("user"),
            name: "user",
            displayName: "User"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });

      return !!credential;
    } catch (error) {
      console.error('Biometric auth failed:', error);
      return false;
    }
  }

  static async verifyBiometric(): Promise<boolean> {
    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          userVerification: "required"
        }
      });

      return !!assertion;
    } catch (error) {
      console.error('Biometric verification failed:', error);
      return false;
    }
  }
}
