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
    const { uploadContext, metadata, pdfUrl } = body;

    if (!uploadContext || !metadata) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: uploadContext, metadata' }),
      };
    }

    // Initialize Google Cloud Storage with credentials from environment variable
    const serviceAccount = parseServiceAccountKey();
    const storage = new Storage({
      projectId: serviceAccount.project_id,
      credentials: serviceAccount,
    });

    const bucketName = "meirim-likud-join";
    const bucket = storage.bucket(bucketName);
    
    // Create filename for the JSON metadata
    const jsonFileName = `uploads/${uploadContext}.json`;
    const file = bucket.file(jsonFileName);

    // Enhance metadata with client information and PDF URL
    const enhancedMetadata = {
      ...metadata,
      metadata: {
        ...(metadata.metadata || {}),
        timestamp: new Date().toISOString(),
        pdfUrl: pdfUrl,
        objectPath: `uploads/${uploadContext}`
      }
    };

    // Upload JSON data directly to GCS
    await file.save(JSON.stringify(enhancedMetadata, null, 2), {
      contentType: 'application/json',
      metadata: {
        contentType: 'application/json',
      },
    });

    // Return success with the JSON file URL
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        jsonUrl: `https://storage.googleapis.com/${bucketName}/${jsonFileName}`,
      }),
    };
  } catch (error) {
    console.error('Error uploading metadata:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to upload metadata' }),
    };
  }
};
