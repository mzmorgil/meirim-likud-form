
import React, { useState, useEffect } from 'react';
import { addTextToPdf } from '@/utils/pdfUtils';
import NameForm from '@/components/NameForm';
import PDFPreview from '@/components/PDFPreview';

const PDF_URL = 'https://mzm-org-il-public.storage.googleapis.com/uc-register-to-likud-black.pdf';

const Index = () => {
  const [userName, setUserName] = useState<string>('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFormSubmit = async (name: string) => {
    setUserName(name);
    setIsProcessing(true);
    
    try {
      // Process the PDF to add the text
      const modifiedPdfBlob = await addTextToPdf(PDF_URL, name);
      const objectUrl = URL.createObjectURL(modifiedPdfBlob);
      setPdfUrl(objectUrl);
      setShowPdfPreview(true);
    } catch (error) {
      console.error('Failed to process PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 px-4 md:px-6 py-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-block px-3 py-1 mb-3 text-xs font-medium tracking-wider text-primary bg-primary/5 rounded-full animate-fade-in">
            עורך PDF
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight animate-fade-up">
            מעבד טקסט ל-PDF
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {showPdfPreview 
              ? `צפייה בקדימון של ה-PDF עם "${userName}" מוסף אליו` 
              : "הזן את שמך כדי להוסיף אותו למסמך ה-PDF"}
          </p>
        </header>
        
        <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
          {showPdfPreview ? (
            <PDFPreview 
              pdfUrl={pdfUrl}
              formData={{
                firstName: userName,
                lastName: "",
                id: ""
              }}
              onBack={() => setShowPdfPreview(false)}
            />
          ) : (
            <NameForm onSubmit={handleFormSubmit} isLoading={isProcessing} />
          )}
        </div>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            כלי זה מדגים עריכת PDF באמצעות pdf-lib.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
