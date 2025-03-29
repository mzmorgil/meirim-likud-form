
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw } from 'lucide-react';
import { formSchema, FormValues } from '@/utils/formValidations';
import PersonalDetailsSection from './PersonalDetailsSection';
import ContactDetailsSection from './ContactDetailsSection';
import SignatureField from './SignatureField';
import { generateAutoSignature } from '@/utils/signatureUtils';

interface NameFormProps {
  onSubmit: (data: FormValues) => void;
  isLoading?: boolean;
}

const NameForm: React.FC<NameFormProps> = ({ onSubmit, isLoading = false }) => {
  const [showImmigrationYear, setShowImmigrationYear] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idNumber: '',
      firstName: '',
      lastName: '',
      fatherName: '',
      birthDate: undefined,
      gender: '',
      maritalStatus: '',
      birthCountry: 'ישראל',
      immigrationYear: '',
      address: '',
      city: '',
      zipCode: '',
      mobile: '',
      email: '',
      signature: '',
    },
  });

  useEffect(() => {
    const firstName = form.watch('firstName');
    const lastName = form.watch('lastName');
    
    if (firstName && lastName && !form.getValues('signature')) {
      const signature = generateAutoSignature(firstName, lastName);
      form.setValue('signature', signature);
    }
  }, [form.watch('firstName'), form.watch('lastName')]);

  // Monitor birth country to show/hide immigration year field
  useEffect(() => {
    const birthCountry = form.watch('birthCountry');
    setShowImmigrationYear(birthCountry !== 'ישראל');
    
    // Clear immigration year if birth country is Israel
    if (birthCountry === 'ישראל' && form.getValues('immigrationYear')) {
      form.setValue('immigrationYear', '');
    }
  }, [form.watch('birthCountry')]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto animate-fade-up" dir="rtl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">הזנת פרטים</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            {/* Personal Details Section */}
            <PersonalDetailsSection 
              form={form} 
              isLoading={isLoading} 
              showImmigrationYear={showImmigrationYear}
              watch={form.watch}
            />

            {/* Contact Details Section */}
            <ContactDetailsSection 
              form={form} 
              isLoading={isLoading} 
            />

            {/* Signature Field */}
            <SignatureField 
              form={form} 
              isLoading={isLoading} 
            />
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Button 
              type="submit" 
              className="w-full max-w-md btn-hover-effect"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                  מעבד...
                </>
              ) : (
                'צור טופס התפקדות'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default NameForm;
