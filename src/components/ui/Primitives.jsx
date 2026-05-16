import React from 'react'

export function Card({ children, className = '', as = 'div', ...rest }) {
  const Tag = as
  return (
    <Tag className={`card p-4 ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function Panel({ children, className = '', as = 'div', ...rest }) {
  const Tag = as
  return (
    <Tag className={`card-flat p-3 ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function SectionLabel({ icon: Icon, children, action }) {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
        {Icon && <Icon className="h-3.5 w-3.5 text-accent" />}
        {children}
      </h2>
      {action}
    </div>
  )
}

export function StatTile({ label, value, sublabel, accent = false }) {
  return (
    <div className={`card-flat px-3 py-3 text-left ${accent ? 'border-accent/30' : ''}`}>
      <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className={`number-display mt-1 text-xl font-bold leading-none ${accent ? 'text-accent' : 'text-text-primary'}`}>
        {value}
      </p>
      {sublabel && (
        <p className="mt-1 truncate text-[11px] text-text-muted">{sublabel}</p>
      )}
    </div>
  )
}

export function PlayerAvatar({ player, size = 'md', winner = false }) {
  const sizeClass = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-16 w-16 text-lg',
  }[size]
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-md ${sizeClass} ${winner ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg-card' : ''}`}
      style={{ backgroundColor: player?.color || '#525252' }}
    >
      {player?.name?.charAt(0) || '?'}
    </div>
  )
}

export function PlayerDot({ player, size = 10 }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, backgroundColor: player?.color || '#525252' }}
    />
  )
}

export function Loader({ label = 'Laster…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-light border-t-accent" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-10 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-bg-soft">
          <Icon className="h-6 w-6 text-text-muted" />
        </div>
      )}
      <p className="text-base font-semibold text-text-primary">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-text-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
