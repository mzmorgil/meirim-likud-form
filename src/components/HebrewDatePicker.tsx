
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { he } from 'date-fns/locale';
import { TextField } from '@mui/material';
import { format, isValid } from 'date-fns';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { heIL } from '@mui/material/locale';

// Create theme with Hebrew locale
const theme = createTheme(
  {
    typography: {
      fontFamily: 'inherit',
    },
    components: {
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            marginTop: 4,
            fontSize: '0.75rem',
          },
        },
      },
    },
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
  // Convert Gregorian date to Hebrew date representation
  const getHebrewDateText = (date: Date | null) => {
    if (!date || !isValid(date)) return '';
    
    // This is a basic conversion - for a full Hebrew calendar conversion
    // a specialized library would be better
    try {
      // Format: create a basic Hebrew representation
      return new Intl.DateTimeFormat('he-IL', {
        calendar: 'hebrew',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch (e) {
      console.error('Error converting to Hebrew date:', e);
      return '';
    }
  };

  // Hebrew date text to display
  const hebrewDateText = value ? getHebrewDateText(value) : '';
  
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
        <div className={`${className} flex flex-col`}>
          <DatePicker
            value={value}
            onChange={onChange}
            disabled={disabled}
            format="dd/MM/yyyy"
            views={['year', 'month', 'day']}
            showDaysOutsideCurrentMonth
            localeText={{
              previousYear: 'שנה קודמת',
              nextYear: 'שנה הבאה',
            }}
            slots={{
              textField: (params) => (
                <TextField 
                  {...params}
                  fullWidth
                  error={error}
                  sx={{ 
                    direction: 'rtl',
                    '& .MuiInputBase-input': { 
                      textAlign: 'right',
                    }
                  }}
                />
              ),
            }}
            slotProps={{
              textField: {
                placeholder: 'הכנס תאריך',
                InputLabelProps: { 
                  shrink: true,
                },
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
