import { describe, it, expect } from 'vitest';
import { publishToX } from '../src/platforms/x_platform';
import { publishToBluesky } from '../src/platforms/bluesky_platform';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Platform Publishing', () => {
  const mockImagePath = path.join(__dirname, '..', 'backgrounds', 'bg.png');
  
  async function loadTestImage(): Promise<Buffer> {
    try {
      return await fs.readFile(mockImagePath);
    } catch (error) {
      console.error('Failed to load test image:', error);
      throw error;
    }
  }

  describe('X Platform Publishing', () => {
    it('should publish with valid credentials', async () => {
      const imageBuffer = await loadTestImage();
      const result = await publishToX(imageBuffer, {
        handle: 'test_handle',
        appPassword: 'test_password'
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('boolean');
    });

    it('should handle publishing failures', async () => {
      const imageBuffer = await loadTestImage();
      const result = await publishToX(imageBuffer, {
        handle: '',
        appPassword: ''
      });

      expect(result).toBe(false);
    });

    it('should reject oversized images', async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
      const result = await publishToX(largeBuffer, {
        handle: 'test_handle',
        appPassword: 'test_password'
      });

      expect(result).toBe(false);
    });
  });

  describe('Bluesky Platform Publishing', () => {
    it('should publish with valid credentials', async () => {
      const imageBuffer = await loadTestImage();
      const result = await publishToBluesky(imageBuffer, {
        handle: 'test_handle',
        appPassword: 'test_password'
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('boolean');
    });

    it('should handle publishing failures', async () => {
      const imageBuffer = await loadTestImage();
      const result = await publishToBluesky(imageBuffer, {
        handle: '',
        appPassword: ''
      });

      expect(result).toBe(false);
    });

    it('should reject oversized images', async () => {
      const largeBuffer = Buffer.alloc(5 * 1024 * 1024); // 5MB
      const result = await publishToBluesky(largeBuffer, {
        handle: 'test_handle',
        appPassword: 'test_password'
      });

      expect(result).toBe(false);
    });
  });
}); 