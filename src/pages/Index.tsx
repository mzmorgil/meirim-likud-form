import React, { useState, useEffect } from 'react';
import { addFormDataToPdf, downloadPdf } from '@/utils/pdfUtils';
import NameForm from '@/components/NameForm';
import SpouseForm from '@/components/SpouseForm';
import PaymentForm from '@/components/PaymentForm';
import PDFPreview from '@/components/PDFPreview';
import ThankYou from '@/components/ThankYou';
import { toast } from 'sonner';
import { PrimaryFormValues, PersonFormValues } from '@/components/PersonForm';
import { FormProvider, useFormContext } from '@/hooks/use-form-context';
import { PaymentFormValues } from '@/components/PaymentForm';

const PDF_URL = 'https://mzm-org-il-public.storage.googleapis.com/uc-register-to-likud-black-v2.pdf';

type FormData = PrimaryFormValues;
type SpouseData = PersonFormValues;

interface PaymentData {
  cardNumber: string;
  cardholderName: string;
  cardholderType?: string;
  expiryDate: string;
  cvv: string;
  paymentSignature?: string;
}

interface PDFFormData {
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
  payment?: PaymentData;
  includeSpouse?: boolean;
}

interface PreviewFormData extends Omit<PDFFormData, 'spouse'> {
  spouse?: PersonFormValues;
  payment?: PaymentData;
}

const Index = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [spouseData, setSpouseData] = useState<SpouseData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'form' | 'spouseForm' | 'paymentForm' | 'preview' | 'thankYou'>('form');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { setPrimaryUserData, setSpouseData: setFormContextSpouseData } = useFormContext();
  
  const handleFormSubmit = async (data: FormData) => {
    console.log("Primary form handler called with data:", data);
    setFormData(data);
    setPrimaryUserData(data);
    
    if (data.includeSpouse) {
      setCurrentScreen('spouseForm');
    } else {
      setCurrentScreen('paymentForm');
    }
  };

  const handleSpouseFormSubmit = (data: SpouseData) => {
    console.log("Spouse form submitted with data:", data);
    setSpouseData(data);
    setFormContextSpouseData(data);
    setCurrentScreen('paymentForm');
  };

  const handlePaymentSubmit = (data: PaymentFormValues) => {
    const paymentInfo: PaymentData = {
      cardholderName: data.cardholderName,
      cardholderType: data.cardholderType,
      cardNumber: data.cardNumber,
      expiryDate: data.expiryDate,
      cvv: data.cvv
    };
    
    processPayment(paymentInfo);
  };

  const processPayment = async (data: PaymentData) => {
    setPaymentData(data);
    setIsProcessing(true);
    
    try {
      if (!formData) {
        throw new Error('Missing form data');
      }
      
      let paymentSignature = formData.signature;
      
      if (formData.includeSpouse && spouseData && data.cardholderType === 'spouse') {
        paymentSignature = spouseData.signature;
      }
      
      const pdfData = {
        ...formData,
        spouse: spouseData || undefined,
        payment: {
          ...data,
          paymentSignature: paymentSignature
        }
      } as PDFFormData;
      
      const modifiedPdfBlob = await addFormDataToPdf(PDF_URL, pdfData);
      setPdfBlob(modifiedPdfBlob);
      const objectUrl = URL.createObjectURL(modifiedPdfBlob);
      setPdfUrl(objectUrl);
      setCurrentScreen('preview');
      toast.success('הטופס נוצר בה��לחה!');
    } catch (error) {
      console.error('Failed to process PDF:', error);
      toast.error('א��רעה שגיאה ביצירת המסמך. אנא נסה שנית');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    console.log("Handling back navigation from screen:", currentScreen);
    if (currentScreen === 'spouseForm') {
      setCurrentScreen('form');
    } else if (currentScreen === 'paymentForm') {
      setCurrentScreen(formData?.includeSpouse ? 'spouseForm' : 'form');
    } else if (currentScreen === 'preview') {
      setCurrentScreen('paymentForm');
    }
  };
  
  const handleUploadSuccess = () => {
    setCurrentScreen('thankYou');
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const getPreviewData = (): PreviewFormData | null => {
    if (!formData) return null;
    
    return {
      idNumber: formData.idNumber,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fatherName: formData.fatherName,
      birthDate: formData.birthDate,
      gender: formData.gender,
      maritalStatus: formData.maritalStatus,
      birthCountry: formData.birthCountry,
      immigrationYear: formData.immigrationYear,
      address: formData.address,
      city: formData.city,
      zipCode: formData.zipCode,
      mobile: formData.mobile,
      email: formData.email,
      signature: formData.signature,
      includeSpouse: formData.includeSpouse,
      spouse: spouseData || undefined,
      payment: paymentData || undefined
    };
  };

  console.log("Current screen:", currentScreen);

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
                : currentScreen === 'spouseForm' && formData
                  ? `הזנת פרטי בן/בת הזוג של ${formData.firstName} ${formData.lastName}`
                  : currentScreen === 'paymentForm'
                    ? "הזנת פרטי תשלום"
                    : "מלא את הפרטים כדי ליצור טופס התפקדות לליכוד"}
          </p>
        </header>
        
        <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
          {currentScreen === 'form' && (
            <NameForm onSubmit={handleFormSubmit} isLoading={isProcessing} />
          )}
          
          {currentScreen === 'spouseForm' && formData && (
            <SpouseForm 
              onSubmit={handleSpouseFormSubmit} 
              onBack={handleBack}
              isLoading={isProcessing}
            />
          )}
          
          {currentScreen === 'paymentForm' && (
            <PaymentForm 
              onSubmit={handlePaymentSubmit} 
              onBack={handleBack}
              isLoading={isProcessing}
              includeSpouse={formData?.includeSpouse}
            />
          )}
          
          {currentScreen === 'preview' && formData && pdfUrl && pdfBlob && (
            <PDFPreview 
              pdfUrl={pdfUrl}
              pdfBlob={pdfBlob}
              formData={getPreviewData() as PreviewFormData}
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

const IndexWithFormProvider = () => (
  <FormProvider>
    <Index />
  </FormProvider>
);

export default IndexWithFormProvider;
