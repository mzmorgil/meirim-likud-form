
/**
 * Generates an automatic signature based on first and last name
 * @param firstName First name
 * @param lastName Last name
 * @returns Data URL of the signature image
 */
export const generateAutoSignature = (firstName: string, lastName: string): string => {
  if (!firstName || !lastName) return '';
  
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'italic 32px "Segoe Script", "Brush Script MT", cursive';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const fullName = `${firstName} ${lastName}`;
    ctx.fillText(fullName, canvas.width / 2, canvas.height / 2);
    
    return canvas.toDataURL('image/png');
  }
  
  return '';
};
