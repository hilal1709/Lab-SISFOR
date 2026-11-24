'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { useRef, type ReactNode } from 'react'
import { Toaster } from 'sonner'
import { statusText, type BookingStatus } from '@/lib/booking'
import { Button } from './button'
import { Icon } from './icon'

export function ToastHost() {
  return <Toaster position="top-right" toastOptions={{ className: 'lab-toast', duration: 3600 }} />
}
export function Banner({ children, retry }: { children: ReactNode; retry?: () => void }) {
  return (
    <div className="banner" role="alert">
      <Icon name="notice" />
      <span>{children}</span>
      {retry && (
        <Button variant="outline" size="sm" onClick={retry}>
          Coba lagi
        </Button>
      )}
    </div>
  )
}
export function Badge({ status }: { status: BookingStatus }) {
  return (
    <span className={'badge ' + status}>
      <Icon
        size={16}
        name={status === 'approved' ? 'check' : status === 'pending' ? 'clock' : 'close'}
        animate={status === 'approved'}
      />
      {statusText[status]}
    </span>
  )
}
export function Modal({
  open,
  close,
  title,
  description,
  children,
  busy = false,
}: {
  open: boolean
  close: () => void
  title: string
  description: string
  children: ReactNode
  busy?: boolean
}) {
  const returnTo = useRef<HTMLElement | null>(null)
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value && !busy) close()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content
          className="modal"
          onOpenAutoFocus={() => {
            returnTo.current = document.activeElement as HTMLElement
          }}
          onCloseAutoFocus={(event) => {
            if (returnTo.current?.isConnected) {
              event.preventDefault()
              returnTo.current.focus()
            } else {
              event.preventDefault()
              document.getElementById('desk-heading')?.focus()
            }
          }}
        >
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
