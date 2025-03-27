
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { toast } from "sonner";

interface PDFPreviewProps {
  pdfUrl: string | null;
  formData: {
    firstName: string;
    lastName: string;
    id: string;
  };
  onBack: () => void;
}

const PDFPreview = ({ pdfUrl, formData, onBack }: PDFPreviewProps) => {
  const handleDownload = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${formData.firstName}-${formData.lastName}-document.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("המסמך הורד בהצלחה");
  };

  const handleUpload = () => {
    toast.info("העלאה ל-GCS תהיה זמינה בקרוב");
    // This will be implemented when you provide the GCS key
  };

  return (
    <div className="glass p-4 rounded-2xl shadow-lg animate-fade-in max-w-md mx-auto" dir="rtl">
      <div className="space-y-1 mb-3">
        <div className="inline-block px-2 py-0.5 rounded-full bg-secondary text-xs font-medium tracking-wider mb-1 animate-slide-in">
          תצוגה מקדימה
        </div>
        <h1 className="text-lg font-medium">המסמך שלך מוכן</h1>
      </div>

      <div className="border rounded-lg overflow-hidden my-2 bg-white max-h-[280px] w-full">
        {pdfUrl && (
          <iframe 
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH,top`} 
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
        <Upload className="ml-2 h-5 w-5" /> העלאה לענן
      </Button>
      
      <div className="grid grid-cols-1 gap-2 mt-2">
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={onBack}
            className="transition-all duration-300 ease-apple hover:bg-secondary"
            size="sm"
          >
            <ArrowLeft className="ml-1 h-3 w-3" /> חזרה
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleDownload}
            className="transition-all duration-300 ease-apple"
            size="sm"
          >
            <Download className="ml-1 h-3 w-3" /> הורדה
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
