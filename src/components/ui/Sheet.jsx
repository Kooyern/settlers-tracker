import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export function Sheet({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="sheet-handle sm:hidden" />
        <div className="sheet-header">
          <h2 className="text-base font-semibold text-text-primary truncate">{title}</h2>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Lukk">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="sheet-body">
          {children}
        </div>
        {footer && (
          <div className="border-t border-border px-[var(--gutter)] py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
