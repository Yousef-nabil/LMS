import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

constructor() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is missing');
  }

  if (!supabaseKey) {
    throw new Error('SUPABASE_KEY is missing');
  }
  this.client = createClient(supabaseUrl, supabaseKey);
}

  async uploadFile(file: Express.Multer.File, bucket?: string) {
    const bucketName = (bucket || process.env.SUPABASE_BUCKET || 'lms-content').trim();
    const sanitizedName = file.originalname
      .replace(/\s+/g, '_')           // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9._-]/g, '') // Keep only safe characters
      .toLowerCase();                 // Optional: consistent casing

    const fileName = `${Date.now()}-${sanitizedName}`;
    const { data, error } = await this.client.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new BadRequestException(error.message || 'File upload failed');
    }

    const { data: publicData } = this.client.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      url: publicData.publicUrl,
      size: file.size,
    };
  }
}
