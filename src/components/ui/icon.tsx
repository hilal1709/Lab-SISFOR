type IconName =
  | 'arrow'
  | 'prev'
  | 'next'
  | 'calendar'
  | 'clock'
  | 'check'
  | 'close'
  | 'lock'
  | 'search'
  | 'form'
  | 'copy'
  | 'notice'
  | 'enter'
  | 'exit'
  | 'trash'
  | 'image'
  | 'refresh'
  | 'download'
  | 'send'
export function Icon({ name, size = 22, animate = false }: { name: IconName; size?: number; animate?: boolean }) {
  return (
    <svg className="potlab" data-icon={name} data-animate={animate || undefined} aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
      <use href={'/icons/potlab.svg#' + name} />
    </svg>
  )
}
