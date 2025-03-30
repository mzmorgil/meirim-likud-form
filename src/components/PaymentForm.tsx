import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, CreditCard, ArrowRight } from 'lucide-react';
import { useFormContext } from '@/hooks/use-form-context';

const paymentFormSchema = z.object({
  cardholderName: z.string().min(2, { message: "שם בעל/ת הכרטיס חייב להכיל לפחות 2 תווים" }),
  cardholderType: z.enum(['primary', 'spouse']).optional(),
  cardNumber: z
    .string()
    .min(13, { message: "מספר כרטיס חייב להכיל לפחות 13 ספרות" })
    .max(19, { message: "מספר כרטיס לא יכול להכיל יותר מ-19 ספרות" })
    .refine(val => /^\d+$/.test(val.replace(/\s/g, '')), { message: "מספר כרטיס חייב להכיל ספרות בלבד" }),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, { message: "תאריך תפוגה חייב להיות בפורמט MM/YY" })
    .refine(val => {
      const [month, year] = val.split('/');
      const expiryDate = new Date();
      expiryDate.setFullYear(2000 + parseInt(year, 10));
      expiryDate.setMonth(parseInt(month, 10) - 1, 1);
      
      const today = new Date();
      return expiryDate > today;
    }, { message: "כרטיס פג תוקף" }),
  cvv: z
    .string()
    .min(3, { message: "CVV חייב להכיל לפחות 3 ספרות" })
    .max(4, { message: "CVV לא יכול להכיל יותר מ-4 ספרות" })
    .refine(val => /^\d+$/.test(val), { message: "CVV חייב להכיל ספרות בלבד" }),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormValues) => void;
  onBack: () => void;
  isLoading?: boolean;
  includeSpouse?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  onSubmit, 
  onBack, 
  isLoading = false,
  includeSpouse = false
}) => {
  const { primaryUserData, spouseData } = useFormContext();
  
  const defaultCardholderName = primaryUserData 
    ? `${primaryUserData.firstName} ${primaryUserData.lastName}`.trim() 
    : '';
    
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardholderName: defaultCardholderName,
      cardholderType: 'primary',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    },
  });

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      if (value.length > 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      
      const month = parseInt(value.substring(0, 2), 10);
      if (month > 12) {
        value = '12' + value.substring(2);
      } else if (month === 0) {
        value = '01' + value.substring(2);
      }
    }
    
    form.setValue('expiryDate', value);
  };

  const formatCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    
    for (let i = 0; i < value.length; i += 4) {
      formattedValue += value.slice(i, i + 4) + ' ';
    }
    
    form.setValue('cardNumber', formattedValue.trim());
  };

  useEffect(() => {
    const cardholderType = form.watch('cardholderType');
    
    if (cardholderType === 'primary' && primaryUserData) {
      const primaryName = `${primaryUserData.firstName} ${primaryUserData.lastName}`.trim();
      form.setValue('cardholderName', primaryName);
    } else if (cardholderType === 'spouse' && spouseData) {
      const spouseName = `${spouseData.firstName} ${spouseData.lastName}`.trim();
      form.setValue('cardholderName', spouseName);
    }
  }, [form.watch('cardholderType'), primaryUserData, spouseData, form]);

  const handleSubmit = (values: PaymentFormValues) => {
    const cleanCardNumber = values.cardNumber.replace(/\s/g, '');
    onSubmit({
      ...values,
      cardNumber: cleanCardNumber
    });
  };

  const getPaymentAmount = () => {
    return includeSpouse ? '96 ₪' : '64 ₪';
  };

  const getPaymentDescription = () => {
    return includeSpouse ? 'עבור שני מתפקדים' : 'עבור מתפקד יחיד';
  };

  const renderCardholderField = () => {
    if (includeSpouse && spouseData) {
      return (
        <FormField
          control={form.control}
          name="cardholderType"
          render={({ field }) => (
            <FormItem>
              <FormLabel dir="rtl">שם בעל/ת הכרטיס</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  
                  if (value === 'primary' && primaryUserData) {
                    form.setValue('cardholderName', `${primaryUserData.firstName} ${primaryUserData.lastName}`.trim());
                  } else if (value === 'spouse' && spouseData) {
                    form.setValue('cardholderName', `${spouseData.firstName} ${spouseData.lastName}`.trim());
                  }
                }}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder="בחר שם בעל/ת הכרטיס" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent dir="rtl">
                  {primaryUserData && (
                    <SelectItem value="primary">
                      {primaryUserData.firstName} {primaryUserData.lastName}
                    </SelectItem>
                  )}
                  {spouseData && (
                    <SelectItem value="spouse">
                      {spouseData.firstName} {spouseData.lastName}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    } else {
      return (
        <FormItem>
          <FormLabel dir="rtl">שם בעל/ת הכרטיס</FormLabel>
          <div 
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-right text-base md:text-sm" 
            dir="rtl"
          >
            {defaultCardholderName}
          </div>
        </FormItem>
      );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-up" dir="rtl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">פרטי תשלום</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <div className="bg-secondary/20 rounded-lg p-3 mb-4 text-center">
              <p className="text-sm font-medium">סכום לתשלום: {getPaymentAmount()}</p>
              <p className="text-xs text-muted-foreground">{getPaymentDescription()}</p>
            </div>
            
            {renderCardholderField()}
            
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>מספר כרטיס</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="מספר כרטיס" 
                      {...field} 
                      onChange={(e) => {
                        formatCardNumber(e);
                        field.onChange(e);
                      }}
                      maxLength={19}
                      disabled={isLoading}
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
                    <FormLabel>תוקף (MM/YY)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="MM/YY" 
                        {...field} 
                        onChange={(e) => {
                          handleExpiryChange(e);
                          field.onChange(e);
                        }}
                        maxLength={5}
                        disabled={isLoading}
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
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="CVV" 
                        {...field} 
                        maxLength={4}
                        disabled={isLoading}
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <p className="text-sm text-muted-foreground">
              פרטי האשראי מאובטחים ומוצפנים. הסכום שיחויב הוא {getPaymentAmount()} {getPaymentDescription()}.
            </p>
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
              disabled={isLoading}
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

export default PaymentForm;
