import { fingerprintService } from '../fingerprint.services';

// Mock TextEncoder for JSDOM environment if needed (usually present in modern Node/JSDOM)
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: async (_algo: string, data: Uint8Array) => {
        return new Uint8Array(data.length).buffer;
      }
    },
    getRandomValues: (buffer: Uint8Array) => {
      return require('crypto').randomFillSync(buffer);
    }
  },
  writable: true
});

describe('fingerprintService', () => {
  const originalNavigator = global.navigator;
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.navigator = originalNavigator;
    global.window = originalWindow;
  });

  it('should return a fingerprint result with device and browser info', async () => {
    // Mock navigator for Windows
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        language: 'en-US',
        platform: 'Win32',
      },
      writable: true
    });

    const result = await fingerprintService();

    expect(result).toHaveProperty('fingerprint_hashed');
    expect(result).toHaveProperty('browser');
    expect(result).toHaveProperty('device');

    expect(result.browser).toBe('Chrome');
    expect(result.device).toBe('Windows');
  });

  it('should handle unknown user agent gracefully', async () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: '',
        language: 'en-US',
      },
      writable: true
    });

    const result = await fingerprintService('');

    expect(result.browser).toBe('Unknown');
    expect(result.device).toBe('Unknown');
  });
});
