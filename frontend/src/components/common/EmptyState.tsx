interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = '(◕‿◕)', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-serif text-xl font-bold text-[#8B7355] mb-2">{title}</h3>
      {description && <p className="text-sm text-[#8B7A65] mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}
