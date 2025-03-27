import { v4 as uuidv4 } from 'uuid';
import { ensureJsrsasignLoaded } from './loadJsrsasign';

// Service account information
const serviceAccount = {
  "type": "service_account",
  "project_id": "mzm-org-il",
  "private_key_id": "65bc9876eab227f7112a7e3634084c59ce6fd36b",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC2GWaZLvNxrHPd\n+zXJy0Qi3AVwo9KHOr77FJ5Lru4126Nulaw28rraHzfQCW3AXP6F9s3SV9WjHL3l\nRKm/4SsP+Y7cwBzZEKHOsuO/TbPF9O+33JgUsvhVSZjOauCSZaLHuoT6Iv/yGrbJ\nTfhqKpCyX5Q2pLzLEY7RWTj8vLDarTTlO1SI2t4eMNwrDJ4XlftDeuI/roQbXnW4\nBY+SZpVRnBtvmsmQsp7M9SiUPsKVyvyvOWYSKGLmcch0zER/pLJeWQqORXOKxzVg\n/jTYR39EPYJz1VwSO/Iqw7dvjMTweNABth0ewy6RlJyFDmewCObwM0qEZvLOtBia\naJQnlv2hAgMBAAECggEAGDOMBTPOOv9WbtwiK+2N4qwnNO8w3bQbCbeVyi03j4Tf\nVaUivDLKTo7zlfyKz5QMZ7WDaT8vL3x0aHIVtWCxnm/mYsRNkTO6rYPs7NHg4KBK\n876nn6ihhIRBgL2Hly1W0wChB7V7GqweOubX6xQ5Itu9EP4X8U0mFACtqDlTr9w3\nzV/FKysM5MBEsamDINKvifM2IcavtqTl6gTL6IaoBAla2d9p45AcHAQ0Gck/PUrx\n0pvJy2h7a2ILPj9qSrk6edx+o5l2qOgC/TVsIPPzv+lM9dUxUZBhnM33eUojC1WM\nNdst0B4WjoYSols4GN/6u5ochf7JXpFbu54XvwI3GQKBgQDfLTxIkCa72GuCd97x\nFrOh6I9p5Rhvnp1Vs07Yh2UB/EbrdUFVP8nx2n8SvbnOwUkDX60mG6mOgzHs/uEM\nw2/z2xZfdb0k+o7aXPd0ClOeOUwvEIWDMp1fZFrs45uIC7lcFdmwttsGlXlJMo27\nrTqbOnjpGtidlZbV5gSiz27LBwKBgQDQ4ZGEoBx4zpVmVx5AXNOGbEwqb/WPAsL9\nXkc0rqQ2UXi5nJUvVbqoedRPnzlEwil5ACS4m/Yig6eXQ4W+DN7Ts40ww//dKPo5\nl1MSrZ6fgPK1/hVD9DPJ7/s2JDOnIUbm+inKp92dPSk5F6pG5sOb1+o56DHiyqO/\nS8MDeddAFwKBgBUaXOnrn44Bn+DdXtpjMCcuK2ly/UWItQ3mf50f6GAwr7ASDVR3\nTKwu4fcus4QmaLYF9QR2dyj/pNfpHfSsAkkHvWzXYEQ/4QQq6EcztsZuWpLUuBs4\nzQK5JZPizdEmcqePdV8tWzabKbXPLvHBJpqJA+fe3v6/p1ygfG28uZg/AoGBAM5h\n4TaqQBd4/hJlB2XOkcziWgsgHf7UWraenTpHR8bHjsHOHXTsfoYSAZ0+FAaE1RdR\n9fZVWsdVT5RcSduyucNwR5OkRL1OzJV0l8b/tpegf68jwf0nXrgqngorkMGUVorH\nJ92tKIFAuedII5z0StdDaZEXg5qyX0IWaDOaAfy3AoGAJwnWYbUyngwQah5dU66+\nwqN+Smoa/s/ymtcQvwKgZ6uO4QriDGeOVm8KsHYJAm9AvfC1lvi3WfFyCiJs3BH2\nlJS2QTunWx0uk7LHF6z1p2LqYxQa30qUuy/ysLQYN5bz8zL3tPF0wZjn/jHSJbHT\n4R4xrNWP6zP1pHD4fzqGg+s=\n-----END PRIVATE KEY-----\n",
  "client_email": "meirim-likud-join-locked-sa@mzm-org-il.iam.gserviceaccount.com",
  "client_id": "105232386328420157839",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/meirim-likud-join-locked-sa%40mzm-org-il.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

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

// Generate JWT using the service account private key
const generateJWT = async () => {
  await ensureJsrsasignLoaded();
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: serviceAccount.token_uri,
    iat: now,
    exp: now + 3600 // Token expires in 1 hour
  };
  const header = { alg: "RS256", typ: "JWT" };
  
  return window.KJUR.jws.JWS.sign("RS256", JSON.stringify(header), JSON.stringify(payload), serviceAccount.private_key);
};

// Obtain an access token from Google
const getAccessToken = async (): Promise<string> => {
  try {
    const jwt = await generateJWT();
    const response = await fetch(serviceAccount.token_uri, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
};

// Upload a file to Google Cloud Storage
export const uploadFileToGCS = async (
  file: Blob, 
  fileName: string, 
  contentType: string
): Promise<string> => {
  try {
    console.log(`Uploading file: ${fileName} (${contentType})`);
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Encode the filename for URL
    const encodedObjectName = encodeURIComponent(`uploads/${fileName}`);
    const url = `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o?uploadType=media&name=${encodedObjectName}`;
    
    console.log(`Upload URL: ${url}`);
    
    // Upload the file
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": contentType
      },
      body: file
    });

    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Upload response: ${response.status} ${errorText}`);
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Upload successful:", data);
    
    return data.selfLink || `https://storage.googleapis.com/${bucketName}/uploads/${fileName}`;
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
    // Generate unique identifier
    const uploadContext = generateUploadContext(formData.idNumber);
    console.log("Upload context:", uploadContext);
    
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
    
    // Convert form data to JSON blob
    const jsonBlob = new Blob([JSON.stringify(enhancedFormData, null, 2)], { type: 'application/json' });
    
    // Upload both files one after another (not concurrently to avoid race conditions)
    console.log("Uploading PDF...");
    const pdfUrl = await uploadFileToGCS(
      pdfBlob, 
      `${uploadContext}.pdf`, 
      'application/pdf'
    );
    
    console.log("Uploading JSON...");
    // Add the PDF URL to the JSON metadata before uploading
    const finalMetadata = {
      ...enhancedFormData,
      metadata: {
        ...enhancedFormData.metadata,
        pdfUrl: pdfUrl,
        objectPath: `uploads/${uploadContext}`
      }
    };
    
    // Upload the updated JSON
    const updatedJsonBlob = new Blob([JSON.stringify(finalMetadata, null, 2)], { type: 'application/json' });
    const jsonUrl = await uploadFileToGCS(
      updatedJsonBlob, 
      `${uploadContext}.json`, 
      'application/json'
    );
    
    return { pdfUrl, jsonUrl };
  } catch (error) {
    console.error("Failed to upload files:", error);
    throw error;
  }
};
