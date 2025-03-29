
// Dynamic country data fetcher with caching
import { useEffect, useState } from 'react';

// Default countries data in case fetch fails
const defaultCountries: { code: string; name: string }[] = [
  { code: 'il', name: 'ישראל' },
  { code: 'us', name: 'ארצות הברית' },
  { code: 'gb', name: 'הממלכה המאוחדת' },
];

// Function to get flag image URL for a country code
export const getCountryFlagUrl = (code: string): string => {
  return `https://flagcdn.com/h24/${code.toLowerCase()}.png`;
};

// Hook to fetch and cache countries
export const useCountries = () => {
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        // Check if we have cached data in sessionStorage
        const cachedData = sessionStorage.getItem('countryData');
        
        if (cachedData) {
          setCountries(JSON.parse(cachedData));
          setIsLoading(false);
          return;
        }
        
        // If no cached data, fetch from API
        const response = await fetch('https://flagcdn.com/he/codes.json');
        
        if (!response.ok) {
          throw new Error('Failed to fetch country data');
        }
        
        const data = await response.json();
        
        // Convert object to array and filter out non-2-letter codes
        const countryArray = Object.entries(data)
          .filter(([code]) => code.length === 2 && !code.includes('-'))
          .map(([code, name]) => ({ code, name: name as string }))
          .sort((a, b) => a.name.localeCompare(b.name, 'he'));
        
        // Cache the data
        sessionStorage.setItem('countryData', JSON.stringify(countryArray));
        
        setCountries(countryArray);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching country data:', err);
        setError('Failed to load country data');
        // Use default data if fetch fails
        setCountries(defaultCountries);
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, isLoading, error };
};

export const getCountryByCode = (code: string, countryList: { code: string; name: string }[]): string => {
  const country = countryList.find(c => c.code === code);
  return country ? country.name : '';
};

export const getCountryCodeByName = (name: string, countryList: { code: string; name: string }[]): string => {
  const country = countryList.find(c => c.name === name);
  return country ? country.code : '';
};
