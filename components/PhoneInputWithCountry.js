'use client';

import { COUNTRIES_DATA } from '@/lib/countries';

export default function PhoneInputWithCountry({
  phone,
  dialCode = '+44',
  onPhoneChange,
  onDialCodeChange,
  error,
  placeholder = 'Mobile Number (e.g. 7123 456789)',
  id = 'phone-input',
  name = 'whatsapp',
  theme = 'light', // 'light' or 'dark'
}) {
  const isDark = theme === 'dark';
  const currentCountry = COUNTRIES_DATA.find((c) => c.dialCode === dialCode) || COUNTRIES_DATA[0];

  return (
    <div>
      <div className="flex rounded-xl overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-[rgba(15,118,110,0.3)]">
        {/* Country Dial Code Dropdown */}
        <div
          className={`relative flex items-center border-y border-l rounded-l-xl ${
            isDark
              ? 'bg-slate-800/95 border-white/20 text-white'
              : 'bg-slate-100/90 border-gray-300 text-gray-800'
          }`}
        >
          <div className="flex items-center gap-1.5 pl-3 pr-7 py-3 text-sm font-bold pointer-events-none select-none">
            <span className="text-base">{currentCountry.flag}</span>
            <span>{dialCode}</span>
          </div>

          <select
            value={dialCode}
            onChange={(e) => onDialCodeChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-sm font-medium"
            aria-label="Country Dialing Code"
          >
            {COUNTRIES_DATA.map((country) => (
              <option
                key={`${country.code}-${country.dialCode}`}
                value={country.dialCode}
                className="bg-white text-gray-900 py-1"
              >
                {country.flag} {country.name} ({country.dialCode})
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute right-2 text-xs opacity-60">
            ▼
          </div>
        </div>

        {/* Local Phone Number Input */}
        <input
          id={id}
          type="tel"
          name={name}
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 min-w-0 w-full border-y border-r rounded-r-xl px-4 py-3 text-sm font-medium focus:outline-none transition-all ${
            isDark
              ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:bg-white/15'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#0F766E]'
          } ${error ? (isDark ? 'border-red-400 ring-1 ring-red-400' : 'border-red-500 ring-1 ring-red-500') : ''}`}
        />
      </div>
      {error && (
        <p className={`mt-1.5 text-xs font-semibold ${isDark ? 'text-red-300' : 'text-red-600'}`}>
          {error}
        </p>
      )}
    </div>
  );
}
