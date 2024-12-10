import { describe, it, expect } from 'vitest';
import { 
  sanitizeMarkdown, 
  processMarkdown, 
  validateChecklistContent 
} from '../src/utils/markdown';
import { ChecklistItem } from '../src/types';

describe('Markdown Utilities', () => {
  describe('sanitizeMarkdown', () => {
    it('should remove dangerous HTML tags', () => {
      const dirtyText = '<script>alert("XSS")</script>Dangerous text';
      const cleanText = sanitizeMarkdown(dirtyText);
      expect(cleanText).not.toContain('<script>');
      expect(cleanText).toBe('Dangerous text');
    });

    it('should truncate long text', () => {
      const longText = 'a'.repeat(300);
      const truncatedText = sanitizeMarkdown(longText);
      expect(truncatedText.length).toBeLessThanOrEqual(283); // 280 + ellipsis
    });
  });

  describe('processMarkdown', () => {
    it('should process markdown items', async () => {
      const items: ChecklistItem[] = [
        { text: '*Italic*', isChecked: true },
        { text: '**Bold**', isChecked: false }
      ];
      const processedItems = await processMarkdown(items);
      
      expect(processedItems[0].text).toContain('<em>Italic</em>');
      expect(processedItems[1].text).toContain('<strong>Bold</strong>');
    });

    it('should handle processing errors gracefully', async () => {
      const invalidItems: ChecklistItem[] = [{ text: '', isChecked: false }];
      const processedItems = await processMarkdown(invalidItems);
      
      expect(processedItems[0]).toEqual({ text: '', isChecked: false });
    });
  });

  describe('validateChecklistContent', () => {
    it('should validate complete checklist', () => {
      const validConfig = {
        header: 'Test Checklist',
        items: [
          { text: 'Item 1', isChecked: true },
          { text: 'Item 2', isChecked: false }
        ]
      };
      
      expect(validateChecklistContent(validConfig)).toBe(true);
    });

    it('should reject empty header', () => {
      const invalidConfig = {
        header: '',
        items: [{ text: 'Item 1', isChecked: true }]
      };
      
      expect(validateChecklistContent(invalidConfig)).toBe(false);
    });

    it('should reject empty items', () => {
      const invalidConfig = {
        header: 'Test',
        items: []
      };
      
      expect(validateChecklistContent(invalidConfig)).toBe(false);
    });

    it('should reject items longer than 100 characters', () => {
      const invalidConfig = {
        header: 'Test',
        items: [{ text: 'a'.repeat(101), isChecked: false }]
      };
      
      expect(validateChecklistContent(invalidConfig)).toBe(false);
    });
  });
}); 