
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type FormPosition = {
  x: number;
  y: number;
  fontSize?: number;
  maxWidth?: number;
};

type FormFields = {
  idNumber?: FormPosition;
  fullName?: FormPosition;
  firstName?: FormPosition;
  lastName?: FormPosition;
  fatherName?: FormPosition;
  birthDate?: FormPosition;
  maritalStatus?: FormPosition;
  birthCountry?: FormPosition;
  immigrationYear?: FormPosition;
  address?: FormPosition;
  city?: FormPosition;
  zipCode?: FormPosition;
  mobile?: FormPosition;
  email?: FormPosition;
  signature?: FormPosition;
};

// Form field positions (to be adjusted manually)
const FORM_FIELDS: FormFields = {
  idNumber: { x: 390, y: 675, fontSize: 12 },
  firstName: { x: 390, y: 650, fontSize: 12 },
  lastName: { x: 200, y: 650, fontSize: 12 },
  fatherName: { x: 390, y: 625, fontSize: 12 },
  birthDate: { x: 390, y: 600, fontSize: 12 },
  maritalStatus: { x: 390, y: 575, fontSize: 12 },
  birthCountry: { x: 200, y: 575, fontSize: 12 },
  immigrationYear: { x: 390, y: 550, fontSize: 12 },
  address: { x: 390, y: 525, fontSize: 12 },
  city: { x: 200, y: 525, fontSize: 12 },
  zipCode: { x: 390, y: 500, fontSize: 12 },
  mobile: { x: 390, y: 475, fontSize: 12 },
  email: { x: 200, y: 475, fontSize: 12 },
  signature: { x: 300, y: 300, maxWidth: 150 },
};

/**
 * Adds form data to a PDF document with specific positioning
 * @param pdfUrl URL of the PDF to modify
 * @param formData User's form data to add to the PDF
 * @returns Blob of the modified PDF
 */
export const addFormDataToPdf = async (
  pdfUrl: string, 
  formData: {
    idNumber: string;
    firstName: string;
    lastName: string;
    fatherName: string;
    birthDate: Date;
    maritalStatus: string;
    birthCountry: string;
    immigrationYear?: string;
    address: string;
    city: string;
    zipCode?: string;
    mobile: string;
    email: string;
    signature: string;
  }
): Promise<Blob> => {
  try {
    // Fetch the PDF
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error('Failed to fetch PDF');
    }
    
    const pdfBytes = await pdfResponse.arrayBuffer();
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get the first page
    const pages = pdfDoc.getPages();
    if (pages.length === 0) {
      throw new Error('PDF has no pages');
    }
    
    const firstPage = pages[0];
    
    // Format birthdate to a string
    const formattedBirthDate = formData.birthDate instanceof Date
      ? formData.birthDate.toLocaleDateString('he-IL')
      : String(formData.birthDate);
    
    // Create a canvas for text rendering (for Hebrew support)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }
    
    // Add each form field to the PDF
    await Promise.all([
      addTextFieldToPdf(pdfDoc, firstPage, ctx, formData.idNumber, FORM_FIELDS.idNumber),
      addTextFieldToPdf(pdfDoc, firstPage, ctx, formData.firstName, FORM_FIELDS.firstName),
      addTextFieldToPdf(pdfDoc, firstPage, ctx, formData.lastName, FORM_FIELDS.lastName),
      addTextFieldToPdf(pdfDoc, firstPage, ctx, formData.fatherName, FORM_FIELDS.fatherName),
      addTextFieldToPdf(pdfDoc, firstPage, ctx, formattedBirthDate, FORM_FIELDS.birthDate),
      addTextFieldToPdf(pdfDoc, firstPage, ctx, formData.maritalStatus, FORM_FIELDS.maritalStatus),
      addTextFieldToPdf(pdfDoc, firstPage, ctx, formData.birthCountry, FORM_FIELDS.birthCountry),
      formData.immigrationYear
        ? addTextFieldToPdf(pdfDoc, firstPage, ctx, formData.immigrationYear, FORM_FIELDS.immigrationYear)
        : Promise.resolve(),
      addTextFieldToPdf(pdfDoc, firstPage, ctx, formData.address, FORM_FIELDS.address),
      addTextFieldToPdf(pdfDoc, firstPage, ctx, formData.city, FORM_FIELDS.city),
      formData.zipCode
        ? addTextFieldToPdf(pdfDoc, firstPage, ctx, formData.zipCode, FORM_FIELDS.zipCode)
        : Promise.resolve(),
      addTextFieldToPdf(pdfDoc, firstPage, ctx, formData.mobile, FORM_FIELDS.mobile),
      addTextFieldToPdf(pdfDoc, firstPage, ctx, formData.email, FORM_FIELDS.email),
      // Add signature image
      addSignatureToPdf(pdfDoc, firstPage, formData.signature, FORM_FIELDS.signature),
    ]);
    
    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    
    // Convert to Blob
    return new Blob([modifiedPdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error adding form data to PDF:', error);
    throw error;
  }
};

/**
 * Helper function to add a text field to the PDF
 */
const addTextFieldToPdf = async (
  pdfDoc: PDFDocument,
  page: any,
  ctx: CanvasRenderingContext2D,
  text: string,
  position?: FormPosition
): Promise<void> => {
  if (!position || !text) return;
  
  const fontSize = position.fontSize || 12;
  
  // Set canvas properties
  const canvasWidth = 500;
  const canvasHeight = 60;
  
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = 'rgb(0, 0, 0)'; // BLACK color
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  
  // Draw text on canvas
  ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);
  
  // Convert canvas to image data URL
  const imgData = canvas.toDataURL('image/png');
  
  // Remove the data URL prefix to get just the base64 content
  const base64Data = imgData.replace(/^data:image\/(png|jpg);base64,/, '');
  
  // Embed the image into the PDF
  const textImage = await pdfDoc.embedPng(base64Data);
  
  // Calculate actual width based on text
  const actualWidth = Math.min(ctx.measureText(text).width + 20, position.maxWidth || 200);
  
  // Draw the image on the page at the specified position
  page.drawImage(textImage, {
    x: position.x,
    y: position.y,
    width: actualWidth,
    height: (actualWidth / textImage.width) * textImage.height,
  });
};

