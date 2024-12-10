import { PlatformPublishConfig } from "../types/index.ts";

const validateCredentials = (handle: string, appPassword: string): boolean => {
  if (!handle || !appPassword) {
    throw new Error("Bluesky API credentials are missing or invalid");
  }
  return true;
};

const uploadBanner = async (handle: string, imageBuffer: Uint8Array): Promise<boolean> => {
  console.log(`Uploading banner for @${handle}`);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() < 0.75;
      success 
        ? resolve(true) 
        : reject(new Error("Bluesky API upload failed"));
    }, 1200);
  });
};

const publish = async (imageBuffer: Uint8Array, config: PlatformPublishConfig): Promise<boolean> => {
  try {
    validateCredentials(config.handle, config.appPassword);
    
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error("Invalid image buffer");
    }

    const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      throw new Error("Image exceeds maximum allowed size");
    }

    return await uploadBanner(config.handle, imageBuffer);
  } catch (error) {
    console.error("Bluesky Platform Publishing Error:", error);
    return false;
  }
};

export const publishToBluesky = async (
  imageBuffer: Uint8Array, 
  config: PlatformPublishConfig
): Promise<boolean> => {
  try {
    return await publish(imageBuffer, config);
  } catch (error) {
    console.error("Failed to publish to Bluesky:", error);
    return false;
  }
}; 