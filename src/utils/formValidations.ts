
import { z } from 'zod';

// Validation function for Israeli ID
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

// Current year for validation
export const currentYear = new Date().getFullYear();

// Form schema definition
export const formSchema = z.object({
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
  maritalStatus: z.string({ required_error: "יש לבחור מצב משפחתי" }),
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

// Type for form values based on the schema
export type FormValues = z.infer<typeof formSchema>;

// Form options
export const maritalStatusOptions = [
  { value: 'ר', label: 'רווק/ה', fullLabel: 'רווק/ה' },
  { value: 'נ', label: 'נשוי/אה', fullLabel: 'נשוי/אה' },
  { value: 'ג', label: 'גרוש/ה', fullLabel: 'גרוש/ה' },
  { value: 'א', label: 'אלמן/ה', fullLabel: 'אלמן/ה' },
];

// Reversed the order to show זכר first since we're in RTL
export const genderOptions = [
  { value: 'ז', label: 'זכר' },
  { value: 'נ', label: 'נקבה' },
];
