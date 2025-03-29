
import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Signature } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '@/utils/formValidations';

interface SignatureFieldProps {
  form: UseFormReturn<FormValues>;
  isLoading?: boolean;
}

const SignatureField: React.FC<SignatureFieldProps> = ({ form, isLoading = false }) => {
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const saveSignature = () => {
    if (signatureRef.current) {
      const dataUrl = signatureRef.current.toDataURL('image/png');
      form.setValue('signature', dataUrl, { shouldValidate: true });
      setShowSignaturePad(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="signature"
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
        </FormItem>
      )}
    />
  );

  return (
    <>
      <FormField
        control={form.control}
        name="signature"
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
          </FormItem>
        )}
      />

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
              onClick={saveSignature}
            >
              שמור חתימה
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignatureField;
