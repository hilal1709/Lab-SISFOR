import * as React from 'react'
import { cn } from '@/lib/utils'

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { requiredIndicator?: boolean }
>(({ className, requiredIndicator, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'font-label-bold text-label-bold uppercase tracking-wider text-on-background',
      className
    )}
    {...props}
  >
    {children}
    {requiredIndicator ? <span className="text-error"> *</span> : null}
  </label>
))
Label.displayName = 'Label'

export { Label }
