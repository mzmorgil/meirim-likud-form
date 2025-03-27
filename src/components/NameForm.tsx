
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Calendar, User, Mail, Phone, UserRound, Home, Hash, Signature } from 'lucide-react';

// Validator for Israeli ID numbers
const isValidIsraeliID = (id: string) => {
  const cleanId = String(id).trim();
  if (cleanId.length > 9 || cleanId.length < 5 || isNaN(Number(cleanId))) return false;

  // Pad string with zeros up to 9 digits
  const paddedId = cleanId.length < 9 ? ("00000000" + cleanId).slice(-9) : cleanId;

  return Array
    .from(paddedId, Number)
    .reduce((counter, digit, i) => {
      const step = digit * ((i % 2) + 1);
      return counter + (step > 9 ? step - 9 : step);
    }, 0) % 10 === 0;
};

const maritalStatusOptions = [
  { value: 'ר', label: 'רווק/ה', fullLabel: 'רווק/ה' },
  { value: 'נ', label: 'נשוי/אה', fullLabel: 'נשוי/אה' },
  { value: 'ג', label: 'גרוש/ה', fullLabel: 'גרוש/ה' },
  { value: 'א', label: 'אלמן/ה', fullLabel: 'אלמן/ה' },
];

// Current year for validation
const currentYear = new Date().getFullYear();

const formSchema = z.object({
  idNumber: z.string()
    .min(5, { message: "מספר תעודת זהות חייב להכיל לפחות 5 ספרות" })
    .max(9, { message: "מספר תעודת זהות לא יכול להכיל יותר מ-9 ספרות" })
    .refine(val => isValidIsraeliID(val), { message: "מספר תעודת זהות אינו תקין" }),
  firstName: z.string().min(2, { message: "שם פרטי חייב להכיל לפחות 2 תווים" }),
  lastName: z.string().min(2, { message: "שם משפחה חייב להכיל לפחות 2 תווים" }),
  fatherName: z.string().min(2, { message: "שם האב חייב להכיל לפחות 2 תווים" }),
  birthDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "תאריך לידה אינו תקין" }),
  maritalStatus: z.string({ required_error: "יש לבחור מצב משפחתי" }),
  birthCountry: z.string().min(2, { message: "ארץ לידה חייבת להכיל לפחות 2 תווים" }),
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
});

type FormValues = z.infer<typeof formSchema>;

interface NameFormProps {
  onSubmit: (data: FormValues) => void;
  isLoading?: boolean;
}

const NameForm: React.FC<NameFormProps> = ({ onSubmit, isLoading = false }) => {
  const [signature, setSignature] = useState<string>('');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idNumber: '',
      firstName: '',
      lastName: '',
      fatherName: '',
      birthDate: '',
      maritalStatus: '',
      birthCountry: 'ישראל',
      immigrationYear: '',
      address: '',
      city: '',
      zipCode: '',
      mobile: '',
      email: '',
    },
  });

  // Update signature when first or last name changes
  React.useEffect(() => {
    const firstName = form.watch('firstName');
    const lastName = form.watch('lastName');
    
    if (firstName && lastName) {
      // Create basic signature based on name
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'italic bold 32px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Combine first and last name for signature
        const fullName = `${firstName} ${lastName}`;
        ctx.fillText(fullName, canvas.width / 2, canvas.height / 2);
        
        setSignature(canvas.toDataURL('image/png'));
      }
    }
  }, [form.watch('firstName'), form.watch('lastName')]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto animate-fade-up" dir="rtl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">התפקדות לליכוד - מאירים</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* תעודת זהות */}
              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      תעודת זהות
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הכנס תעודת זהות" 
                        {...field} 
                        className="transition-all focus:ring-2 text-right"
                        disabled={isLoading}
                        dir="rtl"
                        type="text"
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* שם פרטי */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      שם פרטי
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הכנס שם פרטי" 
                        {...field} 
                        className="transition-all focus:ring-2 text-right"
                        disabled={isLoading}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* שם משפחה */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      שם משפחה
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הכנס שם משפחה" 
                        {...field} 
                        className="transition-all focus:ring-2 text-right"
                        disabled={isLoading}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* שם האב */}
              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <UserRound className="h-4 w-4" />
                      שם האב
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הכנס שם האב" 
                        {...field} 
                        className="transition-all focus:ring-2 text-right"
                        disabled={isLoading}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* תאריך לידה */}
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      תאריך לידה
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        className="transition-all focus:ring-2"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* מצב משפחתי */}
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מצב משפחתי</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר מצב משפחתי" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {maritalStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.fullLabel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ארץ לידה */}
              <FormField
                control={form.control}
                name="birthCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ארץ לידה</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הכנס ארץ לידה" 
                        {...field} 
                        className="transition-all focus:ring-2 text-right"
                        disabled={isLoading}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* שנת עליה */}
              <FormField
                control={form.control}
                name="immigrationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שנת עלייה (אם רלוונטי)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הכנס שנת עלייה" 
                        {...field} 
                        type="number"
                        min="1948"
                        max={currentYear.toString()}
                        className="transition-all focus:ring-2 text-right"
                        disabled={isLoading}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* כתובת */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      כתובת
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הכנס כתובת מלאה" 
                        {...field} 
                        className="transition-all focus:ring-2 text-right"
                        disabled={isLoading}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ישוב */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>יישוב</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הכנס יישוב" 
                        {...field} 
                        className="transition-all focus:ring-2 text-right"
                        disabled={isLoading}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* מיקוד */}
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מיקוד (אופציונלי)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הכנס מיקוד" 
                        {...field} 
                        className="transition-all focus:ring-2 text-right"
                        disabled={isLoading}
                        dir="rtl"
                        type="text"
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* טלפון נייד */}
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      טלפון נייד
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הכנס מספר טלפון נייד" 
                        {...field} 
                        className="transition-all focus:ring-2 text-right"
                        disabled={isLoading}
                        dir="rtl"
                        type="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* דואר אלקטרוני */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      דואר אלקטרוני
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הכנס כתובת דואר אלקטרוני" 
                        {...field} 
                        className="transition-all focus:ring-2 text-right"
                        disabled={isLoading}
                        dir="rtl"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* חתימה */}
            <div className="col-span-full">
              <FormLabel className="flex items-center gap-2 mb-2">
                <Signature className="h-4 w-4" />
                חתימה
              </FormLabel>
              {signature ? (
                <div className="border p-4 rounded-md bg-white flex justify-center">
                  <img src={signature} alt="חתימה" style={{ maxHeight: '100px' }} />
                </div>
              ) : (
                <div className="border p-4 rounded-md bg-white text-center text-muted-foreground">
                  החתימה תיווצר אוטומטית לאחר מילוי השם
                </div>
              )}
            </div>
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
