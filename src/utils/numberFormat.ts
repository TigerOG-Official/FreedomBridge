export const formatLargeNumber = (value: string): { formatted: string; word?: string } => {
  const parts = value.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  if (!integerPart || (integerPart === '0' && !decimalPart)) {
    return { formatted: '0' };
  }

  const addCommas = (str: string) => str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  let formatted = addCommas(integerPart);
  if (decimalPart) {
    const trimmedDecimal = decimalPart.substring(0, 6).replace(/0+$/, '');
    if (trimmedDecimal) {
      formatted += `.${trimmedDecimal}`;
    }
  }

  const num = parseFloat(value);
  const units = [
    { value: 1e27, name: 'octillion' },
    { value: 1e24, name: 'septillion' },
    { value: 1e21, name: 'sextillion' },
    { value: 1e18, name: 'quintillion' },
    { value: 1e15, name: 'quadrillion' },
    { value: 1e12, name: 'trillion' },
    { value: 1e9, name: 'billion' },
    { value: 1e6, name: 'million' },
    { value: 1e3, name: 'thousand' },
  ];

  for (const unit of units) {
    if (num >= unit.value * 0.999) {
      const inUnit = num / unit.value;
      const unitFormatted = inUnit.toFixed(3).replace(/\.?0+$/, '');
      return { formatted, word: `${unitFormatted} ${unit.name}` };
    }
  }

  return { formatted };
};

// Format input value with commas for display
export const formatInputWithCommas = (value: string): string => {
  if (!value) return '';

  const parts = value.split('.');
  const integerPart = parts[0].replace(/,/g, '');
  const decimalPart = parts[1];

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};
