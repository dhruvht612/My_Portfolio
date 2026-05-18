import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ImagePlus, Trash2, Upload } from 'lucide-react'
import { isSupabaseConfigured } from '../../../lib/supabase'
import { uploadToBucket } from '../../../lib/admin/storage'

export default function EducationLogoUpload({ value, onChange, onError, disabled }) {
  const inputRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)
  const configured = isSupabaseConfigured

  const onFile = async (file) => {
    if (!file || !configured) return
    if (file.size > 8 * 1024 * 1024) {
      onError?.('File must be under 8MB')
      return
    }
    setBusy(true)
    setProgress(0)
    try {
      const { publicUrl } = await uploadToBucket('logos', file, { onProgress: setProgress })
      onChange?.(publicUrl)
    } catch (e) {
      onError?.(e.message || 'Upload failed')
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  return (
    <div
      className={`edu-upload-zone group relative ${drag ? 'edu-upload-drag' : ''} ${disabled || !configured ? 'opacity-50' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDrag(false)
        if (disabled || !configured) return
        const f = e.dataTransfer.files?.[0]
        if (f) onFile(f)
      }}
      onClick={() => !disabled && configured && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled || !configured}
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) onFile(f)
        }}
      />
      <div className="edu-upload-glow pointer-events-none" />
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-[1] flex flex-col items-center gap-3 py-4"
          >
            <div className="edu-logo-depth relative">
              <img src={value} alt="" className="h-24 w-24 rounded-2xl border border-white/15 object-contain bg-white p-2 shadow-2xl" />
            </div>
            <button
              type="button"
              disabled={disabled || !configured}
              onClick={(e) => {
                e.stopPropagation()
                onChange?.('')
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-red-500/35 px-2.5 py-1 text-xs text-red-200 hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-[1] flex flex-col items-center gap-2 py-6"
          >
            <ImagePlus className="h-9 w-9 text-slate-500 transition-colors group-hover:text-sky-400/80" />
            <span className="inline-flex items-center gap-2 text-xs text-slate-400">
              <Upload className="h-4 w-4" />
              Drop institution logo or click
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {busy ? (
        <div className="absolute bottom-3 left-3 right-3 z-[2]">
          <motion.div className="h-1 overflow-hidden rounded-full bg-slate-800/80">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-500 to-violet-400"
              animate={{ width: `${Math.max(progress, 12)}%` }}
            />
          </motion.div>
        </div>
      ) : null}
    </div>
  )
}
