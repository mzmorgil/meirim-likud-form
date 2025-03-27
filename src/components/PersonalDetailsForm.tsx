
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileDown, LoaderCircle } from 'lucide-react';
import { generatePdfWithDetails } from '@/utils/pdfGenerator';

interface FormData {
  firstName: string;
  lastName: string;
  idNumber: string;
}

const PersonalDetailsForm = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      idNumber: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsGenerating(true);
      
      // Generate PDF with user details
      const pdfBlob = await generatePdfWithDetails(data);
      
      // Create a download link for the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.firstName}-${data.lastName}-details.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF generated successfully!', {
        description: 'Your document is ready for download.',
      });
      
      // Reset form after successful generation
      form.reset();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card border border-gray-100 shadow-sm">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your first name as it appears on official documents.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your last name as it appears on official documents.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your ID number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your official identification number.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="px-0 pb-0 pt-2">
              <Button 
                type="submit" 
                className="w-full btn-hover-effect" 
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Generate and Download PDF
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PersonalDetailsForm;
