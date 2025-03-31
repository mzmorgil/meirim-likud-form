import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { PersonFormValues } from '@/components/PersonForm';

// Debug mode can be enabled via environment variable or directly in code
const DEBUG_PDF_GRID = import.meta.env.VITE_DEBUG_PDF_GRID === 'true' || false;

// Define form field positions and their properties
type FormPosition = {
  x: number;
  y: number;
  fontSize?: number;
  maxWidth?: number;
  rtl?: boolean; // Add rtl flag for directional text
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
  // Spouse field positions
  spouseIdNumber?: FormPosition;
  spouseFirstName?: FormPosition;
  spouseLastName?: FormPosition;
  spouseFatherName?: FormPosition;
  spouseBirthDate?: FormPosition;
  spouseGender?: FormPosition;
  spouseBirthCountry?: FormPosition;
  spouseImmigrationYear?: FormPosition;
  spouseAddress?: FormPosition;
  spouseCity?: FormPosition;
  spouseZipCode?: FormPosition;
  spouseMobile?: FormPosition;
  spouseEmailUsername?: FormPosition;
  spouseEmailDomain?: FormPosition;
  spouseSignature?: FormPosition;
  paymentCardholderName?: FormPosition;
  paymentCardNumber?: FormPosition;
  paymentExpiryDate?: FormPosition;
  paymentCVV?: FormPosition;
  paymentSignature?: FormPosition;
};

// Form field positions for an A4-sized PDF (595 x 842 points)
const FORM_FIELDS: FormFields = {
  idNumber: { x: 495, y: 685, fontSize: 10 },
  firstName: { x: 175, y: 685, fontSize: 10 },
  lastName: { x: 325, y: 685, fontSize: 10 },
  fatherName: { x: 480, y: 658, fontSize: 10 },
  birthDate: { x: 410, y: 670, fontSize: 10 },
  gender: { x: 255, y: 670, fontSize: 10 },
  maritalStatus: { x: 295, y: 670, fontSize: 10 },
  birthCountry: { x: 190, y: 658, fontSize: 10 },
  immigrationYear: { x: 100, y: 658, fontSize: 10 },
  address: { x: 480, y: 632, fontSize: 10 },
  city: { x: 270, y: 632, fontSize: 10 },
  zipCode: { x: 130, y: 632, fontSize: 10 },
  mobile: { x: 470, y: 605, fontSize: 10 },
  emailUsername: { x: 280, y: 579, fontSize: 10 },
  emailDomain: { x: 430, y: 579, fontSize: 10 },
  signature: { x: 80, y: 574, maxWidth: 150 },
  // Spouse field positions - positioned below the primary applicant
  spouseIdNumber: { x: 495, y: 522, fontSize: 10 },
  spouseFirstName: { x: 175, y: 522, fontSize: 10 },
  spouseLastName: { x: 325, y: 522, fontSize: 10 },
  spouseFatherName: { x: 480, y: 495, fontSize: 10 },
  spouseBirthDate: { x: 410, y: 507, fontSize: 10 },
  spouseGender: { x: 255, y: 507, fontSize: 10 },
  spouseBirthCountry: { x: 190, y: 495, fontSize: 10 },
  spouseImmigrationYear: { x: 100, y: 495, fontSize: 10 },
  spouseAddress: { x: 480, y: 469, fontSize: 10 },
  spouseCity: { x: 270, y: 469, fontSize: 10 },
  spouseZipCode: { x: 130, y: 469, fontSize: 10 },
  spouseMobile: { x: 470, y: 469, fontSize: 10 },
  spouseEmailUsername: { x: 280, y: 442, fontSize: 10 },
  spouseEmailDomain: { x: 430, y: 442, fontSize: 10 },
  spouseSignature: { x: 80, y: 435, maxWidth: 150 },
  paymentCardholderName: { x: 300, y: 150, fontSize: 10 },
  paymentCardNumber: { x: 300, y: 130, fontSize: 10 },
  paymentExpiryDate: { x: 300, y: 110, fontSize: 10 },
  paymentCVV: { x: 300, y: 90, fontSize: 10 },
  paymentSignature: { x: 300, y: 70, maxWidth: 150 },
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
  const isRTL = position.rtl !== false; // Default to RTL (true) unless explicitly set to false
  const textWidth = font.widthOfTextAtSize(text, fontSize);

  // Adjust x-position based on text direction
  const x = isRTL ? position.x - textWidth : position.x;

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

  // Scale the signature down to half size
  const width = (position.maxWidth || 150) * 0.5;
  const height = (width / embeddedImage.width) * embeddedImage.height;

  page.drawImage(embeddedImage, {
    x: position.x,
    y: position.y,
    width,
    height,
    opacity: 0.8, // Add slight transparency
  });
};

/**
 * Formats a birth date to use 2-digit year format
 * @param date The date to format
 * @returns Formatted date string with 2-digit year
 */
const formatBirthDateWith2DigitYear = (date: Date): string => {
  // Get day, month as they are
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // Get only the last 2 digits of the year
  const year = date.getFullYear().toString().slice(-2);
  
  // Return in format DD/MM/YY
  return `${day}/${month}/${year}`;
};

/**
 * Formats a credit card number into groups of 4 digits
 * @param cardNumber The card number to format
 * @returns Formatted card number with spaces between groups of 4 digits
 */
const formatCreditCardNumber = (cardNumber: string): string => {
  // Remove any non-digit characters
  const digitsOnly = cardNumber.replace(/\D/g, '');
  
  // Split into groups of 4 and join with spaces
  const groups = [];
  for (let i = 0; i < digitsOnly.length; i += 4) {
    groups.push(digitsOnly.slice(i, i + 4));
  }
  
  return groups.join(' ');
};

