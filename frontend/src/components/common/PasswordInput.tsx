import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  className = '',
  containerClassName = '',
  leftIcon,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`relative flex items-center w-full ${containerClassName}`}>
      {leftIcon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          {leftIcon}
        </div>
      )}
      <input
        {...props}
        type={showPassword ? 'text' : 'password'}
        className={`${className} ${leftIcon ? 'pl-10' : ''} pr-10`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPassword(prev => !prev);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer rounded-lg shrink-0 z-10"
        title={showPassword ? 'Hide password' : 'Show password'}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

export default PasswordInput;
