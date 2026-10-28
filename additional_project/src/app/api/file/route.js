import { NextResponse } from 'next/server';
import { getSignedFileUrl } from '@/lib/s3';

// Opens a private S3 file by redirecting to a short-lived signed URL.
// Usage: /api/file?key=slides/123_name.pdf  (add &download=name.pdf to force download)
export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get('key');
  const download = searchParams.get('download');

  // Only files uploaded by the portal can be opened.
  if (!key || !key.startsWith('slides/') || key.includes('..')) {
    return NextResponse.json({ error: 'Invalid file key' }, { status: 400 });
  }

  try {
    const signedUrl = await getSignedFileUrl(key, { download });
    if (!signedUrl) {
      return NextResponse.json({ error: 'File storage is not configured' }, { status: 503 });
    }
    return NextResponse.redirect(signedUrl, 307);
  } catch (error) {
    console.error('S3 Signed URL Error:', error);
    return NextResponse.json({ error: 'Failed to open file' }, { status: 500 });
  }
}
