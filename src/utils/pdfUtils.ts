
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
    
    // Get page dimensions
    const { width, height } = firstPage.getSize();
    
    // Create a custom font for Hebrew - using a font embedding technique
    // For Hebrew support, we need to embed the text as an image, since we can't use
    // StandardFonts with Hebrew characters
    
    // Create a canvas element to render the text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }
    
    // Set canvas size and font properties
    canvas.width = width * 0.8; // 80% of page width
    canvas.height = 100;
    const fontSize = 36;
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = 'rgb(255, 0, 0)'; // Red color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text on canvas
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    
    // Convert canvas to image data URL
    const imgData = canvas.toDataURL('image/png');
    
    // Remove the data URL prefix to get just the base64 content
    const base64Data = imgData.replace(/^data:image\/(png|jpg);base64,/, '');
    
    // Embed the image into the PDF
    const textImage = await pdfDoc.embedPng(base64Data);
    
    // Calculate position to center the image
    const imgDims = textImage.scale(1); // Get scaled dimensions
    const xPos = (width - imgDims.width) / 2;
    const yPos = height / 2;
    
    // Draw the image on the page
    firstPage.drawImage(textImage, {
      x: xPos,
      y: yPos,
      width: imgDims.width,
      height: imgDims.height,
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
