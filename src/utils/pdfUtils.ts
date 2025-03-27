
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Adds the user's name in red italic text to a PDF document
 * @param pdfUrl URL of the PDF to modify
 * @param name User's name to add to the PDF
 * @returns Blob of the modified PDF
 */
export const addTextToPdf = async (pdfUrl: string, name: string): Promise<Blob> => {
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
    
    // Get font and set text properties
    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const textSize = 36;
    const text = name || 'Hello World';
    
    // Get page dimensions
    const { width, height } = firstPage.getSize();
    
    // Add text to the center of the first page
    firstPage.drawText(text, {
      x: width / 2 - font.widthOfTextAtSize(text, textSize) / 2,
      y: height / 2,
      size: textSize,
      font,
      color: rgb(1, 0, 0), // Red color
    });
    
    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    
    // Convert to Blob
    return new Blob([modifiedPdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error adding text to PDF:', error);
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
