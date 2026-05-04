import AdminModal from './AdminModal'

export default function ConfirmDialog({ open, title = 'Confirm', message, confirmLabel = 'Delete', cancelLabel = 'Cancel', danger, onConfirm, onClose }) {
  return (
    <AdminModal open={open} onClose={onClose} title={title} size="md">
      <p className="text-sm leading-relaxed text-slate-400">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="theme-btn theme-btn-secondary px-4 py-2 text-sm">
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm?.()
            onClose?.()
          }}
          className={`theme-btn px-4 py-2 text-sm ${danger ? 'bg-red-600 hover:bg-red-500 text-white border-red-500' : 'theme-btn-primary'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </AdminModal>
  )
}
