import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium tracking-wide text-(--text-secondary) uppercase">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            'w-full rounded-xl px-3 py-2.5 text-sm',
            'bg-white dark:bg-(--surface-card)',
            'border text-(--text-primary)',
            'transition-all duration-150 outline-none',
            'focus:ring-2 focus:ring-(--accent)',
            error
              ? 'border-red-400'
              : 'border-stone-200 focus:border-(--accent) dark:border-stone-700',
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
export default Select
