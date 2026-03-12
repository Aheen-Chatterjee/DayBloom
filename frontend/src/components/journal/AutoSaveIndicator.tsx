import { Loader2, Check, AlertCircle } from 'lucide-react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function AutoSaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === 'saving' && <><Loader2 size={11} className="animate-spin text-[#7A7169]" /><span className="text-[#7A7169]">Saving...</span></>}
      {status === 'saved' && <><Check size={11} className="text-[#4E7D5E]" /><span className="text-[#4E7D5E]">Saved</span></>}
      {status === 'error' && <><AlertCircle size={11} className="text-[#B5534D]" /><span className="text-[#B5534D]">Save failed</span></>}
    </div>
  )
}
