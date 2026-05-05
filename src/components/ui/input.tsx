import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-[0.25rem] border-border-width-standard border-black bg-white px-4 py-3 font-body-md text-body-md text-on-background shadow-none placeholder:text-outline focus-visible:outline-none focus-visible:bg-primary-container/20 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
