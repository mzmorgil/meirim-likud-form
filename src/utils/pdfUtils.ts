import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

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

// Form field positions for an A4-sized PDF (595 x 842 points)
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

// URL to the font file in the public directory
const FONT_URL = '/fonts/LiberationMono-Regular.ttf';

/**
 * Adds form data to a PDF document using an embedded font for vector text
 * @param pdfUrl URL of the base PDF to modify
 * @param formData User's form data to add
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

    // Add all text fields with the embedded font
    await addTextToPdf(page, customFont, formData.idNumber, FORM_FIELDS.idNumber);
    await addTextToPdf(page, customFont, formData.firstName, FORM_FIELDS.firstName);
    await addTextToPdf(page, customFont, formData.lastName, FORM_FIELDS.lastName);
    await addTextToPdf(page, customFont, formData.fatherName, FORM_FIELDS.fatherName);
    await addTextToPdf(page, customFont, formattedBirthDate, FORM_FIELDS.birthDate);
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
    await addTextToPdf(page, customFont, formData.email, FORM_FIELDS.email);

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