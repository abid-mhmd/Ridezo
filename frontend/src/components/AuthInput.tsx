import type { InputHTMLAttributes, ReactNode } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: ReactNode;
}

function AuthInput({ label, error, id, rightElement, ...inputProps }: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-gray-300">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          {...inputProps}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-ridezo-bg px-3.5 py-2.5 text-xs text-gray-100 outline-none transition placeholder:text-gray-600 focus:border-ridezo-primary ${
            rightElement ? 'pr-10' : ''
          } ${error ? 'border-red-500' : 'border-ridezo-border'}`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default AuthInput;