import { NextResponse } from 'next/server';
import { uploadFileToS3 } from '@/lib/s3';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Calculate readable file size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const readableSize = `${sizeInMB} MB`;

    // Upload to AWS S3 (or fallback Data URI)
    const fileUrl = await uploadFileToS3(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      fileSize: readableSize,
      fileType: file.name.split('.').pop() || 'pdf'
    });
  } catch (error) {
    console.error('File Upload Route Error:', error);
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}
