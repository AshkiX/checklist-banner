import { put } from '@vercel/blob';
import { NextApiRequest, NextApiResponse } from 'next';
import { generateBannerImage } from '../../src/core/image_generator.ts';
import { ImageConfig } from '../../src/types/index.ts';

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
      const backgroundImageUrl = `${process.env.NEXT_PUBLIC_BLOB_URL}/backgrounds/${backgroundKey}`;
      const backgroundBlob = await fetch(backgroundImageUrl);

      // Validate background image fetch
      if (!backgroundBlob.ok) {
        console.error(`Failed to fetch background image: ${backgroundImageUrl}`);
        console.error(`Status: ${backgroundBlob.status}, StatusText: ${backgroundBlob.statusText}`);
        
        return res.status(404).json({ 
          error: 'Background image not found', 
          details: {
            backgroundKey,
            url: backgroundImageUrl,
            status: backgroundBlob.status,
            statusText: backgroundBlob.statusText
          }
        });
      }

      // Validate content type
      const contentType = backgroundBlob.headers.get('content-type');
      const allowedImageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      if (!contentType || !allowedImageTypes.includes(contentType)) {
        console.error(`Invalid background image content type: ${contentType}`);
        
        return res.status(400).json({ 
          error: 'Invalid background image type', 
          details: {
            backgroundKey,
            contentType,
            allowedTypes: allowedImageTypes
          }
        });
      }

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