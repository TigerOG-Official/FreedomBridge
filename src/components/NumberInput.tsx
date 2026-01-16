import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { formatInputWithCommas } from '../utils/numberFormat';

interface NumberInputProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
}

export const NumberInput = ({ value, onValueChange, className, ...props }: NumberInputProps) => {
  const [displayValue, setDisplayValue] = useState(formatInputWithCommas(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<number | null>(null);

  // Sync display value when external value changes (e.g. Max button)
  useEffect(() => {
    const formatted = formatInputWithCommas(value);
    if (formatted !== displayValue) {
      setDisplayValue(formatted);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    // Remove all commas for the raw value
    const rawValue = newValue.replace(/,/g, '');

    // Validate: allow numbers and one decimal point
    if (rawValue !== '' && !/^\d*\.?\d*$/.test(rawValue)) {
      return;
    }

    // Calculate the new display value with formatting
    const newDisplayValue = formatInputWithCommas(rawValue);

    // Store cursor position relative to non-comma characters
    // This is a simplified approach:
    // 1. Count non-comma chars before cursor in the new raw input (before formatting logic ran on it fully?)
    // Actually, newValue is what the user typed (e.g. "1,0005" if they typed 5 at end of 1,000).
    
    // Strategy:
    // Count how many digits were before the cursor in the `newValue`.
    // Find the position in `newDisplayValue` that has the same number of digits before it.
    
    let digitsBeforeCursor = 0;
    for (let i = 0; i < (cursorPosition || 0); i++) {
      if (/[0-9.]/.test(newValue[i])) {
        digitsBeforeCursor++;
      }
    }

    setDisplayValue(newDisplayValue);
    onValueChange(rawValue);

    // We need to set the cursor position AFTER React renders the new value.
    // We calculate where the cursor should be in the new formatted string.
    let newCursorPos = 0;
    let digitsSeen = 0;
    for (let i = 0; i < newDisplayValue.length; i++) {
        if (digitsSeen === digitsBeforeCursor) {
            break;
        }
        newCursorPos++;
        if (/[0-9.]/.test(newDisplayValue[i])) {
            digitsSeen++;
        }
    }
    // If we are at the end, ensure we stay at the end (handling edge cases like appending)
    // But the loop handles it: if digitsSeen < digitsBeforeCursor (e.g. appended), we go to end.
    
    cursorRef.current = newCursorPos;
  };

  useEffect(() => {
    if (inputRef.current && cursorRef.current !== null) {
      inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
      cursorRef.current = null;
    }
  }, [displayValue]);

  return (
    <Input
      ref={inputRef}
      value={displayValue}
      onChange={handleChange}
      className={className}
      {...props}
    />
  );
};
