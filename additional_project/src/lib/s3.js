import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.AWS_REGION || 'ap-south-1';
const bucketName = process.env.AWS_S3_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

let s3Client = null;

if (bucketName && accessKeyId && secretAccessKey) {
  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

/**
 * Uploads a file to AWS S3 bucket. Fallback to Data URI if AWS S3 credentials are not set.
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} Public URL of uploaded file
 */
export async function uploadFileToS3(buffer, originalName, mimeType) {
  const timestamp = Date.now();
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `slides/${timestamp}_${sanitizedName}`;

  if (s3Client && bucketName) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType || 'application/pdf'
      });

      await s3Client.send(command);
      // Bucket is private, so return an app URL that redirects to a short-lived signed URL.
      return `/api/file?key=${encodeURIComponent(key)}`;
    } catch (err) {
      console.error('AWS S3 Upload Failed, executing fallback:', err);
    }
  }

  // Fallback: Convert to Base64 Data URL so file preview & downloads always work 100%!
  const base64 = buffer.toString('base64');
  return `data:${mimeType || 'application/pdf'};base64,${base64}`;
}

/**
 * Creates a short-lived signed URL to read a private S3 object.
 * @param {string} key - Object key (must be under slides/)
 * @param {{ download?: string }} [options] - Pass a filename to force download
 * @returns {Promise<string|null>} Signed URL, or null if S3 is not configured
 */
export async function getSignedFileUrl(key, options = {}) {
  if (!s3Client || !bucketName) return null;

  const params = { Bucket: bucketName, Key: key };
  if (options.download) {
    const safeName = options.download.replace(/["\\\r\n]/g, '_');
    params.ResponseContentDisposition = `attachment; filename="${safeName}"`;
  } else {
    params.ResponseContentDisposition = 'inline';
  }

  return getSignedUrl(s3Client, new GetObjectCommand(params), { expiresIn: 600 });
}