/**
 * Converts marital status from full text to single character code
 * @param status The full marital status text
 * @returns Single character code (ר/נ/ג/א)
 */
const getMaritalStatusCode = (status: string): string => {
  const statusMap: Record<string, string> = {
    'רווק/ה': 'ר',
    'נשוי/אה': 'נ', 
    'גרוש/ה': 'ג',
    'אלמן/ה': 'א',
    'ר': 'ר',
    'נ': 'נ',
    'ג': 'ג',
    'א': 'א'
  };
  
  return statusMap[status] || status;
};

/**
 * Adds form data to a PDF document using an embedded font for vector text
 * @param pdfUrl URL of the base PDF to modify
 * @param formData User's form data to add
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
    spouse?: Partial<PersonFormValues>;
    payment?: {
      cardNumber: string;
      cardholderName: string;
      expiryDate: string;
      cvv: string;
      paymentSignature?: string;
    };
  },
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

    // Format birthdate with 2-digit year
    const formattedBirthDate = formData.birthDate instanceof Date
      ? formatBirthDateWith2DigitYear(formData.birthDate)
      : String(formData.birthDate);

    // Convert marital status to single character code
    const maritalStatusCode = getMaritalStatusCode(formData.maritalStatus);

    // Split email into username and domain parts for better placement on PDF
    const emailParts = formData.email.split('@');
    const emailUsername = emailParts[0];
    const emailDomain = emailParts.length > 1 ? emailParts[1] : ''; // Remove @ symbol

    // Add all text fields with the embedded font
    await addTextToPdf(page, customFont, formData.idNumber, FORM_FIELDS.idNumber);
    await addTextToPdf(page, customFont, formData.firstName, FORM_FIELDS.firstName);
    await addTextToPdf(page, customFont, formData.lastName, FORM_FIELDS.lastName);
    await addTextToPdf(page, customFont, formData.fatherName, FORM_FIELDS.fatherName);
    await addTextToPdf(page, customFont, formattedBirthDate, FORM_FIELDS.birthDate);
    await addTextToPdf(page, customFont, formData.gender, FORM_FIELDS.gender);
    await addTextToPdf(page, customFont, maritalStatusCode, FORM_FIELDS.maritalStatus);
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

    // Add spouse information if available
    if (formData.spouse) {
      const spouse = formData.spouse;
      
      // Format spouse birthdate with 2-digit year
      const formattedSpouseBirthDate = spouse.birthDate instanceof Date
        ? formatBirthDateWith2DigitYear(spouse.birthDate)
        : String(spouse.birthDate);

      // Split spouse email
      const spouseEmailParts = spouse.email?.split('@') || [];
      const spouseEmailUsername = spouseEmailParts[0] || '';
      const spouseEmailDomain = spouseEmailParts.length > 1 ? spouseEmailParts[1] : ''; // Remove @ symbol

      // Add spouse data to PDF
      await addTextToPdf(page, customFont, spouse.idNumber || '', FORM_FIELDS.spouseIdNumber);
      await addTextToPdf(page, customFont, spouse.firstName || '', FORM_FIELDS.spouseFirstName);
      await addTextToPdf(page, customFont, spouse.lastName || '', FORM_FIELDS.spouseLastName);
      await addTextToPdf(page, customFont, spouse.fatherName || '', FORM_FIELDS.spouseFatherName);
      await addTextToPdf(page, customFont, formattedSpouseBirthDate, FORM_FIELDS.spouseBirthDate);
      await addTextToPdf(page, customFont, spouse.gender || '', FORM_FIELDS.spouseGender);
      await addTextToPdf(page, customFont, spouse.birthCountry || '', FORM_FIELDS.spouseBirthCountry);
      
      if (spouse.immigrationYear) {
        await addTextToPdf(page, customFont, spouse.immigrationYear, FORM_FIELDS.spouseImmigrationYear);
      }
      
      await addTextToPdf(page, customFont, spouse.address || '', FORM_FIELDS.spouseAddress);
      await addTextToPdf(page, customFont, spouse.city || '', FORM_FIELDS.spouseCity);
      
      if (spouse.zipCode) {
        await addTextToPdf(page, customFont, spouse.zipCode, FORM_FIELDS.spouseZipCode);
      }
      
      await addTextToPdf(page, customFont, spouse.mobile || '', FORM_FIELDS.spouseMobile);
      await addTextToPdf(page, customFont, spouseEmailUsername, FORM_FIELDS.spouseEmailUsername);
      await addTextToPdf(page, customFont, spouseEmailDomain, FORM_FIELDS.spouseEmailDomain);

      // Add spouse signature
      if (spouse.signature) {
        await addSignatureToPdf(pdfDoc, page, spouse.signature, FORM_FIELDS.spouseSignature);
      }
    }

    // Add payment information if available
    if (formData.payment) {
      // Format the credit card number into groups of 4 digits
      const formattedCardNumber = formatCreditCardNumber(formData.payment.cardNumber);
      
      // Add payment field values to the PDF
      await addTextToPdf(page, customFont, formData.payment.cardholderName, FORM_FIELDS.paymentCardholderName);
      await addTextToPdf(page, customFont, formattedCardNumber, FORM_FIELDS.paymentCardNumber);
      await addTextToPdf(page, customFont, formData.payment.expiryDate, FORM_FIELDS.paymentExpiryDate);
      await addTextToPdf(page, customFont, formData.payment.cvv, FORM_FIELDS.paymentCVV);
      
      // Add the appropriate signature to the payment section
      if (formData.payment.paymentSignature) {
        await addSignatureToPdf(pdfDoc, page, formData.payment.paymentSignature, FORM_FIELDS.paymentSignature);
      }
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
