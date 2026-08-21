const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('../config');

function getClient() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2.accessKeyId,
      secretAccessKey: config.r2.secretAccessKey,
    },
  });
}

function buildKey(filename) {
  const ext = (filename.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = crypto.randomBytes(12).toString('hex');
  return `uploads/${yyyy}/${mm}/${rand}.${ext}`;
}

async function getPresignedUploadUrl({ filename, contentType }) {
  const key = buildKey(filename);
  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: config.r2.bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 }); // 5 min
  const publicUrl = `${config.r2.publicBaseUrl.replace(/\/$/, '')}/${key}`;
  return { key, uploadUrl, publicUrl };
}

async function deleteObject(key) {
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: config.r2.bucket, Key: key }));
}

module.exports = { getPresignedUploadUrl, deleteObject };
