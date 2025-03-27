
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileDown, RefreshCw } from 'lucide-react';
import { downloadPdf } from '../utils/pdfUtils';

interface PDFViewerProps {
  pdfBlob?: Blob | null;
  pdfUrl?: string;
  previewOnly?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfBlob, pdfUrl, previewOnly = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    let url: string | null = null;
    
    const setupPdf = async () => {
      try {
        setIsLoading(true);
        
        if (pdfBlob) {
          // If we have a blob directly, create URL from it
          url = URL.createObjectURL(pdfBlob);
        } else if (pdfUrl) {
          // Original behavior for URL
          const response = await fetch(pdfUrl);
          const blob = await response.blob();
          url = URL.createObjectURL(blob);
        } else {
          throw new Error('Either pdfBlob or pdfUrl must be provided');
        }
        
        setObjectUrl(url);
      } catch (error) {
        console.error('Failed to load PDF:', error);
        toast.error('Failed to load PDF. Please try again.');
      }
    };
    
    setupPdf();
    
    // Clean up the object URL when component unmounts
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [pdfBlob, pdfUrl]);

  const handleDownload = async () => {
    try {
      if (!objectUrl) {
        toast.error('PDF not ready for download yet');
        return;
      }
      
      const response = await fetch(objectUrl);
      const blob = await response.blob();
      
      // Extract the original filename if we have a URL, otherwise use a default
      let downloadFilename = 'generated-document.pdf';
      if (pdfUrl) {
        const urlParts = pdfUrl.split('/');
        const originalFilename = urlParts[urlParts.length - 1];
        downloadFilename = `modified-${originalFilename}`;
      }
      
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
        
        {objectUrl && (
          <iframe
            ref={iframeRef}
            src={objectUrl}
            className="w-full h-full border-0 pdf-container"
            title="PDF Document"
            onLoad={handleIframeLoad}
            style={{ pointerEvents: previewOnly ? 'none' : 'auto' }}
          />
        )}
      </div>
      
      {!previewOnly && (
        <Button 
          onClick={handleDownload}
          disabled={!objectUrl || isLoading}
          className="btn-hover-effect flex items-center gap-2 px-6 py-2 rounded-full"
        >
          <FileDown className="w-4 h-4" />
          Download PDF
        </Button>
      )}
    </div>
  );
};

export default PDFViewer;
