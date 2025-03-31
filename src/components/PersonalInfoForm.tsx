import React, { useEffect, useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { he } from 'date-fns/locale';
import { countries } from '@/utils/countryData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SignatureCanvas from 'react-signature-canvas';
import { Control } from 'react-hook-form';

export const currentYear = new Date().getFullYear();

export const genderOptions = [
  { value: 'ז', label: 'זכר' },
  { value: 'נ', label: 'נקבה' },
];

export const maritalStatusOptions = [
  { value: 'ר', label: 'רווק/ה' },
  { value: 'נ', label: 'נשוי/אה' },
  { value: 'ג', label: 'גרוש/ה' },
  { value: 'א', label: 'אלמן/ה' },
];

export const isValidIsraeliID = (id: string): boolean => {
  id = id.replace(/\D/g, '');
  
  if (id.length < 5) return false;
  if (id.length > 9) return false;
  
  id = id.padStart(9, '0');
  
  if (id.length === 9) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let digit = parseInt(id.charAt(i), 10);
      if (i % 2 === 0) {
        digit *= 1;
      } else {
        digit *= 2;
        if (digit > 9) {
          digit = digit - 9;
        }
      }
      sum += digit;
    }
    return (sum % 10 === 0);
  }
  
  return true;
};

interface PersonalInfoFormProps {
  control: Control<any>;
  isLoading: boolean;
  formPrefix?: string;
  includeMaritalStatus?: boolean;
  generateAutoSignature?: (firstName: string, lastName: string) => void;
  watchBirthCountry?: string;
  setShowImmigrationYear?: (show: boolean) => void;
  isSpouse?: boolean;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  control,
  isLoading,
  formPrefix = '',
  includeMaritalStatus = true,
  generateAutoSignature,
  watchBirthCountry,
  setShowImmigrationYear,
  isSpouse = false
}) => {
  const [signatureRef, setSignatureRef] = useState<SignatureCanvas | null>(null);
  
  useEffect(() => {
    if (setShowImmigrationYear && watchBirthCountry) {
      setShowImmigrationYear(watchBirthCountry !== 'ישראל');
    }
  }, [watchBirthCountry, setShowImmigrationYear]);

  const getFieldName = (name: string) => formPrefix ? `${formPrefix}.${name}` : name;

  const clearSignature = () => {
    if (signatureRef) {
      signatureRef.clear();
    }
  };

  const saveSignature = (field: any) => {
    if (signatureRef && !signatureRef.isEmpty()) {
      const dataURL = signatureRef.toDataURL('image/png');
      field.onChange(dataURL);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">{isSpouse ? 'פרטי בן/בת הזוג' : 'פרטים אישיים'}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={getFieldName('idNumber')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>מספר תעודת זהות</FormLabel>
              <FormControl>
                <Input 
                  placeholder="מספר תעודת זהות" 
                  {...field} 
                  disabled={isLoading}
                  dir="ltr"
                  className="text-right"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={getFieldName('firstName')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם פרטי</FormLabel>
              <FormControl>
                <Input 
                  placeholder="שם פרטי" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={getFieldName('lastName')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם משפחה</FormLabel>
              <FormControl>
                <Input 
                  placeholder="שם משפחה" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={getFieldName('fatherName')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם האב</FormLabel>
              <FormControl>
                <Input 
                  placeholder="שם האב" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name={getFieldName('birthDate')}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>תאריך לידה</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-right font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>בחר תאריך</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    locale={he}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={getFieldName('gender')}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>מין</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row gap-4"
                  disabled={isLoading}
                >
                  {genderOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value={option.value} id={`${getFieldName('gender')}-${option.value}`} />
                      <FormLabel htmlFor={`${getFieldName('gender')}-${option.value}`} className="font-normal cursor-pointer">
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
            name={getFieldName('maritalStatus')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>מצב משפחתי</FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר מצב משפחתי" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {maritalStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={getFieldName('birthCountry')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ארץ לידה</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר ארץ לידה" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
        
        {watchBirthCountry && watchBirthCountry !== 'ישראל' && (
          <FormField
            control={control}
            name={getFieldName('immigrationYear')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>שנת עלייה</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="שנת עלייה"
                    min="1948"
                    max={currentYear}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
      
      {!isSpouse && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <FormField
              control={control}
              name={getFieldName('address')}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כתובת מלאה</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="רחוב ומספר בית" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={control}
            name={getFieldName('city')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>יישוב</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="יישוב" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name={getFieldName('zipCode')}
            render={({ field }) => (
              <FormItem>
                <FormLabel>מיקוד (אופציונלי)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="מיקוד" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={getFieldName('mobile')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>טלפון נייד</FormLabel>
              <FormControl>
                <Input 
                  placeholder="טלפון נייד" 
                  {...field} 
                  disabled={isLoading}
                  dir="ltr"
                  className="text-right"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={getFieldName('email')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>דואר אלקטרוני</FormLabel>
              <FormControl>
                <Input 
                  placeholder="דואר אלקטרוני" 
                  {...field} 
                  disabled={isLoading}
                  dir="ltr"
                  type="email"
                  className="text-right"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name={getFieldName('signature')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>חתימה</FormLabel>
            <FormControl>
              <div className="flex flex-col border rounded-md overflow-hidden">
                {field.value ? (
                  <div className="p-2 flex flex-col items-center">
                    <div className="mb-2 w-full bg-gray-50 rounded p-2 flex justify-center">
                      <img 
                        src={field.value} 
                        alt="חתימה" 
                        className="max-h-20 max-w-full mix-blend-multiply" 
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => field.onChange('')}
                      disabled={isLoading}
                      size="sm"
                    >
                      החלף חתימה
                    </Button>
                  </div>
                ) : (
                  <div className="p-2 flex flex-col">
                    <div className="border rounded-md bg-white mb-2">
                      <SignatureCanvas
                        ref={(ref) => setSignatureRef(ref)}
                        canvasProps={{
                          width: 500,
                          height: 150,
                          className: 'w-full h-[150px] cursor-crosshair'
                        }}
                        backgroundColor="white"
                      />
                    </div>
                    <div className="flex justify-between space-x-2 space-x-reverse">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearSignature}
                        disabled={isLoading}
                        size="sm"
                      >
                        נקה
                      </Button>
                      <Button
                        type="button"
                        onClick={() => saveSignature(field)}
                        disabled={isLoading}
                        size="sm"
                      >
                        שמור חתימה
                      </Button>
                      {generateAutoSignature && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => generateAutoSignature(
                            control._formValues[getFieldName('firstName')],
                            control._formValues[getFieldName('lastName')]
                          )}
                          disabled={
                            isLoading || 
                            !control._formValues[getFieldName('firstName')] || 
                            !control._formValues[getFieldName('lastName')]
                          }
                          size="sm"
                        >
                          חתימה אוטומטית
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PersonalInfoForm;
