import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Debug mode can be enabled via environment variable or directly in code
const DEBUG_PDF_GRID = import.meta.env.VITE_DEBUG_PDF_GRID === 'true' || false;

// Define form field positions and their properties
type FormPosition = {
  x: number;
  y: number;
  fontSize?: number;
  maxWidth?: number;
};

type FormFields = {
  idNumber?: FormPosition;
  firstName?: FormPosition;
  lastName?: FormPosition;
  fatherName?: FormPosition;
  birthDate?: FormPosition;
  gender?: FormPosition;
  maritalStatus?: FormPosition;
  birthCountry?: FormPosition;
  immigrationYear?: FormPosition;
  address?: FormPosition;
  city?: FormPosition;
  zipCode?: FormPosition;
  mobile?: FormPosition;
  emailUsername?: FormPosition;
  emailDomain?: FormPosition;
  signature?: FormPosition;
};

// Form field positions for an A4-sized PDF (595 x 842 points)
const FORM_FIELDS: FormFields = {
  idNumber: { x: 495, y: 685, fontSize: 12 },
  firstName: { x: 175, y: 685, fontSize: 12 },
  lastName: { x: 325, y: 685, fontSize: 12 },
  fatherName: { x: 390, y: 625, fontSize: 12 },
  birthDate: { x: 390, y: 600, fontSize: 12 },
  gender: { x: 280, y: 600, fontSize: 12 },
  maritalStatus: { x: 390, y: 575, fontSize: 12 },
  birthCountry: { x: 200, y: 575, fontSize: 12 },
  immigrationYear: { x: 390, y: 550, fontSize: 12 },
  address: { x: 390, y: 525, fontSize: 12 },
  city: { x: 200, y: 525, fontSize: 12 },
  zipCode: { x: 390, y: 500, fontSize: 12 },
  mobile: { x: 390, y: 475, fontSize: 12 },
  emailUsername: { x: 300, y: 475, fontSize: 12 },
  emailDomain: { x: 200, y: 475, fontSize: 12 },
  signature: { x: 300, y: 300, maxWidth: 150 },
};

// URL to the font file in the public directory
const FONT_URL = '/fonts/LiberationMono-Regular.ttf';

/**
 * Adds a visual debug grid to the PDF to help with positioning elements
 * @param page The PDF page to add the grid to
 * @param pageWidth Width of the page in points
 * @param pageHeight Height of the page in points
 * @param gridSpacing Spacing between grid lines in points
 */
const addDebugGrid = (
  page: any,
  pageWidth: number = 595, // A4 width in points
  pageHeight: number = 842, // A4 height in points
  gridSpacing: number = 10
): void => {
  // Draw vertical lines
  for (let x = 0; x <= pageWidth; x += gridSpacing) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: pageHeight },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8), // Light gray
    });
    
    // Add x-coordinate labels with offset for odd lines
    const isOdd = Math.floor(x / gridSpacing) % 2 === 1;
    page.drawText(`${x}`, {
      x: x + 2,
      y: isOdd ? 30 : 5, // Offset odd lines by 25px
      size: 8,
      color: rgb(0.5, 0.5, 0.8), // Blue-gray
    });
  }

  // Draw horizontal lines
  for (let y = 0; y <= pageHeight; y += gridSpacing) {
    page.drawLine({
      start: { x: 0, y },
      end: { x: pageWidth, y },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8), // Light gray
    });
    
    // Add y-coordinate labels with offset for odd lines
    const isOdd = Math.floor(y / gridSpacing) % 2 === 1;
    page.drawText(`${y}`, {
      x: isOdd ? 30 : 5, // Offset odd lines by 25px
      y: y + 2,
      size: 8,
      color: rgb(0.5, 0.5, 0.8), // Blue-gray
    });
  }
};

