
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { downloadPdf } from "@/utils/pdfUtils";

interface PDFPreviewProps {
  pdfUrl: string | null;
  formData: {
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
  };
  onBack: () => void;
}

const PDFPreview = ({ pdfUrl, formData, onBack }: PDFPreviewProps) => {
  const handleDownload = () => {
    if (!pdfUrl) return;
    
    // Use the downloadPdf utility
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `התפקדות-לליכוד-${formData.firstName}-${formData.lastName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("המסמך הורד בהצלחה");
  };

  const handleUpload = () => {
    toast.info("העלאה למערכת תהיה זמינה בקרוב");
  };

  return (
    <div className="glass p-4 rounded-2xl shadow-lg animate-fade-in max-w-3xl mx-auto" dir="rtl">
      <div className="space-y-1 mb-3">
        <div className="inline-block px-2 py-0.5 rounded-full bg-secondary text-xs font-medium tracking-wider mb-1 animate-slide-in">
          תצוגה מקדימה
        </div>
        <h1 className="text-lg font-medium">טופס ההתפקדות שלך מוכן</h1>
        <p className="text-sm text-muted-foreground">
          להלן טופס ההתפקדות לליכוד באמצעות מאירים - חינוך זה מסורת
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="font-medium mb-2">פרטים אישיים</h2>
          <ul className="space-y-1 text-sm">
            <li><span className="font-semibold">תעודת זהות:</span> {formData.idNumber}</li>
            <li><span className="font-semibold">שם מלא:</span> {formData.firstName} {formData.lastName}</li>
            <li><span className="font-semibold">שם האב:</span> {formData.fatherName}</li>
            <li><span className="font-semibold">תאריך לידה:</span> {new Date(formData.birthDate).toLocaleDateString('he-IL')}</li>
            <li><span className="font-semibold">מצב משפחתי:</span> {formData.maritalStatus}</li>
            <li><span className="font-semibold">ארץ לידה:</span> {formData.birthCountry}</li>
            {formData.immigrationYear && (
              <li><span className="font-semibold">שנת עלייה:</span> {formData.immigrationYear}</li>
            )}
          </ul>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="font-medium mb-2">פרטי התקשרות</h2>
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
      </div>

      <div className="border rounded-lg overflow-hidden my-4 bg-white w-full" style={{height: "280px"}}>
        {pdfUrl && (
          <iframe 
            src={`${pdfUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`} 
            className="w-full h-full" 
            title="PDF Preview"
          />
        )}
      </div>

      <Button 
        variant="default" 
        onClick={handleUpload}
        className="w-full mt-3 transition-all duration-300 ease-apple hover:bg-primary/90"
        size="lg"
      >
        <Upload className="ml-2 h-5 w-5" /> העלאה למערכת
      </Button>
      
      <div className="grid grid-cols-1 gap-2 mt-2">
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={onBack}
            className="transition-all duration-300 ease-apple hover:bg-secondary"
            size="sm"
          >
            <ArrowLeft className="ml-1 h-3 w-3" /> חזרה לטופס
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleDownload}
            className="transition-all duration-300 ease-apple"
            size="sm"
          >
            <Download className="ml-1 h-3 w-3" /> הורד PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
