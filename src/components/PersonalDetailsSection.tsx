
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import HebrewDatePicker from '@/components/HebrewDatePicker';
import { UseFormReturn, UseFormWatch } from 'react-hook-form';
import { FormValues, genderOptions, maritalStatusOptions } from '@/utils/formValidations';
import { User, UserRound, CalendarIcon, Flag, Hash } from 'lucide-react';
import { countries } from '@/utils/countryData';

interface PersonalDetailsSectionProps {
  form: UseFormReturn<FormValues>;
  isLoading?: boolean;
  showImmigrationYear: boolean;
  watch: UseFormWatch<FormValues>;
}

const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({ 
  form,
  isLoading = false,
  showImmigrationYear,
  watch 
}) => {
  return (
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
        name="gender"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>מין</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-row justify-end space-x-4 space-x-reverse"
                disabled={isLoading}
              >
                {genderOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2 space-x-reverse mr-0 ml-4">
                    <RadioGroupItem value={option.value} id={`gender-${option.value}`} />
                    <FormLabel
                      htmlFor={`gender-${option.value}`}
                      className="font-normal cursor-pointer ml-0"
                    >
                      {option.label}
                    </FormLabel>
                  </div>
                ))}
              </RadioGroup>
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
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר מצב משפחתי" />
                </SelectTrigger>
              </FormControl>
              <SelectContent dir="rtl" align="end" className="text-right">
                {maritalStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-right">
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
            <FormLabel className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              ארץ לידה
            </FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר ארץ לידה" />
                </SelectTrigger>
              </FormControl>
              <SelectContent dir="rtl" className="max-h-[16rem] text-right" align="end">
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.name} className="text-right">
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {showImmigrationYear && (
        <FormField
          control={form.control}
          name="immigrationYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שנת עלייה</FormLabel>
              <FormControl>
                <Input 
                  placeholder="הכנס שנת עלייה" 
                  {...field} 
                  type="number"
                  min="1948"
                  max={new Date().getFullYear().toString()}
                  className="transition-all focus:ring-2 text-right"
                  disabled={isLoading}
                  dir="rtl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default PersonalDetailsSection;