/**
 * Helper function to add a signature to the PDF
 */
const addSignatureToPdf = async (
  pdfDoc: PDFDocument,
  page: any,
  signatureDataUrl: string,
  position?: FormPosition
): Promise<void> => {
  if (!position || !signatureDataUrl) return;
  
  try {
    // Remove the data URL prefix to get just the base64 content
    const base64Data = signatureDataUrl.replace(/^data:image\/(png|jpg|jpeg|svg\+xml);base64,/, '');
    
    // Determine image type
    let embeddedImage;
    if (signatureDataUrl.includes('image/png')) {
      embeddedImage = await pdfDoc.embedPng(base64Data);
    } else if (signatureDataUrl.includes('image/jpeg') || signatureDataUrl.includes('image/jpg')) {
      embeddedImage = await pdfDoc.embedJpg(base64Data);
    } else {
      // For SVG or other formats, convert to PNG first
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = signatureDataUrl;
      });
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngDataUrl = canvas.toDataURL('image/png');
        const pngBase64 = pngDataUrl.replace(/^data:image\/png;base64,/, '');
        embeddedImage = await pdfDoc.embedPng(pngBase64);
      } else {
        throw new Error('Could not get canvas context');
      }
    }
    
    const width = position.maxWidth || 150;
    const height = (width / embeddedImage.width) * embeddedImage.height;
    
    // Draw the signature on the page at the specified position
    page.drawImage(embeddedImage, {
      x: position.x,
      y: position.y,
      width,
      height,
    });
  } catch (error) {
    console.error('Error adding signature to PDF:', error);
  }
};

/**
 * Adds the user's name in red italic text to a PDF document (legacy function)
 * @param pdfUrl URL of the PDF to modify
 * @param name User's name to add to the PDF
 * @returns Blob of the modified PDF
 */
export const addTextToPdf = async (pdfUrl: string, name: string): Promise<Blob> => {
  // Redirect to the new function for backward compatibility
  return addFormDataToPdf(pdfUrl, {
    idNumber: '',
    firstName: name.split(' ')[0] || '',
    lastName: name.split(' ')[1] || '',
    fatherName: '',
    birthDate: new Date(),
    maritalStatus: '',
    birthCountry: '',
    address: '',
    city: '',
    mobile: '',
    email: '',
    signature: '',
  });
};

/**
 * Creates a download link for the modified PDF
 * @param blob PDF Blob to download
 * @param filename Name to give the downloaded file
 */
export const downloadPdf = (blob: Blob, filename: string = 'modified-document.pdf'): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
