import { ChecklistData, ImageConfig } from "../types/index.ts";
import { processMarkdown } from "../utils/markdown.ts";
import { Buffer } from "buffer";
import { Jimp, JimpMime, loadFont } from "jimp";

// Constants for image constraints
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_IMAGE_PIXELS = 1_000_000;
const MAX_IMAGE_WIDTH = 1000;
const MAX_IMAGE_HEIGHT = 1000;

export const generateBannerImage = async (
  checklistData: ChecklistData, 
  imageConfig: ImageConfig,
  backgroundImageArrayBuffer: ArrayBuffer
): Promise<Buffer> => {
  const { fontSize, textColor, placement } = imageConfig;
  const { header, items } = checklistData;

  try {
    // Validate input
    if (!backgroundImageArrayBuffer) {
      throw new Error("Invalid background image: ArrayBuffer is undefined or null");
    }

    // Process markdown items
    const processedItems = await processMarkdown(items);

    // Load image and resize if necessary
    const image = await Jimp.fromBuffer(backgroundImageArrayBuffer);
    
    // Resize image if it exceeds constraints
    if (image.bitmap.width > MAX_IMAGE_WIDTH || image.bitmap.height > MAX_IMAGE_HEIGHT) {
      console.log("Resizing image");
      image.scaleToFit({
        w: MAX_IMAGE_WIDTH,
        h: MAX_IMAGE_HEIGHT
      });
    }

    // Load font
    // const font = await loadFont(SANS_10_BLACK); // Doesn't work on Vercel
    const font = await loadFont("./fonts/Roboto-Regular-16.fnt");
    
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
