
import React, { useState } from 'react';
import PDFViewer from '@/components/PDFViewer';
import NameForm from '@/components/NameForm';

const PDF_URL = 'https://mzm-org-il-public.storage.googleapis.com/uc-register-to-likud-black.pdf';

const Index = () => {
  const [userName, setUserName] = useState<string>('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const handleFormSubmit = (name: string) => {
    setUserName(name);
    setShowPdfPreview(true);
  };

  const handleBackToForm = () => {
    setShowPdfPreview(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 px-4 md:px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-block px-3 py-1 mb-3 text-xs font-medium tracking-wider text-primary bg-primary/5 rounded-full animate-fade-in">
            PDF EDITOR
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight animate-fade-up">
            PDF Text Modifier
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {showPdfPreview 
              ? `Previewing PDF with "${userName}" added to it` 
              : "Enter your name to add it to the PDF document"}
          </p>
        </header>
        
        <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
          {showPdfPreview ? (
            <PDFViewer 
              pdfUrl={PDF_URL} 
              userName={userName} 
              onBack={handleBackToForm} 
              previewMode={true} 
            />
          ) : (
            <NameForm onSubmit={handleFormSubmit} />
          )}
        </div>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            This tool demonstrates PDF modification using pdf-lib.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
