import { put, del } from '@vercel/blob';
import { NextApiRequest, NextApiResponse } from 'next';
import { generateBannerImage } from '../../src/core/image_generator';
import { processMarkdown } from '../../src/utils/markdown';
import { ImageConfig } from '../../src/types';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { 
        action, 
        checklistData, 
        backgroundKey, 
        platform 
      } = req.body;

      // Validate input
      if (!checklistData || !backgroundKey) {
        return res.status(400).json({ 
          error: 'Missing required parameters' 
        });
      }

      // Fetch background image from Vercel Blob
      const backgroundBlob = await fetch(
        `${process.env.NEXT_PUBLIC_BLOB_URL}/backgrounds/${backgroundKey}`
      );
      const backgroundBuffer = await backgroundBlob.arrayBuffer();

      // Prepare image configuration
      const imageConfig: ImageConfig = {
        backgroundKey,
        font: 'Arial',
        fontSize: 18,
        textColor: '#FFFFFF',
        placement: {
          header: { x: 50, y: 20 },
          checklist: { x: 50, y: 100 }
        }
      };

      // Generate banner image
      const bannerImageBuffer = await generateBannerImage(
        checklistData, 
        imageConfig,
        backgroundBuffer
      );

      // Handle different actions
      switch (action) {
        case 'preview':
          // For preview, return the image buffer directly
          return res.status(200).json({
            success: true,
            previewImageBase64: `data:image/png;base64,${bannerImageBuffer.toString('base64')}`
          });

        case 'publish':
          // Upload generated banner to Vercel Blob
          const { url } = await put(
            `banners/${Date.now()}.png`, 
            bannerImageBuffer, 
            { access: 'public' }
          );

          // Publish to platform (X or Bluesky)
          let publishResult = false;
          switch (platform) {
            case 'x':
              // Implement X publishing logic
              break;
            case 'bluesky':
              // Implement Bluesky publishing logic
              break;
          }

          return res.status(200).json({ 
            success: true, 
            bannerUrl: url,
            published: publishResult 
          });

        default:
          return res.status(400).json({ 
            error: 'Invalid action. Must be "preview" or "publish"' 
          });
      }

    } catch (error) {
      console.error('Banner generation error:', error);
      return res.status(500).json({ 
        error: 'Failed to generate banner',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}