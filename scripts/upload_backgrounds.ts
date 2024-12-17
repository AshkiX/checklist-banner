import { put } from "@vercel/blob";
import * as path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadBackgroundImages = async (): Promise<void> => {
  const backgroundsDir = path.join(__dirname, "..", "backgrounds");
  console.log("Backgrounds directory path:", backgroundsDir);

  try {
    const dirExists = await fs.pathExists(backgroundsDir);
    console.log("Backgrounds directory exists:", dirExists);

    if (!dirExists) {
      throw new Error(`Backgrounds directory not found: ${backgroundsDir}`);
    }

    const files = await fs.readdir(backgroundsDir);
    console.log("Files in backgrounds directory:", files);

    const imageFiles = files.filter((file) =>
      [".png", ".jpg", ".jpeg", ".gif", ".webp"].some((ext) =>
        file.toLowerCase().endsWith(ext)
      )
    );
    console.log("Filtered image files:", imageFiles);

    if (imageFiles.length === 0) {
      console.warn("No image files found in backgrounds directory");
      return;
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not defined in the environment variables");
    }

    for (const file of imageFiles) {
      const filePath = path.join(backgroundsDir, file);
      console.log("Processing file:", filePath);

      const fileBuffer = await fs.readFile(filePath);
      console.log(`Read file buffer for ${file}`);

      try {
        const { url } = await put(`backgrounds/${file}`, fileBuffer, {
          access: "public",
          token: blobToken,
        });
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

uploadBackgroundImages().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});