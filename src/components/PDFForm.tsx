
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { generatePdfWithText } from '@/utils/pdfUtils';

interface PDFFormProps {
  onSubmit: (text: string, pdfBlob: Blob) => void;
}

const PDFForm: React.FC<PDFFormProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }
    
    try {
      setIsGenerating(true);
      const pdfBlob = await generatePdfWithText(text);
      onSubmit(text, pdfBlob);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-background/70 backdrop-blur border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-center text-xl">Enter Your Text</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Your Text</Label>
            <Textarea
              id="text"
              placeholder="Enter the text you want to include in your PDF..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[150px]"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PDFForm;
