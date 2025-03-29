
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, RefreshCw } from 'lucide-react';
import PersonalInfoForm, { currentYear } from './PersonalInfoForm';

const isValidIsraeliID = (id: string) => {
  const cleanId = String(id).trim();
  if (cleanId.length > 9 || cleanId.length < 5 || isNaN(Number(cleanId))) return false;

  const paddedId = cleanId.length < 9 ? ("00000000" + cleanId).slice(-9) : cleanId;

  return Array
    .from(paddedId, Number)
    .reduce((counter, digit, i) => {
      const step = digit * ((i % 2) + 1);
      return counter + (step > 9 ? step - 9 : step);
    }, 0) % 10 === 0;
};

const formSchema = z.object({
  idNumber: z.string()
    .min(5, { message: "מספר תעודת זהות חייב להכיל לפחות 5 ספרות" })
    .max(9, { message: "מספר תעודת זהות לא יכול להכיל יותר מ-9 ספרות" })
    .refine(val => isValidIsraeliID(val), { message: "מספר תעודת זהות אינו תקין" }),
  firstName: z.string().min(2, { message: "שם פרטי חייב להכיל לפחות 2 תווים" }),
  lastName: z.string().min(2, { message: "שם משפחה חייב להכיל לפחות 2 תווים" }),
  fatherName: z.string().min(2, { message: "שם האב חייב להכיל לפחות 2 תווים" }),
  birthDate: z.date({
    required_error: "יש לבחור תאריך לידה",
  }),
  gender: z.string({ required_error: "יש לבחור מין" }),
  birthCountry: z.string().min(2, { message: "יש לבחור ארץ לידה" }),
  immigrationYear: z.string().optional()
    .refine(val => !val || (Number(val) >= 1948 && Number(val) <= currentYear), {
      message: `שנת עלייה חייבת להיות בין 1948 ל-${currentYear}`,
      path: ["immigrationYear"]
    }),
  address: z.string().min(5, { message: "כתובת חייבת להכיל לפחות 5 תווים" }),
  city: z.string().min(2, { message: "יישוב חייב להכיל לפחות 2 תווים" }),
  zipCode: z.string().optional(),
  mobile: z.string().min(9, { message: "מספר טלפון נייד חייב להכיל לפחות 9 ספרות" }),
  email: z.string().email({ message: "כתובת דואר אלקטרוני אינה תקינה" }),
  signature: z.string().min(1, { message: "חתימה נדרשת" }),
});

type FormValues = z.infer<typeof formSchema>;

interface SpouseFormProps {
  onSubmit: (data: FormValues) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const SpouseForm: React.FC<SpouseFormProps> = ({ onSubmit, onBack, isLoading = false }) => {
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

  const watchFirstName = form.watch('firstName');
  const watchLastName = form.watch('lastName');
  const watchBirthCountry = form.watch('birthCountry');

  const generateAutoSignature = (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = 'italic 32px "Segoe Script", "Brush Script MT", cursive';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const fullName = `${firstName} ${lastName}`;
      ctx.fillText(fullName, canvas.width / 2, canvas.height / 2);
      
      const dataUrl = canvas.toDataURL('image/png');
      form.setValue('signature', dataUrl);
    }
  };

  useEffect(() => {
    if (watchFirstName && watchLastName && !form.getValues('signature')) {
      generateAutoSignature(watchFirstName, watchLastName);
    }
  }, [watchFirstName, watchLastName]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto animate-fade-up" dir="rtl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">הזנת פרטי בן/בת הזוג</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <PersonalInfoForm
              control={form.control}
              isLoading={isLoading}
              formPrefix="spouse"
              generateAutoSignature={generateAutoSignature}
              watchBirthCountry={watchBirthCountry}
              setShowImmigrationYear={setShowImmigrationYear}
            />
          </CardContent>
          <CardFooter className="flex justify-between pb-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              חזור
            </Button>
            <Button 
              type="submit" 
              className="btn-hover-effect"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                  מעבד...
                </>
              ) : (
                'המשך'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SpouseForm;
