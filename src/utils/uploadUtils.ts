import { v4 as uuidv4 } from 'uuid';

// Bucket name for Google Cloud Storage
const bucketName = "meirim-likud-join";

// Get client IP address (best effort)
const getClientIp = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get client IP:', error);
    return 'unknown';
  }
};

// Get browser information
const getBrowserInfo = (): Record<string, string> => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled.toString(),
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset().toString(),
  };
};

// Generate the upload context identifier in the required format
export const generateUploadContext = (idNumber: string): string => {
  const timestamp = new Date().toISOString();
  const uuid = uuidv4();
  return `${idNumber}-${timestamp}-${uuid}`;
};

// Get a pre-signed URL for uploading a file to Google Cloud Storage
const getSignedUploadUrl = async (
  fileName: string,
  contentType: string,
  idNumber: string
): Promise<{ signedUrl: string; uploadContext: string; fileUrl: string }> => {
  try {
    const response = await fetch('/.netlify/functions/generate-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        contentType,
        idNumber,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get signed URL: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
};

// Upload metadata to Google Cloud Storage
const uploadMetadata = async (
  uploadContext: string,
  metadata: any,
  pdfUrl: string
): Promise<{ jsonUrl: string }> => {
  try {
    const response = await fetch('/.netlify/functions/upload-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uploadContext,
        metadata,
        pdfUrl,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload metadata: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw error;
  }
};

// Upload a file to Google Cloud Storage using a pre-signed URL
const uploadFileWithSignedUrl = async (
  file: Blob,
  signedUrl: string,
  contentType: string
): Promise<void> => {
  try {
    console.log(`Uploading file using signed URL`);
    
    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Upload response: ${response.status} ${errorText}`);
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }
    
    console.log("Upload successful");
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

// Upload both PDF and JSON files
export const uploadFormFiles = async (
  pdfBlob: Blob, 
  formData: any
): Promise<{ pdfUrl: string, jsonUrl: string }> => {
  try {
    // Get client IP and browser info
    const [clientIp, browserInfo] = await Promise.all([
      getClientIp(),
      Promise.resolve(getBrowserInfo())
    ]);
    
    // Enhance form data with client information
    const enhancedFormData = {
      ...formData,
      metadata: {
        ipAddress: clientIp,
        browserInfo,
        timestamp: new Date().toISOString(),
      }
    };
    
    // Get signed URL for PDF upload
    console.log("Getting signed URL for PDF upload...");
    const { signedUrl: pdfSignedUrl, uploadContext, fileUrl: pdfUrl } = await getSignedUploadUrl(
      `${formData.idNumber}.pdf`,
      'application/pdf',
      formData.idNumber
    );
    
    // Upload PDF using signed URL
    console.log("Uploading PDF...");
    await uploadFileWithSignedUrl(pdfBlob, pdfSignedUrl, 'application/pdf');
    
    // Upload JSON metadata
    console.log("Uploading JSON metadata...");
    const { jsonUrl } = await uploadMetadata(uploadContext, enhancedFormData, pdfUrl);
    
    return { pdfUrl, jsonUrl };
  } catch (error) {
    console.error("Failed to upload files:", error);
    throw error;
  }
};
