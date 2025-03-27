
import React, { useState } from 'react';
import PDFViewer from '@/components/PDFViewer';
import PDFForm from '@/components/PDFForm';

const Index = () => {
  const [userText, setUserText] = useState<string>('');
  const [pdfGenerated, setPdfGenerated] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const handleFormSubmit = (text: string, generatedPdfBlob: Blob) => {
    setUserText(text);
    setPdfBlob(generatedPdfBlob);
    setPdfGenerated(true);
  };

  const handleBackToForm = () => {
    setPdfGenerated(false);
    setPdfBlob(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 px-4 md:px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-block px-3 py-1 mb-3 text-xs font-medium tracking-wider text-primary bg-primary/5 rounded-full animate-fade-in">
            PDF GENERATOR
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight animate-fade-up">
            PDF Text Generator
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Enter your text and generate a PDF with your content.
          </p>
        </header>
        
        <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
          {!pdfGenerated ? (
            <PDFForm onSubmit={handleFormSubmit} />
          ) : (
            <div className="flex flex-col gap-6">
              <PDFViewer pdfBlob={pdfBlob} previewOnly={true} />
              <div className="flex justify-center">
                <button 
                  onClick={handleBackToForm}
                  className="px-6 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors duration-200"
                >
                  Back to form
                </button>
              </div>
            </div>
          )}
        </div>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            This tool generates PDFs with custom text using pdf-lib.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
