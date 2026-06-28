import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

// forwardRef lets React Hook Form control this input directly
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium tracking-wide text-(--text-secondary) uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full rounded-xl px-3 py-2.5 text-sm',
            'bg-white dark:bg-(--surface-card)',
            'border text-(--text-primary)',
            'placeholder:text-(--text-muted)',
            'transition-all duration-150 outline-none',
            'focus:ring-2 focus:ring-(--accent) focus:ring-offset-0',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-stone-200 focus:border-(--accent) dark:border-stone-700',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-(--text-muted)">{hint}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
