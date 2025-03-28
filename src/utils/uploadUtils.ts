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

// Convert Blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Upload a file to Google Cloud Storage via Netlify function
const uploadFileToGCS = async (
  file: Blob,
  fileName: string,
  contentType: string,
  idNumber: string
): Promise<{ fileUrl: string; uploadContext: string }> => {
  try {
    console.log(`Preparing to upload file: ${fileName}`);
    
    // Convert file to base64
    const base64Data = await blobToBase64(file);
    
    // Send to Netlify function
    const response = await fetch('/.netlify/functions/upload-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileData: base64Data,
        fileName,
        contentType,
        idNumber,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Upload response: ${response.status} ${errorText}`);
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Upload successful:", data);
    
    return {
      fileUrl: data.fileUrl,
      uploadContext: data.uploadContext
    };
  } catch (error) {
    console.error("Upload error:", error);
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
    
    // Upload PDF file
    console.log("Uploading PDF...");
    const { fileUrl: pdfUrl, uploadContext } = await uploadFileToGCS(
      pdfBlob,
      `${formData.idNumber}.pdf`,
      'application/pdf',
      formData.idNumber
    );
    
    // Upload JSON metadata
    console.log("Uploading JSON metadata...");
    const { jsonUrl } = await uploadMetadata(uploadContext, enhancedFormData, pdfUrl);
    
    return { pdfUrl, jsonUrl };
  } catch (error) {
    console.error("Failed to upload files:", error);
    throw error;
  }
};
