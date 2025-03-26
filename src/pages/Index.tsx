
import React from 'react';
import PDFViewer from '@/components/PDFViewer';

const PDF_URL = 'https://lkd.org.il/wp-content/uploads/2022/01/uc-register-to-likud.pdf';

const Index = () => {
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
            View the PDF with added red italic "Hello World" text and download the modified file.
          </p>
        </header>
        
        <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <PDFViewer pdfUrl={PDF_URL} />
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
