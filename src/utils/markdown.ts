import { marked } from "marked";
import { ChecklistItem, ChecklistData } from "../types/index.ts";

// Enhanced markdown sanitization
export const sanitizeMarkdown = (text: string): string => {
  const sanitizedText = text.replace(
    /<script.*?>.*?<\/script>|<iframe.*?>.*?<\/iframe>|<object.*?>.*?<\/object>|<embed.*?>.*?<\/embed>|<style.*?>.*?<\/style>|<applet.*?>.*?<\/applet>|<base.*?>.*?<\/base>|<bgsound.*?>.*?<\/bgsound>|<link.*?>.*?<\/link>|<meta.*?>.*?<\/meta>|<frame.*?>.*?<\/frame>|<frameset.*?>.*?<\/frameset>/gi,
    ""
  );

  const MAX_TEXT_LENGTH = 280;
  return sanitizedText.length > MAX_TEXT_LENGTH
    ? sanitizedText.substring(0, MAX_TEXT_LENGTH) + "..."
    : sanitizedText;
};

// Process markdown with additional safety checks
export const processMarkdown = async (items: readonly ChecklistItem[]): Promise<ChecklistItem[]> => {
  return await Promise.all(items.map(async (item): Promise<ChecklistItem> => {
    try {
      const sanitizedText = sanitizeMarkdown(item.text);

      const processedText = marked.parseInline(sanitizedText, {
        breaks: false,
        gfm: true,
        pedantic: false,
      }) || sanitizedText;

      return {
        ...item,
        text: await processedText,
      };
    } catch (error) {
      console.warn(`Failed to process markdown for item: ${item.text}`, error);
      return {
        ...item,
        text: item.text,
      };
      }
    })
  );
};

// Validate checklist content
export const validateChecklistContent = (data: ChecklistData): boolean => {
  if (!data.header || data.header.trim().length === 0) {
    console.warn("Invalid header: Header cannot be empty");
    return false;
  }

  if (!data.items || data.items.length === 0) {
    console.warn("Invalid checklist: No items provided");
    return false;
  }

  const validItems = data.items.every(
    (item) =>
      item.text && item.text.trim().length > 0 && item.text.length <= 100
  );

  if (!validItems) {
    console.warn("Invalid checklist: Some items are empty or too long");
    return false;
  }

  return true;
};