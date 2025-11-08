'use client';

import { useState } from 'react';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

interface PhoneNumberInputProps {
  value?: string;
  dialCode?: string;
  onChange?: (value: string) => void;
  onDialCodeChange?: (dialCode: string) => void;
  className?: string;
}

const countries: Country[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
];

export function PhoneNumberInput({
  value = '',
  dialCode = '+1',
  onChange,
  onDialCodeChange,
  className = '',
}: PhoneNumberInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((c) => c.dialCode === dialCode) || countries[0]
  );

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    onDialCodeChange?.(country.dialCode);
    setIsDropdownOpen(false);
  };

  return (
    <div className={`mb-6 ${className}`}>
      <label className="block font-semibold text-gray-900 mb-2">Phone number</label>
      <div className="flex items-center gap-4 w-full">
        {/* Country Code Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-[150px] h-12 px-4 bg-gray-100 border border-gray-100 rounded-xl flex items-center justify-between font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedCountry.flag}</span>
              <span>{selectedCountry.dialCode}</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-[250px] bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-[300px] overflow-y-auto">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors ${
                      selectedCountry.code === country.code ? 'bg-gray-50' : ''
                    }`}
                  >
                    <span className="text-xl">{country.flag}</span>
                    <span className="font-semibold text-gray-800 flex-1 text-left">
                      {country.name}
                    </span>
                    <span className="text-gray-600">{country.dialCode}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="flex-1">
          <input
            type="tel"
            value={value}
            placeholder="Phone Number"
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full h-12 px-3 bg-gray-100 border border-gray-100 rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>
    </div>
  );
}
