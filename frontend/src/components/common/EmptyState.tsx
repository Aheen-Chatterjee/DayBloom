interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="mb-4 opacity-30">{icon}</div>}
      <h3 className="mb-2 text-[#1A1A1A]" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', fontWeight: 600 }}>
        {title}
      </h3>
      {description && <p className="text-sm text-[#7A7169] mb-6 max-w-xs leading-relaxed">{description}</p>}
      {action}
    </div>
  )
}
