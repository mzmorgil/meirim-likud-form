
import React from 'react';
import PersonForm, { SpouseFormValues } from './PersonForm';

interface SpouseFormProps {
  onSubmit: (data: SpouseFormValues) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const SpouseForm: React.FC<SpouseFormProps> = ({ onSubmit, onBack, isLoading = false }) => {
  return (
    <PersonForm
      isPrimary={false}
      onSubmit={onSubmit}
      onBack={onBack}
      isLoading={isLoading}
      title="הזנת פרטי בן/בת הזוג"
    />
  );
};

export default SpouseForm;
