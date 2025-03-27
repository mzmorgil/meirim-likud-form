
import React, { useState, useEffect, useRef } from 'react';
import { addTextToPdf, downloadPdf } from '../utils/pdfUtils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileDown, RefreshCw } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modifiedPdfUrl, setModifiedPdfUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const processAndDisplayPdf = async () => {
      try {
        setIsLoading(true);
        setIsProcessing(true);
        
        // Process the PDF to add the text
        const modifiedPdfBlob = await addTextToPdf(pdfUrl);
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
  }, [pdfUrl]);

  const handleDownload = async () => {
    try {
      if (!modifiedPdfUrl) {
        toast.error('PDF not ready for download yet');
        return;
      }
      
      const response = await fetch(modifiedPdfUrl);
      const blob = await response.blob();
      
      // Extract the original filename from the URL
      const urlParts = pdfUrl.split('/');
      const originalFilename = urlParts[urlParts.length - 1];
      const downloadFilename = `modified-${originalFilename}`;
      
      downloadPdf(blob, downloadFilename);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full h-[calc(100vh-200px)] relative glass-card overflow-hidden mb-6">
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
            className="w-full h-full border-0 pdf-container"
            title="Modified PDF"
            onLoad={handleIframeLoad}
          />
        )}
      </div>
      
      <Button 
        onClick={handleDownload}
        disabled={!modifiedPdfUrl || isLoading}
        className="btn-hover-effect flex items-center gap-2 px-6 py-2 rounded-full"
      >
        <FileDown className="w-4 h-4" />
        Download Modified PDF
      </Button>
    </div>
  );
};

export default PDFViewer;
