interface ThemeChipProps {
  theme: string
}

export function ThemeChip({ theme }: ThemeChipProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F0EDE4] text-[#5A5040] border border-[#E2DBD0]">
      {theme}
    </span>
  )
}
