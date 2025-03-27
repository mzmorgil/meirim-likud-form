
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const addTextToPdf = async (pdfUrl: string): Promise<Blob> => {
  const response = await fetch(pdfUrl);
  const pdfBytes = await response.arrayBuffer();
  
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  
  // Add "Hello World" in red, italic
  firstPage.drawText('Hello World', {
    x: 50,
    y: 500,
    size: 50,
    font: helveticaFont,
    color: rgb(1, 0, 0),
  });
  
  const modifiedPdfBytes = await pdfDoc.save();
  return new Blob([modifiedPdfBytes], { type: 'application/pdf' });
};

export const generatePdfWithText = async (text: string): Promise<Blob> => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page to the document
  const page = pdfDoc.addPage([600, 800]);
  
  // Embed the standard Helvetica font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Set some properties for the text
  const fontSize = 12;
  const lineHeight = fontSize * 1.2;
  const margin = 50;
  const maxWidth = page.getWidth() - (margin * 2);
  
  // Add a title to the PDF
  page.drawText('Generated Document', {
    x: margin,
    y: page.getHeight() - margin,
    size: 20,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Simple word wrapping for the text
  const words = text.split(' ');
  let line = '';
  let y = page.getHeight() - margin - 40; // Start below the title
  
  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    const lineWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (lineWidth > maxWidth && line !== '') {
      // Draw the current line and start a new one
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      y -= lineHeight;
      line = word;
      
      // If we've reached the bottom of the page, add a new page
      if (y < margin) {
        const newPage = pdfDoc.addPage([600, 800]);
        y = newPage.getHeight() - margin;
      }
    } else {
      line = testLine;
    }
  }
  
  // Draw any remaining text
  if (line) {
    page.drawText(line, {
      x: margin,
      y,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
  }
  
  // Save the PDF and convert it to a Blob
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const downloadPdf = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};
