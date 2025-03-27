
import React, { useState, useEffect } from 'react';
import { addTextToPdf, downloadPdf } from '@/utils/pdfUtils';
import NameForm from '@/components/NameForm';
import PDFPreview from '@/components/PDFPreview';
import { toast } from 'sonner';

const PDF_URL = 'https://mzm-org-il-public.storage.googleapis.com/uc-register-to-likud-black.pdf';

interface FormData {
  idNumber: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  birthDate: string;
  maritalStatus: string;
  birthCountry: string;
  immigrationYear?: string;
  address: string;
  city: string;
  zipCode?: string;
  mobile: string;
  email: string;
}

const Index = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFormSubmit = async (data: FormData) => {
    setFormData(data);
    setIsProcessing(true);
    
    try {
      // Process the PDF to add the text
      // Currently, we'll just add the name to the PDF, but this can be enhanced later
      const fullName = `${data.firstName} ${data.lastName}`;
      const modifiedPdfBlob = await addTextToPdf(PDF_URL, fullName);
      const objectUrl = URL.createObjectURL(modifiedPdfBlob);
      setPdfUrl(objectUrl);
      setShowPdfPreview(true);
      toast.success('הטופס נוצר בהצלחה!');
    } catch (error) {
      console.error('Failed to process PDF:', error);
      toast.error('אירעה שגיאה ביצירת המסמך. אנא נסה שנית');
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
            מאירים - חינוך זה מסורת
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight animate-fade-up">
            התפקדות לליכוד
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {showPdfPreview 
              ? `צפייה בקדימון של טופס ההתפקדות עבור ${formData?.firstName} ${formData?.lastName}` 
              : "מלא את הפרטים כדי ליצור טופס התפקדות לליכוד"}
          </p>
        </header>
        
        <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
          {showPdfPreview && formData ? (
            <PDFPreview 
              pdfUrl={pdfUrl}
              formData={formData}
              onBack={() => setShowPdfPreview(false)}
            />
          ) : (
            <NameForm onSubmit={handleFormSubmit} isLoading={isProcessing} />
          )}
        </div>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            כל הזכויות שמורות © מאירים - חינוך זה מסורת
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
