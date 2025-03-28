const { Storage } = require('@google-cloud/storage');

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
  const crypto = require('crypto');
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
    const { fileData, fileName, contentType, idNumber } = body;

    if (!fileData || !fileName || !contentType || !idNumber) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: fileData, fileName, contentType, idNumber' }),
      };
    }

    // Generate a unique upload context
    const uploadContext = generateUploadContext(idNumber);
    
    // Create a new filename with the upload context
    const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : '';
    const finalFileName = `uploads/${uploadContext}${fileExtension ? '.' + fileExtension : ''}`;

    // Initialize Google Cloud Storage with credentials from environment variable
    const serviceAccount = parseServiceAccountKey();
    const storage = new Storage({
      projectId: serviceAccount.project_id,
      credentials: serviceAccount,
    });

    const bucketName = "meirim-likud-join";
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(finalFileName);

    // Decode base64 data
    // Remove the data URL prefix if present
    let base64Data = fileData;
    if (base64Data.includes('base64,')) {
      base64Data = base64Data.split('base64,')[1];
    }
    
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Upload file to GCS
    await file.save(fileBuffer, {
      contentType: contentType,
      metadata: {
        contentType: contentType,
      },
    });

    // Return the file details to the client
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        fileName: finalFileName,
        uploadContext,
        fileUrl: `https://storage.googleapis.com/${bucketName}/${finalFileName}`,
      }),
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to upload file' }),
    };
  }
};
