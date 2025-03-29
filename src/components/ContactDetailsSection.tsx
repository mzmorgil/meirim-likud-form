
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/utils/formValidations';
import { Home, Phone, Mail } from 'lucide-react';

interface ContactDetailsSectionProps {
  form: UseFormReturn<FormValues>;
  isLoading?: boolean;
}

const ContactDetailsSection: React.FC<ContactDetailsSectionProps> = ({ form, isLoading = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="email@example.com" 
                {...field} 
                className="transition-all focus:ring-2 text-left"
                disabled={isLoading}
                dir="ltr"
                type="email"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ContactDetailsSection;
