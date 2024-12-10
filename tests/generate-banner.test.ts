import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../pages/api/generate-banner';
import { generateBannerImage } from '../src/core/image_generator';
import { ImageConfig } from '../src/types';

// Mock dependencies
vi.mock('../src/core/image_generator');

describe('Banner Generation API', () => {
  // Helper function to create a mock request
  const createMockRequest = (method: string, body?: any) => {
    return {
      method,
      body: body || {},
    } as any;
  };

  // Helper function to create a mock response
  const createMockResponse = () => {
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setHeader: vi.fn(),
      end: vi.fn(),
    };
    return res;
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
  });

  describe('Request Handling', () => {
    it('should reject non-POST methods', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.end).toHaveBeenCalledWith(expect.stringContaining('Method GET Not Allowed'));
    });

    it('should reject request without checklist data', async () => {
      const req = createMockRequest('POST', { platform: 'x' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: 'Missing required parameters' 
        })
      );
    });

    it('should reject request without background key', async () => {
      const req = createMockRequest('POST', { 
        action: 'preview',
        checklistData: {
          header: 'Test',
          items: [{ text: 'Item', isChecked: false }]
        }
      });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: 'Missing required parameters' 
        })
      );
    });
  });

  describe('Image Generation', () => {
    const validRequest = {
      method: 'POST',
      body: {
        action: 'preview',
        backgroundKey: 'test-bg.png',
        checklistData: {
          header: 'Weekly Goals',
          items: [{ text: 'Complete task', isChecked: true }]
        }
      }
    };

    const createDefaultImageConfig = (): ImageConfig => ({
      backgroundKey: 'test-bg.png',
      font: 'Arial',
      fontSize: 18,
      textColor: '#FFFFFF',
      placement: {
        header: { x: 50, y: 20 },
        checklist: { x: 50, y: 100 }
      }
    });

    it('should generate preview image', async () => {
      const req = { ...validRequest };
      const res = createMockResponse();

      // Mock fetch to return a background image buffer
      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
      });

      // Mock image generation
      vi.mocked(generateBannerImage).mockResolvedValue(Buffer.from('test image'));

      await handler(req, res);

      expect(generateBannerImage).toHaveBeenCalledWith(
        req.body.checklistData, 
        createDefaultImageConfig(),
        expect.any(ArrayBuffer)
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          success: true,
          previewImageBase64: expect.stringContaining('data:image/png;base64,')
        })
      );
    });

    it('should handle image generation error', async () => {
      const req = { ...validRequest };
      const res = createMockResponse();

      // Mock fetch to return a background image buffer
      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
      });

      // Mock image generation failure
      vi.mocked(generateBannerImage).mockRejectedValue(new Error('Image generation failed'));

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: 'Failed to generate banner',
          details: 'Image generation failed'
        })
      );
    });
  });
});