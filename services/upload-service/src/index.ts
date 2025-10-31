import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * GET /
 * Root endpoint with service information
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'upload-service',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      upload: 'POST /upload (multipart/form-data)'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'upload-service',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /upload
 * Upload artwork to Supabase Storage
 */
app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { title, description, creator_wallet, prompt, ai_model, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!title || !description || !creator_wallet) {
      return res.status(400).json({
        error: 'Missing required fields: title, description, creator_wallet'
      });
    }

    // Compute SHA-256 hash
    const hash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    // DUPLICATE CHECK: See if an artwork with this hash exists
    const { data: duplicate } = await supabase
      .from('artworks')
      .select('id')
      .eq('metadata_hash', hash)
      .maybeSingle();

    if (duplicate && duplicate.id) {
      return res.status(409).json({
        error: 'Duplicate image',
        duplicate: true,
        existingArtworkId: duplicate.id
      });
    }

    // Generate unique filename
    const filename = `${hash}-${Date.now()}.${req.file.originalname.split('.').pop()}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('artworks')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('artworks')
      .getPublicUrl(filename);

    // Create artwork record
    const artworkData: any = {
      title,
      description,
      image_url: urlData.publicUrl,
      metadata_hash: hash,
      creator_wallet: creator_wallet.toLowerCase(),
      minted: false
    };
    
    if (prompt) artworkData.prompt = prompt;
    if (ai_model) artworkData.ai_model = ai_model;

    const { data: artwork, error: dbError } = await supabase
      .from('artworks')
      .insert(artworkData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to create artwork record' });
    }

    // Handle tags if provided
    if (tags) {
      try {
        const tagNames = JSON.parse(tags);
        if (Array.isArray(tagNames) && tagNames.length > 0) {
          // Get or create tags
          for (const tagName of tagNames) {
            // Check if tag exists
            let { data: existingTag } = await supabase
              .from('tags')
              .select('id')
              .eq('name', tagName.toLowerCase())
              .single();

            if (!existingTag) {
              // Create new tag
              const { data: newTag } = await supabase
                .from('tags')
                .insert({ name: tagName.toLowerCase() })
                .select()
                .single();
              existingTag = newTag;
            }

            if (existingTag) {
              // Link tag to artwork
              await supabase
                .from('artwork_tags')
                .insert({
                  artwork_id: artwork.id,
                  tag_id: existingTag.id
                });
            }
          }
        }
      } catch (tagError) {
        console.error('Error processing tags:', tagError);
        // Don't fail the upload if tags fail
      }
    }

    res.json({
      artworkId: artwork.id,
      hash,
      image_url: artwork.image_url,
      title: artwork.title,
      description: artwork.description
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`📤 Upload service running on port ${PORT}`);
});

export default app;

