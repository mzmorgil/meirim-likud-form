import React, { useState, useEffect } from 'react';
import { addFormDataToPdf, downloadPdf } from '@/utils/pdfUtils';
import NameForm from '@/components/NameForm';
import PDFPreview from '@/components/PDFPreview';
import ThankYou from '@/components/ThankYou';
import { toast } from 'sonner';

const PDF_URL = 'https://mzm-org-il-public.storage.googleapis.com/uc-register-to-likud-black-v2.pdf';

interface FormData {
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

const Index = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'form' | 'preview' | 'thankYou'>('form');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFormSubmit = async (data: FormData) => {
    setFormData(data);
    setIsProcessing(true);
    
    try {
      // Process the PDF to add all form data
      const modifiedPdfBlob = await addFormDataToPdf(PDF_URL, data);
      setPdfBlob(modifiedPdfBlob);
      const objectUrl = URL.createObjectURL(modifiedPdfBlob);
      setPdfUrl(objectUrl);
      setCurrentScreen('preview');
      toast.success('הטופס נוצר בהצלחה!');
    } catch (error) {
      console.error('Failed to process PDF:', error);
      toast.error('אירעה שגיאה ביצירת המסמך. אנא נסה שנית');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setCurrentScreen('form');
  };
  
  const handleUploadSuccess = () => {
    setCurrentScreen('thankYou');
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
            דורית יצחק
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight animate-fade-up">
            התפקדות לליכוד
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {currentScreen === 'thankYou' && formData 
              ? `תודה על ההתפקדות, ${formData.firstName}!`
              : currentScreen === 'preview' && formData
                ? `צפייה בקדימון של טופס ההתפקדות עבור ${formData.firstName} ${formData.lastName}` 
                : "מלא את הפרטים כדי ליצור טופס התפקדות לליכוד"}
          </p>
        </header>
        
        <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
          {currentScreen === 'form' && (
            <NameForm onSubmit={handleFormSubmit} isLoading={isProcessing} />
          )}
          
          {currentScreen === 'preview' && formData && pdfUrl && (
            <PDFPreview 
              pdfUrl={pdfUrl}
              pdfBlob={pdfBlob}
              formData={formData}
              onBack={handleBack}
              onUploadSuccess={handleUploadSuccess}
            />
          )}
          
          {currentScreen === 'thankYou' && formData && (
            <ThankYou name={formData.firstName} />
          )}
        </div>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            כל הזכויות שמורות &copy; דורית יצחק
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
