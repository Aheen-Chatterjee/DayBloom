export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function AutoSaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null

  return (
    <span className={`text-xs ${
      status === 'saving' ? 'text-[#A08B6E]' :
      status === 'saved' ? 'text-[#6B8E6B]' :
      'text-[#C4706A]'
    }`}>
      {status === 'saving' && '(˘▾˘) Saving...'}
      {status === 'saved' && '✿ Saved'}
      {status === 'error' && '× Save failed'}
    </span>
  )
}
