'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { MatIcon } from '@/components/ui/mat-icon'
import type { UploadedDocument } from '@/lib/types'

function formatFileSize(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
}

function formatUploadTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000
  if (diff < 2) return 'Uploaded just now'
  if (diff < 60) return `Uploaded ${Math.round(diff)} mins ago`
  return `Uploaded ${Math.round(diff / 60)} hrs ago`
}

function categoryIcon(doc: UploadedDocument) {
  const map: Record<string, string> = {
    medical: 'receipt_long',
    education: 'school',
    income: 'description',
    lifestyle: 'devices',
    other: 'attachment',
  }
  return map[doc.category ?? 'other'] ?? 'attachment'
}

function StatusBadge({ status }: { status: UploadedDocument['status'] }) {
  if (status === 'processed')
    return (
      <span className="rounded-full bg-tertiary-container px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-tertiary-container">
        Processed
      </span>
    )
  if (status === 'processing')
    return (
      <span className="flex items-center gap-1 rounded-full bg-primary-fixed/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-primary-fixed-variant">
        <MatIcon name="sync" className="text-xs animate-spin" />
        Extracting
      </span>
    )
  if (status === 'uploading')
    return (
      <span className="rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
        Uploading
      </span>
    )
  return (
    <span className="rounded-full bg-error-container px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-error-container">
      Error
    </span>
  )
}

interface Props {
  initialDocs: UploadedDocument[]
}

export function UploadDropZone({ initialDocs }: Props) {
  const [docs, setDocs] = useState<UploadedDocument[]>(initialDocs)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach((file) => {
      const newDoc: UploadedDocument = {
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        uploadedAt: new Date().toISOString(),
        status: 'uploading',
        category: null,
      }
      setDocs((prev) => [newDoc, ...prev])
      setTimeout(() => {
        setDocs((prev) =>
          prev.map((d) =>
            d.id === newDoc.id
              ? { ...d, status: 'processed', category: 'other' }
              : d
          )
        )
      }, 2000)
    })
  }

  return (
    <>
      {/* Drop zone */}
      <div
        className={cn(
          'flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl ghost-border bg-surface-container-lowest p-12 text-center transition-all duration-300',
          isDragOver
            ? 'border-secondary bg-surface-container-low shadow-[0_0_0_4px_var(--color-surface-container)/30]'
            : 'hover:bg-surface'
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => fileInput.current?.click()}
      >
        <input
          ref={fileInput}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low">
          <MatIcon name="cloud_upload" className="text-4xl text-secondary" />
        </div>
        <h3 className="mb-2 text-base font-semibold text-secondary">
          Drag and drop documents here
        </h3>
        <p className="mb-6 text-sm text-on-surface-variant">
          Support for PDF, JPEG, and PNG. Maximum file size 50 MB.
        </p>
        <button
          className="rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground hover:opacity-90 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            fileInput.current?.click()
          }}
        >
          Browse Local Files
        </button>
      </div>

      {/* Recent uploads */}
      <div className="rounded-xl bg-surface-container-low p-7">
        <h3 className="mb-5 text-base font-semibold text-on-surface">
          Recent Uploads
        </h3>
        <div className="flex flex-col gap-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-5 transition-all hover:ambient-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest">
                  <MatIcon
                    name={categoryIcon(doc)}
                    className="text-xl text-secondary"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {doc.name}
                  </p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    {formatUploadTime(doc.uploadedAt)} ·{' '}
                    {formatFileSize(doc.sizeKb)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={doc.status} />
                <button className="text-outline hover:text-secondary transition-colors">
                  <MatIcon name="more_vert" className="text-xl" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
