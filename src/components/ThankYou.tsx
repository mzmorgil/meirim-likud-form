import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface ThankYouProps {
  name: string;
}

const ThankYou: React.FC<ThankYouProps> = ({ name }) => {
  return (
    <div className="max-w-md mx-auto">
      <Card className="text-center animate-fade-up">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-20 w-20 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">תודה רבה, {name}!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            ההתפקדות שלך לליכוד התקבלה בהצלחה.
          </p>
          <p>
            אנו מודים לך על הצטרפותך למפלגת הליכוד באמצעות דורית יצחק.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => window.location.href = "https://מאירים.ישראל"}
            className="px-8 py-2"
          >
            חזרה לאתר מאירים
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ThankYou;
