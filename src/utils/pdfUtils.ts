
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Adds red italic "Hello World" text to a PDF document
 * @param pdfUrl URL of the PDF to modify
 * @returns Blob of the modified PDF
 */
export const addTextToPdf = async (pdfUrl: string): Promise<Blob> => {
  try {
    // Use a pre-defined sample PDF if the external PDF cannot be fetched due to CORS
    let pdfBytes: ArrayBuffer;
    
    try {
      // Try to fetch the PDF with regular mode first
      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        throw new Error('Failed to fetch PDF');
      }
      pdfBytes = await pdfResponse.arrayBuffer();
    } catch (error) {
      console.log('Failed to fetch PDF with standard mode, trying no-cors or using sample PDF');
      
      try {
        // Try with no-cors mode as a fallback
        const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(pdfUrl)}`;
        const proxyResponse = await fetch(corsProxyUrl);
        
        if (!proxyResponse.ok) {
          throw new Error('Failed to fetch PDF via proxy');
        }
        
        pdfBytes = await proxyResponse.arrayBuffer();
      } catch (proxyError) {
        // If both approaches fail, create a blank PDF as fallback
        console.log('Using blank PDF as fallback');
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        page.drawText('Unable to load original PDF due to CORS restrictions.', {
          x: 50,
          y: 700,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        });
        
        return new Blob([await pdfDoc.save()], { type: 'application/pdf' });
      }
    }
    
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
    const text = 'Hello World';
    
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
