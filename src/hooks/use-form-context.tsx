
import React, { createContext, useContext, useState } from 'react';
import { PersonFormValues, PrimaryFormValues, SpouseFormValues } from '@/components/PersonForm';

type FormContextType = {
  primaryUserData: PrimaryFormValues | null;
  spouseData: SpouseFormValues | null;
  setPrimaryUserData: (data: PrimaryFormValues) => void;
  setSpouseData: (data: SpouseFormValues) => void;
};

const FormContext = createContext<FormContextType>({
  primaryUserData: null,
  spouseData: null,
  setPrimaryUserData: () => {},
  setSpouseData: () => {},
});

export const FormProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [primaryUserData, setPrimaryUserData] = useState<PrimaryFormValues | null>(null);
  const [spouseData, setSpouseData] = useState<SpouseFormValues | null>(null);

  return (
    <FormContext.Provider
      value={{
        primaryUserData,
        spouseData,
        setPrimaryUserData,
        setSpouseData,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => useContext(FormContext);
