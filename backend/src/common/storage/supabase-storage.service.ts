import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class SupabaseStorageService {
  private readonly client = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );

  private readonly bucket =
    process.env.SUPABASE_STORAGE_BUCKET ?? 'profile-pictures';

  async uploadProfilePicture(file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
  }) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new InternalServerErrorException(
        'Supabase storage is not configured',
      );
    }

    const fileName = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    const path = `profile-pictures/${fileName}`;

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
