
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
    <div className="glass p-8 rounded-2xl shadow-lg animate-fade-in" dir="rtl">
      <div className="space-y-2 mb-6">
        <div className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-medium tracking-wider mb-2 animate-slide-in">
          תצוגה מקדימה
        </div>
        <h1 className="text-2xl font-medium">תצוגה מקדימה של המסמך</h1>
        <p className="text-muted-foreground text-sm">
          המסמך שלך מוכן להורדה או העלאה
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden my-4 aspect-[1/1.4] bg-white">
        {pdfUrl && (
          <iframe 
            src={pdfUrl} 
            className="w-full h-full" 
            title="PDF Preview"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <Button 
          variant="outline"
          onClick={onBack}
          className="transition-all duration-300 ease-apple hover:bg-secondary"
        >
          <ArrowLeft className="ml-2 h-4 w-4" /> חזרה
        </Button>
        
        <Button 
          onClick={handleDownload}
          className="transition-all duration-300 ease-apple hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="ml-2 h-4 w-4" /> הורדה
        </Button>
      </div>
      
      <Button 
        variant="outline" 
        onClick={handleUpload}
        className="w-full mt-4 border-dashed transition-all duration-300 ease-apple hover:bg-secondary/50"
      >
        <Upload className="ml-2 h-4 w-4" /> העלאה לענן (בקרוב)
      </Button>
    </div>
  );
};

export default PDFPreview;
