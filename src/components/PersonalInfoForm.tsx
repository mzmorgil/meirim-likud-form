
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import HebrewDatePicker from '@/components/HebrewDatePicker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { z } from 'zod';
import { Control } from 'react-hook-form';
import { Hash, User, UserRound, Calendar as CalendarIcon, Flag, Mail, Phone, Home, Signature, Users } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { countries } from '@/utils/countryData';

export const genderOptions = [
  { value: 'ז', label: 'זכר' },
  { value: 'נ', label: 'נקבה' },
];

export const maritalStatusOptions = [
  { value: 'ר', label: 'רווק/ה', fullLabel: 'רווק/ה' },
  { value: 'נ', label: 'נשוי/אה', fullLabel: 'נשוי/אה' },
  { value: 'ג', label: 'גרוש/ה', fullLabel: 'גרוש/ה' },
  { value: 'א', label: 'אלמן/ה', fullLabel: 'אלמן/ה' },
];

export const currentYear = new Date().getFullYear();

// Export the ID validation function for reuse
export const isValidIsraeliID = (id: string) => {
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

interface PersonalInfoFormProps {
  control: Control<any>;
  isLoading?: boolean;
  formPrefix?: string;
  includeMaritalStatus?: boolean;
  generateAutoSignature?: (firstName: string, lastName: string) => void;
  watchBirthCountry: string;
  setShowImmigrationYear: (show: boolean) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  control,
  isLoading = false,
  formPrefix = "",
  includeMaritalStatus = false,
  generateAutoSignature,
  watchBirthCountry,
  setShowImmigrationYear
}) => {
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);
  const showImmigrationYear = watchBirthCountry !== 'ישראל';
  const nameId = formPrefix ? `${formPrefix}-` : '';

  useEffect(() => {
    setShowImmigrationYear(watchBirthCountry !== 'ישראל');
  }, [watchBirthCountry, setShowImmigrationYear]);

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const saveSignature = () => {
    if (signatureRef.current) {
      const dataUrl = signatureRef.current.toDataURL('image/png');
      return dataUrl;
    }
    return '';
  };

  const getFieldName = (name: string) => 
    formPrefix ? `${formPrefix}.${name}` : name;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={control}
        name={getFieldName("idNumber")}
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
        control={control}
        name={getFieldName("firstName")}
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
        control={control}
        name={getFieldName("lastName")}
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
        control={control}
        name={getFieldName("fatherName")}
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
        control={control}
        name={getFieldName("birthDate")}
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
                error={false}
                helperText=""
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={getFieldName("gender")}
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>מין</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-row space-x-4 space-x-reverse text-right"
                disabled={isLoading}
              >
                {genderOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value={option.value} id={`${nameId}gender-${option.value}`} />
                    <FormLabel
                      htmlFor={`${nameId}gender-${option.value}`}
                      className="font-normal cursor-pointer"
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

      {includeMaritalStatus && (
        <FormField
          control={control}
          name={getFieldName("maritalStatus")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                מצב משפחתי
              </FormLabel>
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
      )}

      <FormField
        control={control}
        name={getFieldName("birthCountry")}
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
                <SelectTrigger>
                  <SelectValue placeholder="בחר ארץ לידה" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[16rem]">
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
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
          control={control}
          name={getFieldName("immigrationYear")}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">שנת עלייה</FormLabel>
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
      )}
      
      <FormField
        control={control}
        name={getFieldName("address")}
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
        control={control}
        name={getFieldName("city")}
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
        control={control}
        name={getFieldName("zipCode")}
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
        control={control}
        name={getFieldName("mobile")}
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
        control={control}
        name={getFieldName("email")}
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

      <FormField
        control={control}
        name={getFieldName("signature")}
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

            <Dialog open={showSignaturePad} onOpenChange={setShowSignaturePad}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>הוסף חתימה</DialogTitle>
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
                    onClick={() => {
                      const dataUrl = saveSignature();
                      field.onChange(dataUrl);
                      setShowSignaturePad(false);
                    }}
                  >
                    שמור חתימה
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </FormItem>
        )}
      />
    </div>
  );
};

export default PersonalInfoForm;
