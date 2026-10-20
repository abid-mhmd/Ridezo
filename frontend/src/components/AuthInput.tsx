import type { InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function AuthInput({ label, error, id, ...inputProps }: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        {label}
      </label>

      <input
        id={id}
        {...inputProps}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-xl border bg-ridezo-bg px-4 py-3 text-gray-100 outline-none transition placeholder:text-gray-600 focus:border-ridezo-primary ${
          error ? 'border-red-500' : 'border-ridezo-border'
        }`}
      />

      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default AuthInput;
