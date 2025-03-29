
import React from 'react';
import PersonForm, { PrimaryFormValues } from './PersonForm';

interface NameFormProps {
  onSubmit: (data: PrimaryFormValues) => void;
  isLoading?: boolean;
}

const NameForm: React.FC<NameFormProps> = ({ onSubmit, isLoading = false }) => {
  return (
    <PersonForm
      isPrimary={true}
      onSubmit={onSubmit}
      isLoading={isLoading}
      title="הזנת פרטים"
    />
  );
};

export default NameForm;
