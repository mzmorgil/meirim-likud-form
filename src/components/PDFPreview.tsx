
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { downloadPdf } from "@/utils/pdfUtils";
import { uploadFormFiles } from "@/utils/uploadUtils";
import { useState } from "react";

interface PDFPreviewProps {
  pdfUrl: string | null;
  pdfBlob: Blob | null;
  formData: {
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
    includeSpouse?: boolean;
    spouse?: {
      idNumber: string;
      firstName: string;
      lastName: string;
      fatherName: string;
      birthDate: Date;
      gender: string;
      birthCountry: string;
      immigrationYear?: string;
      signature: string;
    };
    payment?: {
      cardNumber: string;
      cardholderName: string;
      expiryDate: string;
      cvv: string;
    };
  };
  onBack: () => void;
  onUploadSuccess: () => void;
}

const PDFPreview = ({ pdfUrl, pdfBlob, formData, onBack, onUploadSuccess }: PDFPreviewProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleDownload = () => {
    if (!pdfBlob) return;
    
    // Use the downloadPdf utility with the blob
    downloadPdf(pdfBlob, `התפקדות-לליכוד-${formData.firstName}-${formData.lastName}.pdf`);
    toast.success("המסמך הורד בהצלחה");
  };

  const handleUpload = async () => {
    if (!pdfBlob) {
      toast.error("אירעה שגיאה בהכנת המסמך להעלאה");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Format dates for JSON
      const formattedData = {
        ...formData,
        birthDate: formData.birthDate.toISOString(),
        spouse: formData.spouse ? {
          ...formData.spouse,
          birthDate: formData.spouse.birthDate.toISOString()
        } : undefined,
        // Mask sensitive payment information for security
        payment: formData.payment ? {
          ...formData.payment,
          cardNumber: `${formData.payment.cardNumber.slice(-4).padStart(formData.payment.cardNumber.length, '*')}`,
          cvv: '***'
        } : undefined
      };
      
      await uploadFormFiles(pdfBlob, formattedData);
      toast.success("ההתפקדות נשלחה בהצלחה!");
      onUploadSuccess();
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast.error("אירעה שגיאה בעת שליחת הטופס. אנא נסה שנית");
    } finally {
      setIsUploading(false);
    }
  };

  // Map gender value to Hebrew label
  const getGenderLabel = (gender: string) => {
    return gender === 'ז' ? 'זכר' : gender === 'נ' ? 'נקבה' : gender;
  };

  // Map marital status code to full name
  const getMaritalStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'ר': 'רווק/ה',
      'נ': 'נשוי/אה',
      'ג': 'גרוש/ה',
      'א': 'אלמן/ה'
    };
    return statusMap[status] || status;
  };

  // Format credit card number to show only last 4 digits
  const formatCreditCard = (number: string) => {
    return `**** **** **** ${number.slice(-4)}`;
  };

  return (
    <div className="glass p-4 rounded-2xl shadow-lg animate-fade-in max-w-3xl mx-auto" dir="rtl">
      <div className="space-y-1 mb-3">
        <div className="inline-block px-2 py-0.5 rounded-full bg-secondary text-xs font-medium tracking-wider mb-1 animate-slide-in">
          תצוגה מקדימה
        </div>
        <h1 className="text-lg font-medium">טופס ההתפקדות שלך מוכן</h1>
        <p className="text-sm text-muted-foreground">
          להלן טופס ההתפקדות לליכוד באמצעות דורית יצחק
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="font-medium mb-2">פרטי מבקש ההתפקדות הראשי</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-1 text-sm">
              <li><span className="font-semibold">תעודת זהות:</span> {formData.idNumber}</li>
              <li><span className="font-semibold">שם מלא:</span> {formData.firstName} {formData.lastName}</li>
              <li><span className="font-semibold">שם האב:</span> {formData.fatherName}</li>
              <li><span className="font-semibold">תאריך לידה:</span> {formData.birthDate.toLocaleDateString('he-IL')}</li>
              <li><span className="font-semibold">מין:</span> {getGenderLabel(formData.gender)}</li>
              <li><span className="font-semibold">מצב משפחתי:</span> {getMaritalStatusLabel(formData.maritalStatus)}</li>
              <li><span className="font-semibold">ארץ לידה:</span> {formData.birthCountry}</li>
              {formData.immigrationYear && (
                <li><span className="font-semibold">שנת עלייה:</span> {formData.immigrationYear}</li>
              )}
            </ul>
            
            <ul className="space-y-1 text-sm">
              <li><span className="font-semibold">כתובת:</span> {formData.address}</li>
              <li><span className="font-semibold">יישוב:</span> {formData.city}</li>
              {formData.zipCode && (
                <li><span className="font-semibold">מיקוד:</span> {formData.zipCode}</li>
              )}
              <li><span className="font-semibold">טלפון נייד:</span> {formData.mobile}</li>
              <li><span className="font-semibold">דואר אלקטרוני:</span> {formData.email}</li>
            </ul>
          </div>
          
          <div className="mt-3">
            <h3 className="text-sm font-semibold mb-1">חתימה:</h3>
            <div className="flex justify-center">
              <img src={formData.signature} alt="חתימה" className="max-h-[60px]" />
            </div>
          </div>
        </div>
        
        {formData.spouse && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-medium mb-2">פרטי בן/בת הזוג</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-1 text-sm">
                <li><span className="font-semibold">תעודת זהות:</span> {formData.spouse.idNumber}</li>
                <li><span className="font-semibold">שם מלא:</span> {formData.spouse.firstName} {formData.spouse.lastName}</li>
                <li><span className="font-semibold">שם האב:</span> {formData.spouse.fatherName}</li>
                <li><span className="font-semibold">תאריך לידה:</span> {formData.spouse.birthDate.toLocaleDateString('he-IL')}</li>
                <li><span className="font-semibold">מין:</span> {getGenderLabel(formData.spouse.gender)}</li>
                <li><span className="font-semibold">ארץ לידה:</span> {formData.spouse.birthCountry}</li>
                {formData.spouse.immigrationYear && (
                  <li><span className="font-semibold">שנת עלייה:</span> {formData.spouse.immigrationYear}</li>
                )}
              </ul>
              
              <div className="flex flex-col items-start justify-end">
                <h3 className="text-sm font-semibold mb-1">חתימה:</h3>
                <div className="flex justify-center w-full">
                  <img src={formData.spouse.signature} alt="חתימת בן/בת הזוג" className="max-h-[60px]" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {formData.payment && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-medium mb-2">פרטי תשלום</h2>
            <ul className="space-y-1 text-sm">
              <li><span className="font-semibold">שם בעל הכרטיס:</span> {formData.payment.cardholderName}</li>
              <li><span className="font-semibold">מספר כרטיס:</span> {formatCreditCard(formData.payment.cardNumber)}</li>
              <li><span className="font-semibold">תוקף:</span> {formData.payment.expiryDate}</li>
              <li><span className="font-semibold">סכום לתשלום:</span> {formData.spouse ? '98 ₪' : '49 ₪'} ({formData.spouse ? 'עבור שני מתפקדים' : 'עבור מתפקד יחיד'})</li>
            </ul>
          </div>
        )}
      </div>

      {pdfUrl && (
        <div className="border rounded-lg overflow-hidden my-4 bg-white w-full" style={{height: "280px"}}>
          <iframe 
            src={`${pdfUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`} 
            className="w-full h-full" 
            title="PDF Preview"
          />
        </div>
      )}

      <Button 
        variant="default" 
        onClick={handleUpload}
        className="w-full mt-3 transition-all duration-300 ease-apple hover:bg-primary/90"
        size="lg"
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Upload className="ml-2 h-5 w-5 animate-spin" /> מעלה...
          </>
        ) : (
          <>
            <Upload className="ml-2 h-5 w-5" /> התפקדות
          </>
        )}
      </Button>
      
      <div className="grid grid-cols-1 gap-2 mt-2">
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={onBack}
            className="transition-all duration-300 ease-apple hover:bg-secondary"
            size="sm"
            disabled={isUploading}
          >
            <ArrowLeft className="ml-1 h-3 w-3" /> חזרה לטופס
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleDownload}
            className="transition-all duration-300 ease-apple"
            size="sm"
            disabled={isUploading}
          >
            <Download className="ml-1 h-3 w-3" /> הורד PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
