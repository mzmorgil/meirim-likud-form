import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Heart, ArrowRight } from 'lucide-react';
import PersonalInfoForm, { currentYear, isValidIsraeliID, maritalStatusOptions } from './PersonalInfoForm';

// Create a common form schema that can be used for both primary applicant and spouse
export const personFormSchema = z.object({
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
  gender: z.string({ required_error: "יש לבחור מין" }).min(1, { message: "יש לבחור מין" }),
  maritalStatus: z.string().min(1, { message: "יש לבחור מצב משפחתי" }),
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

// Extend the schema for primary applicant to include the spouse checkbox
export const primaryFormSchema = personFormSchema.extend({
  includeSpouse: z.boolean().default(false),
});

export type PersonFormValues = z.infer<typeof personFormSchema>;
export type PrimaryFormValues = z.infer<typeof primaryFormSchema>;

interface PersonFormProps {
  isPrimary?: boolean;
  onSubmit: (data: PersonFormValues | PrimaryFormValues) => void;
  onBack?: () => void;
  isLoading?: boolean;
  title: string;
}

const PersonForm: React.FC<PersonFormProps> = ({ 
  isPrimary = false, 
  onSubmit, 
  onBack, 
  isLoading = false,
  title
}) => {
  const [showImmigrationYear, setShowImmigrationYear] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);
  
  // Use the appropriate schema based on whether this is the primary form
  const formSchema = isPrimary ? primaryFormSchema : personFormSchema;
  
  const form = useForm<any>({
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
      ...(isPrimary ? { includeSpouse: false } : {}),
    },
  });

  const watchFirstName = form.watch('firstName');
  const watchLastName = form.watch('lastName');
  const watchBirthCountry = form.watch('birthCountry');
  const watchIncludeSpouse = isPrimary ? form.watch('includeSpouse') : false;

  // Set showImmigrationYear based on birthCountry
  useEffect(() => {
    setShowImmigrationYear(watchBirthCountry !== 'ישראל');
  }, [watchBirthCountry]);

  // Load the Hebrew handwriting font
  useEffect(() => {
    const loadFont = async () => {
      try {
        const font = new FontFace(
          'DanaYadAlefAlefAlef', 
          'url(/fonts/DanaYadAlefAlefAlef-Normal.otf)'
        );
        
        await font.load();
        document.fonts.add(font);
        setFontLoaded(true);
        
        // Re-generate signature if names exist and font is now loaded
        if (watchFirstName && watchLastName) {
          generateAutoSignature(watchFirstName, watchLastName);
        }
      } catch (err) {
        console.error('Failed to load handwriting font:', err);
        // Fall back to default fonts if there's an error
        setFontLoaded(true);
      }
    };
    
    loadFont();
  }, []);

  useEffect(() => {
    // Auto-generate signature for both primary and spouse forms
    // but only generate when both firstName and lastName are present and signature is empty
    if (fontLoaded && watchFirstName && watchLastName && !form.getValues('signature')) {
      generateAutoSignature(watchFirstName, watchLastName);
    }
  }, [watchFirstName, watchLastName, fontLoaded]);

  const generateAutoSignature = (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Set transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Use the Hebrew handwriting font or fall back to a script font
      const fontFamily = fontLoaded ? 
        'DanaYadAlefAlefAlef, "Segoe Script", cursive' : 
        '"Segoe Script", "Brush Script MT", cursive';
      
      // Set up the context for drawing
      ctx.font = `32px ${fontFamily}`;
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Apply a slight rotation for a more natural look
      ctx.save();
      const angle = (Math.random() * 6 - 3) * Math.PI / 180; // Random angle between -3 and 3 degrees
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(angle);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      
      // Add a slight wave to the signature
      const fullName = `${firstName} ${lastName}`;
      
      // Draw the signature with a slight natural variation
      ctx.fillText(fullName, canvas.width / 2, canvas.height / 2);
      
      // Restore the context
      ctx.restore();
      
      // Convert to transparent PNG
      const dataUrl = canvas.toDataURL('image/png');
      form.setValue('signature', dataUrl);
    }
  };

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  const toggleSpouseSelection = () => {
    if (isPrimary && !isLoading) {
      const currentValue = form.getValues('includeSpouse');
      form.setValue('includeSpouse', !currentValue);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto animate-fade-up" dir="rtl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <PersonalInfoForm
              control={form.control}
              isLoading={isLoading}
              formPrefix=""
              includeMaritalStatus={true}
              generateAutoSignature={generateAutoSignature}
              watchBirthCountry={watchBirthCountry}
              showImmigrationYear={showImmigrationYear}
            />

            {isPrimary && (
              <FormField
                control={form.control}
                name="includeSpouse"
                render={({ field }) => (
                  <FormItem 
                    className={`flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-md border p-4 cursor-pointer transition-all duration-200 ${
                      field.value ? 'border-rose-300 bg-rose-50/30 shadow-sm' : 'hover:border-muted-foreground/20'
                    }`}
                    onClick={toggleSpouseSelection}
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <Heart className={`h-4 w-4 ${field.value ? 'text-rose-500 fill-rose-500' : 'text-muted-foreground'} transition-colors`} />
                        הוסף התפקדות לבן/בת זוג
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        סמן כאן אם ברצונך להוסיף התפקדות עבור בן/בת הזוג שלך
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter className={`flex ${onBack ? 'justify-between' : 'justify-center'} pb-6`}>
            {onBack && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onBack}
                disabled={isLoading}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                חזור
              </Button>
            )}
            <Button 
              type="submit" 
              className={`${!onBack ? 'w-full max-w-md' : ''} btn-hover-effect`}
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

export default PersonForm;
