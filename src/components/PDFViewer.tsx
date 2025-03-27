
import React, { useState, useEffect, useRef } from 'react';
import { addTextToPdf, downloadPdf } from '../utils/pdfUtils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RefreshCw, Download } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  userName: string;
  onBack: () => void;
  previewMode?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  pdfUrl, 
  userName, 
  onBack, 
  previewMode = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modifiedPdfUrl, setModifiedPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const processAndDisplayPdf = async () => {
      try {
        setIsLoading(true);
        setIsProcessing(true);
        
        // Process the PDF to add the text
        const modifiedPdfBlob = await addTextToPdf(pdfUrl, userName);
        setPdfBlob(modifiedPdfBlob);
        const objectUrl = URL.createObjectURL(modifiedPdfBlob);
        setModifiedPdfUrl(objectUrl);
        
        // Clean up the object URL when component unmounts
        return () => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
      } catch (error) {
        console.error('Failed to process PDF:', error);
        toast.error('Failed to process PDF. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };
    
    processAndDisplayPdf();
  }, [pdfUrl, userName]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (pdfBlob) {
      downloadPdf(pdfBlob, `${userName}-document.pdf`);
      toast.success('PDF downloaded successfully');
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full h-[calc(100vh-200px)] relative bg-background/50 rounded-lg overflow-hidden mb-6">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground animate-pulse-subtle">
                {isProcessing ? 'Processing PDF...' : 'Loading PDF...'}
              </p>
            </div>
          </div>
        )}
        
        {modifiedPdfUrl && (
          <iframe
            ref={iframeRef}
            src={modifiedPdfUrl}
            className="w-full h-full border-0"
            title="Modified PDF"
            onLoad={handleIframeLoad}
          />
        )}
      </div>
      
      <Button 
        onClick={handleDownload}
        className="flex items-center gap-2 px-6 py-2 rounded-full"
        variant="default"
      >
        <Download className="w-4 h-4" />
        Download PDF
      </Button>
    </div>
  );
};

export default PDFViewer;
