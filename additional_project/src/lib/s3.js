import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
      return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    } catch (err) {
      console.error('AWS S3 Upload Failed, executing fallback:', err);
    }
  }

  // Fallback: Convert to Base64 Data URL so file preview & downloads always work 100%!
  const base64 = buffer.toString('base64');
  return `data:${mimeType || 'application/pdf'};base64,${base64}`;
}
