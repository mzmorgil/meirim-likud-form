
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, RefreshCw, CreditCard, User, CalendarDays, Lock } from 'lucide-react';

// Credit card validation functions
const validateCreditCardNumber = (number: string): boolean => {
  // Remove spaces and dashes
  const digitsOnly = number.replace(/[\s-]/g, '');
  
  // Check if contains only digits and length is valid (13-19 digits)
  if (!/^\d{13,19}$/.test(digitsOnly)) return false;
  
  // Luhn algorithm implementation
  let sum = 0;
  let shouldDouble = false;
  
  // Loop from right to left
  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let digit = parseInt(digitsOnly.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

const validateExpiryDate = (date: string): boolean => {
  // Format should be MM/YY
  if (!/^\d{2}\/\d{2}$/.test(date)) return false;
  
  const [month, year] = date.split('/').map(num => parseInt(num, 10));
  
  // Check if month is between 1-12
  if (month < 1 || month > 12) return false;
  
  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear() % 100; // Get last two digits of year
  const currentMonth = now.getMonth() + 1; // January is 0
  
  // Check if card is not expired
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  return true;
};

const formSchema = z.object({
  cardholderName: z.string().min(2, { message: "שם בעל הכרטיס חייב להכיל לפחות 2 תווים" }),
  cardNumber: z.string()
    .min(13, { message: "מספר כרטיס אשראי חייב להכיל לפחות 13 ספרות" })
    .max(19, { message: "מספר כרטיס אשראי לא יכול להכיל יותר מ-19 ספרות" })
    .refine(val => validateCreditCardNumber(val), { 
      message: "מספר כרטיס האשראי אינו תקין" 
    }),
  expiryDate: z.string()
    .regex(/^\d{2}\/\d{2}$/, { message: "פורמט תאריך לא תקין (MM/YY)" })
    .refine(val => validateExpiryDate(val), { 
      message: "תאריך תפוגה לא תקין או פג תוקף" 
    }),
  cvv: z.string()
    .regex(/^\d{3,4}$/, { message: "קוד CVV חייב להכיל 3 או 4 ספרות" }),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentFormProps {
  onSubmit: (data: FormValues) => void;
  onBack: () => void;
  isLoading?: boolean;
  includeSpouse?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, onBack, isLoading = false, includeSpouse = false }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    },
  });

  // Format credit card number with spaces every 4 digits
  const formatCreditCardNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    const groups = [];
    
    for (let i = 0; i < digitsOnly.length; i += 4) {
      groups.push(digitsOnly.slice(i, i + 4));
    }
    
    return groups.join(' ');
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length <= 2) {
      return digitsOnly;
    }
    
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}`;
  };

  const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCreditCardNumber(e.target.value);
    form.setValue('cardNumber', formattedValue);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiryDate(e.target.value);
    form.setValue('expiryDate', formattedValue);
  };

  const handleSubmit = (values: FormValues) => {
    // Clean up card number before submitting (remove spaces)
    const cleanedValues = {
      ...values,
      cardNumber: values.cardNumber.replace(/\s/g, ''),
    };
    
    onSubmit(cleanedValues);
  };

  // Calculate payment amount based on whether spouse is included
  const getPaymentAmount = () => {
    return includeSpouse ? '96 ₪' : '64 ₪';
  };

  // Get payment description
  const getPaymentDescription = () => {
    return includeSpouse ? 'עבור שני מתפקדים' : 'עבור מתפקד יחיד';
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-up" dir="rtl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">פרטי תשלום</CardTitle>
        <CardDescription className="text-center">יש להזין את פרטי כרטיס האשראי לתשלום דמי ההתפקדות</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      שם בעל הכרטיס
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הכנס שם מלא" 
                        {...field} 
                        className="transition-all focus:ring-2 text-right"
                        disabled={isLoading}
                        dir="rtl"
                        autoComplete="cc-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      מספר כרטיס אשראי
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0000 0000 0000 0000" 
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e);
                          handleCreditCardChange(e);
                        }}
                        className="transition-all focus:ring-2 text-left font-mono ltr"
                        disabled={isLoading}
                        dir="ltr"
                        maxLength={19}
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        תוקף
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="MM/YY" 
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            handleExpiryDateChange(e);
                          }}
                          className="transition-all focus:ring-2 text-left font-mono ltr"
                          disabled={isLoading}
                          dir="ltr"
                          maxLength={5}
                          inputMode="numeric"
                          autoComplete="cc-exp"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        CVV
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123" 
                          {...field} 
                          className="transition-all focus:ring-2 text-left font-mono ltr"
                          disabled={isLoading}
                          dir="ltr"
                          maxLength={4}
                          type="password"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-md text-sm">
              <p className="text-muted-foreground">
                פרטי האשראי מאובטחים ומוצפנים. הסכום שיחויב הוא {getPaymentAmount()} {getPaymentDescription()}.
              </p>
            </div>
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
                'המשך לתצוגה מקדימה'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default PaymentForm;
