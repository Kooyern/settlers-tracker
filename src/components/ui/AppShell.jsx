import React from 'react'

export function AppShell({ children }) {
  return <div className="app-shell">{children}</div>
}

export function ScreenMain({ children }) {
  return <main className="app-main">{children}</main>
}

export function Screen({ title, children, action }) {
  return (
    <section className="space-y-4">
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 pt-1 pb-1">
          {title && (
            <h1 className="text-xl font-semibold tracking-tight text-text-primary truncate">
              {title}
            </h1>
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
