import { useRef, useState } from 'react'
import { ImagePlus, Trash2, Upload } from 'lucide-react'
import { isSupabaseConfigured } from '../../lib/supabase'
import { uploadToBucket } from '../../lib/admin/storage'

export default function ImageUploader({
  bucket,
  value,
  onChange,
  onUploadError,
  label = 'Image',
  accept = 'image/*',
  maxSizeMb = 8,
  disabled,
}) {
  const inputRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)

  const configured = isSupabaseConfigured

  const onFile = async (file) => {
    if (!file || !configured) return
    if (file.size > maxSizeMb * 1024 * 1024) {
      onUploadError?.(`File must be under ${maxSizeMb}MB`)
      return
    }
    setBusy(true)
    setProgress(0)
    try {
      const { publicUrl } = await uploadToBucket(bucket, file, {
        onProgress: setProgress,
      })
      onChange?.(publicUrl)
    } catch (e) {
      onUploadError?.(e.message || 'Upload failed')
    } finally {
      setBusy(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
      {!configured ? (
        <p className="text-xs text-amber-200/90">Configure Supabase to enable uploads.</p>
      ) : null}
      <div
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]/50 p-6 ${
          disabled || !configured ? 'opacity-50' : 'cursor-pointer hover:border-[var(--color-accent)]/50'
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
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
          accept={accept}
          className="hidden"
          disabled={disabled || !configured}
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) onFile(f)
          }}
        />
        {value && accept.startsWith('image') ? (
          <img src={value} alt="" className="max-h-40 rounded-lg border border-[var(--color-border)] object-contain" />
        ) : value && accept.includes('pdf') ? (
          <p className="text-sm text-[var(--color-text-muted)]">PDF linked</p>
        ) : (
          <ImagePlus className="h-10 w-10 text-[var(--color-text-muted)]" />
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Upload className="h-4 w-4" />
            Drop file or click to upload
          </span>
          {value ? (
            <button
              type="button"
              disabled={disabled || !configured}
              onClick={(e) => {
                e.stopPropagation()
                onChange?.('')
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          ) : null}
        </div>
        {busy ? (
          <div className="w-full max-w-xs">
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="h-full bg-[var(--color-accent)] transition-all"
                style={{ width: `${Math.max(progress, 15)}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
