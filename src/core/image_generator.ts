import { ChecklistData, ImageConfig } from "../types/index.ts";
import { processMarkdown } from "../utils/markdown.ts";
import { Buffer } from "buffer";

// const Jimp = require('Jimp');
import { Jimp, JimpMime, loadFont } from 'jimp';
import { SANS_10_BLACK } from "jimp/fonts";

export const generateBannerImage = async (
  checklistData: ChecklistData, 
  imageConfig: ImageConfig,
  backgroundImageArrayBuffer: ArrayBuffer
): Promise<Buffer> => {
  const { fontSize, textColor, placement } = imageConfig;
  const { header, items } = checklistData;

  try {
    // Process markdown items
    const processedItems = await processMarkdown(items);

    if (!backgroundImageArrayBuffer) {
        throw new Error("Invalid background image: ArrayBuffer is undefined or null");
    }

    console.log("Background image array buffer length:", backgroundImageArrayBuffer.byteLength);
    const image = await Jimp.fromBuffer(backgroundImageArrayBuffer);

    // Load font
    // const font = await loadFont(SANS_10_BLACK); // Doesn't work on Vercel
    const font = await loadFont("./fonts/Roboto-Regular-16.fnt");
    
    console.log("Font:", font);
    // Draw header
    image.print({
      font: font, 
      x: placement.header.x, 
      y: placement.header.y, 
      text: header
    });
    
    // Draw checklist items
    processedItems.forEach((item, index) => {
      const checkSymbol = item.isChecked ? "✓" : "○";
      const text = `${checkSymbol} ${item.text}`;
      const yPosition = placement.checklist.y + index * (fontSize + 5);
      
      image.print({
        font: font, 
        x: placement.checklist.x, 
        y: yPosition, 
        text
      });
    });

    return await image.getBuffer(JimpMime.png);
  } catch (error) {
    console.error("Error generating banner image:", error);
    throw error;
  }
};
