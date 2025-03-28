import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HebrewDatePicker from '@/components/HebrewDatePicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, User, Mail, Phone, UserRound, Home, Hash, Signature, Calendar as CalendarIcon } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { cn } from '@/lib/utils';

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

const maritalStatusOptions = [
  { value: 'ר', label: 'רווק/ה', fullLabel: 'רווק/ה' },
  { value: 'נ', label: 'נשוי/אה', fullLabel: 'נשוי/אה' },
  { value: 'ג', label: 'גרוש/ה', fullLabel: 'גרוש/ה' },
  { value: 'א', label: 'אלמן/ה', fullLabel: 'אלמן/ה' },
];

const currentYear = new Date().getFullYear();

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
  signature: z.string().min(1, { message: "חתימה נדרשת" }),
});

type FormValues = z.infer<typeof formSchema>;

interface NameFormProps {
  onSubmit: (data: FormValues) => void;
  isLoading?: boolean;
}

const NameForm: React.FC<NameFormProps> = ({ onSubmit, isLoading = false }) => {
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idNumber: '',
      firstName: '',
      lastName: '',
      fatherName: '',
      birthDate: undefined,
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

  React.useEffect(() => {
    const firstName = form.watch('firstName');
    const lastName = form.watch('lastName');
    
    if (firstName && lastName && !form.getValues('signature')) {
      generateAutoSignature(firstName, lastName);
    }
  }, [form.watch('firstName'), form.watch('lastName')]);

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

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const saveSignature = () => {
    if (signatureRef.current) {
      const dataUrl = signatureRef.current.toDataURL('image/png');
      form.setValue('signature', dataUrl, { shouldValidate: true });
      setShowSignaturePad(false);
    }
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      תאריך לידה
                    </FormLabel>
                    <FormControl>
                      <HebrewDatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                        error={!!form.formState.errors.birthDate}
                        helperText={form.formState.errors.birthDate?.message?.toString()}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

            <FormField
              control={form.control}
              name="signature"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel className="flex items-center gap-2 mb-2">
                    <Signature className="h-4 w-4" />
                    חתימה
                  </FormLabel>
                  <FormControl>
                    <div className="border rounded-md bg-white p-4 flex flex-col items-center">
                      {field.value ? (
                        <div className="flex flex-col items-center w-full">
                          <img 
                            src={field.value} 
                            alt="חתימה" 
                            className="max-h-[100px] mb-3"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSignaturePad(true)}
                            disabled={isLoading}
                          >
                            שנה חתימה
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => setShowSignaturePad(true)}
                          disabled={isLoading}
                        >
                          הוסף חתימה אישית
                        </Button>
                      )}
                      <input 
                        type="hidden" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Dialog open={showSignaturePad} onOpenChange={setShowSignaturePad}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>הוסף ��תימה</DialogTitle>
                  <DialogDescription>
                    חתום באמצעות העכבר או באצבע במכשיר מגע
                  </DialogDescription>
                </DialogHeader>
                <div className="border rounded-md bg-white p-1 h-[200px]">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      width: 500,
                      height: 198,
                      className: 'w-full h-full signature-canvas'
                    }}
                  />
                </div>
                <div className="flex justify-between">
                  <Button
                    type="button" 
                    variant="outline"
                    onClick={clearSignature}
                  >
                    נקה
                  </Button>
                  <Button
                    type="button"
                    onClick={saveSignature}
                  >
                    שמור חתימה
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

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
