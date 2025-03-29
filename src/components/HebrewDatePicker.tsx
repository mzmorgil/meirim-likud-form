import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { heIL } from '@mui/material/locale';
import dayjs from 'dayjs';
import 'dayjs/locale/he'; // Import Hebrew locale
import { toJewishDate, toHebrewJewishDate } from 'jewish-date';

// Create theme with Hebrew locale
const theme = createTheme(
  {
    direction: 'rtl',
  },
  heIL
);

interface HebrewDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  className?: string;
}

const HebrewDatePicker: React.FC<HebrewDatePickerProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
  helperText = '',
  className = '',
}) => {
  // Convert to dayjs object if value exists
  const dayjsValue = value ? dayjs(value) : null;
  
  // Handle dayjs to Date conversion
  const handleDateChange = (newValue: dayjs.Dayjs | null) => {
    onChange(newValue ? newValue.toDate() : null);
  };

  // Get Hebrew date representation using jewish-date package
  const getHebrewDateText = (date: Date | null) => {
    if (!date) return '';
    
    try {
      // Convert to Jewish date using the jewish-date package
      const jewishDate = toJewishDate(date);
      const hebrewDate = toHebrewJewishDate(jewishDate);
      
      // Format: day, month and year in Hebrew
      return `${hebrewDate.day} ${hebrewDate.monthName} ${hebrewDate.year}`;
    } catch (e) {
      console.error('Error converting to Hebrew date:', e);
      return '';
    }
  };

  // Hebrew date text to display
  const hebrewDateText = value ? getHebrewDateText(value) : '';
  
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
        <div className={`${className} flex flex-col`}>
          <DatePicker
            value={dayjsValue}
            onChange={handleDateChange}
            disabled={disabled}
            format="DD/MM/YYYY"
            openTo="year"
            views={['year', 'month', 'day']}
            slotProps={{
              textField: {
                placeholder: 'הכנס תאריך',
                error: error,
                InputLabelProps: { 
                  shrink: true,
                },
                sx: { 
                  direction: 'rtl',
                  '& .MuiInputBase-input': { 
                    textAlign: 'right',
                  },
                }
              },
              actionBar: {
                actions: ['clear'],
              },
            }}
          />
          
          {hebrewDateText && (
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {hebrewDateText}
            </div>
          )}
          
          {error && helperText && (
            <div className="text-sm font-medium text-destructive mt-1">
              {helperText}
            </div>
          )}
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default HebrewDatePicker;
