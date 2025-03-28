const { Storage } = require('@google-cloud/storage');
const crypto = require('crypto');

// Function to parse the service account key from environment variable
const parseServiceAccountKey = () => {
  try {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  } catch (error) {
    console.error('Error parsing service account key:', error);
    throw new Error('Invalid service account key format');
  }
};

// Generate a unique upload context identifier
const generateUploadContext = (idNumber) => {
  const timestamp = new Date().toISOString();
  const uuid = crypto.randomUUID();
  return `${idNumber}-${timestamp}-${uuid}`;
};

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { fileName, contentType, idNumber } = body;

    if (!fileName || !contentType || !idNumber) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: fileName, contentType, idNumber' }),
      };
    }

    // Generate a unique upload context
    const uploadContext = generateUploadContext(idNumber);
    
    // Create a new filename with the upload context
    const finalFileName = fileName.includes('.') 
      ? `uploads/${uploadContext}.${fileName.split('.').pop()}`
      : `uploads/${uploadContext}`;

    // Initialize Google Cloud Storage with credentials from environment variable
    const serviceAccount = parseServiceAccountKey();
    const storage = new Storage({
      projectId: serviceAccount.project_id,
      credentials: serviceAccount,
    });

    const bucketName = "meirim-likud-join";
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(finalFileName);

    // Generate a signed URL for uploading
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
      contentType: contentType,
    });

    // Return the signed URL and file details to the client
    return {
      statusCode: 200,
      body: JSON.stringify({
        signedUrl,
        fileName: finalFileName,
        uploadContext,
        fileUrl: `https://storage.googleapis.com/${bucketName}/${finalFileName}`,
      }),
    };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate signed URL' }),
    };
  }
};
