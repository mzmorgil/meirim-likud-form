
import React from 'react';
import PersonForm, { PersonFormValues } from './PersonForm';

interface SpouseFormProps {
  onSubmit: (data: PersonFormValues) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const SpouseForm: React.FC<SpouseFormProps> = ({ onSubmit, onBack, isLoading = false }) => {
  const handleSubmit = (data: PersonFormValues) => {
    console.log("SpouseForm handleSubmit called with data:", data);
    // Ensure we're properly passing the data to the parent component
    onSubmit(data);
  };

  return (
    <PersonForm
      isPrimary={false}
      onSubmit={handleSubmit}
      onBack={onBack}
      isLoading={isLoading}
      title="הזנת פרטי בן/בת הזוג"
      includeAddressFields={false} // This is the key change - don't include address fields in spouse form
    />
  );
};

export default SpouseForm;
