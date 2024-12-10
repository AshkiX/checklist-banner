import { put } from '@vercel/blob';
import * as path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadBackgroundImages = async (): Promise<void> => {
  const backgroundsDir = path.join(__dirname, "..", "backgrounds");

  try {
    if (!await fs.pathExists(backgroundsDir)) {
      throw new Error(`Backgrounds directory not found: ${backgroundsDir}`);
    }

    const files = await fs.readdir(backgroundsDir);
    const imageFiles = files.filter(file =>
      [".png", ".jpg", ".jpeg", ".gif", ".webp"].some(ext =>
        file.toLowerCase().endsWith(ext)
      )
    );

    console.log("Found background images:", imageFiles);

    if (imageFiles.length === 0) {
      console.warn("No image files found in backgrounds directory");
      return;
    }

    for (const file of imageFiles) {
      const filePath = path.join(backgroundsDir, file);
      const fileBuffer = await fs.readFile(filePath);

      try {
        const { url } = await put(
          `backgrounds/${file}`, 
          fileBuffer, 
          { 
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN 
          }
        );

        console.log(`Successfully uploaded ${file} to ${url}`);
      } catch (uploadError) {
        console.error(`Failed to upload ${file}:`, uploadError);
      }
    }
  } catch (error) {
    console.error("Error uploading background images:", error);
    process.exit(1);
  }
};

uploadBackgroundImages().catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});