/**
 * Adds form data to a PDF document using an embedded font for vector text
 * @param pdfUrl URL of the base PDF to modify
 * @param formData User's form data to add
 * @param countries Array of country objects for resolving country names
 * @param debug Optional override for debug grid (overrides environment variable)
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
    gender: string;
    maritalStatus: string;
    birthCountry: string;
    immigrationYear?: string;
    address: string;
    city: string;
    zipCode?: string;
    mobile: string;
    email: string;
    signature: string;
  },
  countries: Array<{ code: string; name: string }>,
  debug?: boolean
): Promise<Blob> => {
  try {
    // Fetch the base PDF
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) throw new Error('Failed to fetch PDF');
    const pdfBytes = await pdfResponse.arrayBuffer();

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.registerFontkit(fontkit); // Register fontkit for custom font embedding

    // Fetch and embed the font from the public directory
    const fontResponse = await fetch(FONT_URL);
    if (!fontResponse.ok) throw new Error('Failed to fetch font');
    const fontBytes = await fontResponse.arrayBuffer();
    const customFont = await pdfDoc.embedFont(fontBytes);

    // Get the first page
    const page = pdfDoc.getPages()[0];
    if (!page) throw new Error('PDF has no pages');

    // Add debug grid if enabled (either via env var or parameter)
    const showDebugGrid = debug !== undefined ? debug : DEBUG_PDF_GRID;
    if (showDebugGrid) {
      const { width, height } = page.getSize();
      addDebugGrid(page, width, height);
    }

    // Format birthdate for Hebrew locale
    const formattedBirthDate = formData.birthDate instanceof Date
      ? formData.birthDate.toLocaleDateString('he-IL')
      : String(formData.birthDate);

    // Map marital status to Hebrew text
    const maritalStatusMap: Record<string, string> = {
      'ר': 'רווק/ה', // Single
      'נ': 'נשוי/אה', // Married
      'ג': 'גרוש/ה', // Divorced
      'א': 'אלמן/ה' // Widowed
    };
    const maritalStatusText = maritalStatusMap[formData.maritalStatus] || formData.maritalStatus;

    // Split email into username and domain parts for better placement on PDF
    const emailParts = formData.email.split('@');
    const emailUsername = emailParts[0];
    const emailDomain = emailParts.length > 1 ? `@${emailParts[1]}` : '';

    // Add all text fields with the embedded font
    await addTextToPdf(page, customFont, formData.idNumber, FORM_FIELDS.idNumber);
    await addTextToPdf(page, customFont, formData.firstName, FORM_FIELDS.firstName);
    await addTextToPdf(page, customFont, formData.lastName, FORM_FIELDS.lastName);
    await addTextToPdf(page, customFont, formData.fatherName, FORM_FIELDS.fatherName);
    await addTextToPdf(page, customFont, formattedBirthDate, FORM_FIELDS.birthDate);
    await addTextToPdf(page, customFont, formData.gender, FORM_FIELDS.gender);
    await addTextToPdf(page, customFont, maritalStatusText, FORM_FIELDS.maritalStatus);
    await addTextToPdf(page, customFont, formData.birthCountry, FORM_FIELDS.birthCountry);
    if (formData.immigrationYear) {
      await addTextToPdf(page, customFont, formData.immigrationYear, FORM_FIELDS.immigrationYear);
    }
    await addTextToPdf(page, customFont, formData.address, FORM_FIELDS.address);
    await addTextToPdf(page, customFont, formData.city, FORM_FIELDS.city);
    if (formData.zipCode) {
      await addTextToPdf(page, customFont, formData.zipCode, FORM_FIELDS.zipCode);
    }
    await addTextToPdf(page, customFont, formData.mobile, FORM_FIELDS.mobile);
    
    // Add email as separate parts for better positioning
    await addTextToPdf(page, customFont, emailUsername, FORM_FIELDS.emailUsername);
    await addTextToPdf(page, customFont, emailDomain, FORM_FIELDS.emailDomain);

    // Add signature (still as an image)
    if (formData.signature) {
      await addSignatureToPdf(pdfDoc, page, formData.signature, FORM_FIELDS.signature);
    }

    // Save and return the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    return new Blob([modifiedPdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error adding form data to PDF:', error);
    throw error;
  }
};

/**
 * Adds text to the PDF page using the embedded font, with RTL support for Hebrew
 */
const addTextToPdf = async (
  page: any,
  font: any,
  text: string,
  position?: FormPosition
): Promise<void> => {
  if (!position || !text) return;

  const fontSize = position.fontSize || 12;
  const textWidth = font.widthOfTextAtSize(text, fontSize);

  // Adjust x-position for RTL (start from the right)
  const x = position.x - textWidth;

  page.drawText(text, {
    x,
    y: position.y,
    size: fontSize,
    font,
    color: rgb(0, 0, 0), // Black text
  });
};

/**
 * Adds a signature image to the PDF
 */
const addSignatureToPdf = async (
  pdfDoc: PDFDocument,
  page: any,
  signatureDataUrl: string,
  position?: FormPosition
): Promise<void> => {
  if (!position || !signatureDataUrl) return;

  const base64Data = signatureDataUrl.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
  let embeddedImage;

  if (signatureDataUrl.includes('image/png')) {
    embeddedImage = await pdfDoc.embedPng(base64Data);
  } else if (signatureDataUrl.includes('image/jpeg') || signatureDataUrl.includes('image/jpg')) {
    embeddedImage = await pdfDoc.embedJpg(base64Data);
  } else {
    throw new Error('Unsupported signature image format');
  }

  const width = position.maxWidth || 150;
  const height = (width / embeddedImage.width) * embeddedImage.height;

  page.drawImage(embeddedImage, {
    x: position.x,
    y: position.y,
    width,
    height,
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
