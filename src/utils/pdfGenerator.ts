
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface UserDetails {
  firstName: string;
  lastName: string;
  idNumber: string;
}

/**
 * Generates a PDF document with the provided user details
 * @param userDetails User's personal information
 * @returns Blob of the generated PDF
 */
export const generatePdfWithDetails = async (userDetails: UserDetails): Promise<Blob> => {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a new page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    // Get the standard font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Get page dimensions
    const { width, height } = page.getSize();
    
    // Add a header
    page.drawText('Personal Details Form', {
      x: 50,
      y: height - 50,
      size: 24,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    // Add a horizontal line below the header
    page.drawLine({
      start: { x: 50, y: height - 60 },
      end: { x: width - 50, y: height - 60 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    // Add date
    const date = new Date().toLocaleDateString();
    page.drawText(`Date: ${date}`, {
      x: width - 150,
      y: height - 80,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // Add user details
    const startY = height - 120;
    const lineHeight = 25;
    
    // First Name
    page.drawText('First Name:', {
      x: 50,
      y: startY,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(userDetails.firstName, {
      x: 150,
      y: startY,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // Last Name
    page.drawText('Last Name:', {
      x: 50,
      y: startY - lineHeight,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(userDetails.lastName, {
      x: 150,
      y: startY - lineHeight,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // ID Number
    page.drawText('ID Number:', {
      x: 50,
      y: startY - lineHeight * 2,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(userDetails.idNumber, {
      x: 150,
      y: startY - lineHeight * 2,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    
    // Add a note about the future upload capability
    page.drawText('This document will be automatically uploaded to secure storage.', {
      x: 50,
      y: 100,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Add a footer
    page.drawText('Generated using Personal Details PDF Generator', {
      x: width / 2 - 120,
      y: 50,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Convert to Blob
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Future function to upload PDF to Google Cloud Storage
 * This will be implemented when the GCS key is provided
 */
export const uploadPdfToGCS = async (pdfBlob: Blob, filename: string): Promise<string> => {
  // This function will be implemented when the GCS key is provided
  console.log('GCS upload functionality will be implemented later');
  
  // For now, return a placeholder URL
  return `https://storage.googleapis.com/future-bucket/${filename}`;
};
