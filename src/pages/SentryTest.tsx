
import React from 'react';
import { Button } from '@/components/ui/button';

const SentryTest = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">Sentry Error Test Page</h1>
      <Button
        type="button"
        variant="destructive"
        onClick={() => {
          throw new Error("Sentry Test Error");
        }}
      >
        Break the world
      </Button>
    </div>
  );
};

export default SentryTest;
