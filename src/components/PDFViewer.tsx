
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileDown, RefreshCw } from 'lucide-react';

interface PDFViewerProps {
  pdfBlob: Blob;
  fileName: string;
  onDownload?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfBlob, fileName, onDownload }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    // Create an object URL for the PDF blob
    const objectUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(objectUrl);
    
    // Clean up the object URL when component unmounts
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pdfBlob]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      if (pdfUrl) {
        link.href = pdfUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('PDF downloaded successfully');
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full h-[calc(100vh-300px)] relative glass-card overflow-hidden mb-6">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground animate-pulse-subtle">
                Loading PDF...
              </p>
            </div>
          </div>
        )}
        
        {pdfUrl && (
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-full border-0 pdf-container"
            title="PDF Document"
            onLoad={handleIframeLoad}
          />
        )}
      </div>
      
      <Button 
        onClick={handleDownload}
        disabled={!pdfUrl || isLoading}
        className="btn-hover-effect flex items-center gap-2 px-6 py-2 rounded-full"
      >
        <FileDown className="w-4 h-4" />
        Download PDF
      </Button>
    </div>
  );
};

export default PDFViewer;
