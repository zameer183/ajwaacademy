export const COUNTRIES_DATA = [
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
  { name: 'Norway', code: 'NO', dialCode: '+47', flag: '🇳🇴' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Ireland', code: 'IE', dialCode: '+353', flag: '🇮🇪' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Belgium', code: 'BE', dialCode: '+32', flag: '🇧🇪' },
  { name: 'Denmark', code: 'DK', dialCode: '+45', flag: '🇩🇰' },
  { name: 'Finland', code: 'FI', dialCode: '+358', flag: '🇫🇮' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'Other / Worldwide', code: 'OTHER', dialCode: '+', flag: '🌍' },
];

/**
 * Format a phone number with country dial code.
 * Strips leading 0s and unwanted characters, avoids double dial codes.
 */
export function formatInternationalPhone(phone, dialCode) {
  if (!phone) return '';
  let cleanPhone = String(phone).trim().replace(/[^\d+]/g, '');
  const cleanDialCode = String(dialCode || '').trim();

  // If user already typed full number starting with + or 00
  if (cleanPhone.startsWith('00')) {
    cleanPhone = '+' + cleanPhone.slice(2);
  }
  if (cleanPhone.startsWith('+')) {
    return cleanPhone;
  }

  // Strip leading 0
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.replace(/^0+/, '');
  }

  // If dialCode is '+' or empty, just return '+' + cleanPhone
  if (!cleanDialCode || cleanDialCode === '+') {
    return cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
  }

  // If phone already starts with dial code digits (without the +)
  const dialDigits = cleanDialCode.replace('+', '');
  if (cleanPhone.startsWith(dialDigits)) {
    return `+${cleanPhone}`;
  }

  return `${cleanDialCode} ${cleanPhone}`.trim();
}

/**
 * Find country by name or code
 */
export function findCountry(query) {
  if (!query) return COUNTRIES_DATA[0];
  const q = String(query).toLowerCase();
  return (
    COUNTRIES_DATA.find(
      (c) =>
        c.name.toLowerCase() === q ||
        c.code.toLowerCase() === q ||
        c.dialCode.toLowerCase() === q ||
        q.includes(c.name.toLowerCase()) ||
        q.includes(c.code.toLowerCase())
    ) || COUNTRIES_DATA[0]
  );
}
