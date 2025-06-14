
'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface PasswordStrengthMeterProps {
  password?: string;
}

const STRENGTH_LEVELS = [
  { label: 'Too Short', color: 'bg-destructive', widthClass: 'w-[0%]' }, // Initially hidden or 0 width for too short
  { label: 'Weak', color: 'bg-destructive', widthClass: 'w-[25%]' },
  { label: 'Fair', color: 'bg-yellow-500', widthClass: 'w-[50%]' },
  { label: 'Good', color: 'bg-green-500', widthClass: 'w-[75%]' },
  { label: 'Strong', color: 'bg-green-700', widthClass: 'w-[100%]' },
];

export default function PasswordStrengthMeter({ password = '' }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(0); // 0: Too Short, 1: Weak, 2: Fair, 3: Good, 4: Strong

  useEffect(() => {
    let score = 0;
    if (!password || password.length < 8) {
      score = 0; // Too short
    } else {
      score = 1; // Base score for meeting length requirement (Weak)
      if (/[a-z]/.test(password)) score++; // has lowercase
      if (/[A-Z]/.test(password)) score++; // has uppercase
      if (/[0-9]/.test(password)) score++; // has number
      if (/[^a-zA-Z0-9]/.test(password)) score++; // has special character
      
      // Adjust score to fit levels (min 1 for weak, max 4 for strong)
      if (password.length >= 8 && score <= 2) score = 1; // Still Weak if only 1 or 2 criteria met + length
      else if (password.length >= 8 && score === 3) score = 2; // Fair
      else if (password.length >= 8 && score === 4) score = 3; // Good
      else if (password.length >= 8 && score >= 5) score = 4; // Strong
    }
    setStrength(score);
  }, [password]);

  const currentLevel = STRENGTH_LEVELS[strength];
  const barWidthClass = password.length === 0 ? 'w-[0%]' : currentLevel.widthClass;

  return (
    <div className="space-y-1">
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-in-out',
            barWidthClass,
            currentLevel.color
          )}
        />
      </div>
      <p className={cn("text-xs", 
        strength === 0 && password.length > 0 ? 'text-destructive' : 'text-muted-foreground',
        strength === 1 ? 'text-destructive' : '',
        strength === 2 ? 'text-yellow-500' : '',
        strength === 3 ? 'text-green-500' : '',
        strength === 4 ? 'text-green-700' : ''
      )}>
        {password.length > 0 ? `Strength: ${currentLevel.label}` : 'Enter a password'}
      </p>
    </div>
  );
}
