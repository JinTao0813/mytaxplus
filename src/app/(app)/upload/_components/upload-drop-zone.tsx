'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MatIcon } from '@/components/ui/mat-icon'
import type {
  AiExtractionWithId,
  ReceiptMappingStatus,
  UploadedDocument,
} from '@/lib/types'
import {
  deleteDocument,
  getDocumentDocAiJson,
  getDocumentExtractions,
  getDocuments,
} from '@/lib/api'
import {
  ApiError,
  getTokenForApi,
  parseFastApiErrorDetail,
} from '@/lib/api/client'
import { useAuth } from '@/hooks/useAuth'
import {
  isFirebaseStorageReady,
  isFirebaseConfigured,
} from '@/lib/firebase/client'
import { uploadAndRegisterUserDocument } from '@/lib/firebase/upload-and-register-user-document'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type SelectedDocumentType = 'EA_FORM' | 'RECEIPT'

function describeRequestError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return 'Not signed in or session expired. Try signing in again.'
    }
    if (err.status === 403) {
      return 'You are not allowed to perform this action.'
    }
    if (err.status === 503) {
      const detail = parseFastApiErrorDetail(err.body)
      if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
        if (detail.code === 'FIRESTORE_DATABASE_MISSING') {
          const msg =
            typeof detail.message === 'string'
              ? detail.message
              : 'Create a Firestore database for this project, then retry.'
          const url =
            typeof detail.setupUrl === 'string' ? detail.setupUrl : ''
          return url ? `${msg} ${url}` : msg
        }
        if (typeof detail.message === 'string') return detail.message
      }
      if (typeof detail === 'string') return detail
      return 'Documents service is temporarily unavailable (e.g. database still starting). Retry in a minute.'
    }
    return err.message || `Request failed (${err.status}).`
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong.'
}

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

function receiptMappingChipLabel(
  summary: ReceiptMappingStatus | undefined
): string {
  if (!summary) return 'Mapping pending'
  switch (summary) {
    case 'in_progress':
      return 'Classifying'
    case 'suggested':
      return 'Suggested'
    case 'needs_review':
      return 'Needs review'
    case 'confirmed':
      return 'Confirmed'
    case 'gemini_error':
      return 'Needs review'
    case 'unmapped':
      return 'Unmapped'
    default:
      return 'Mapping'
  }
}

function MappingStatusChip({
  summary,
}: {
  summary: ReceiptMappingStatus | undefined
}) {
  const label = receiptMappingChipLabel(summary)
  const tone =
    summary === 'confirmed'
      ? 'bg-tertiary-container text-on-tertiary-container'
      : summary === 'gemini_error' || summary === 'needs_review'
        ? 'bg-error-container/80 text-on-error-container'
        : summary === 'suggested'
          ? 'bg-secondary/25 text-secondary'
          : summary === 'in_progress'
            ? 'bg-primary-fixed/20 text-on-primary-fixed-variant'
            : 'bg-surface-container-high text-on-surface-variant'
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
        tone
      )}
      title="Receipt → relief mapping status"
    >
      {label}
    </span>
  )
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
  /** Set when SSR could not load documents (e.g. API error while session cookie present). */
  initialLoadError?: string | null
}

export function UploadDropZone({
  initialDocs,
  initialLoadError = null,
}: Props) {
  const { user, loading: authLoading, devBypass } = useAuth()
  const [docs, setDocs] = useState<UploadedDocument[]>(initialDocs)
  const [dismissedInitialLoadError, setDismissedInitialLoadError] =
    useState(false)
  const [clientListError, setClientListError] = useState<string | null>(null)
  const [listRefreshError, setListRefreshError] = useState<string | null>(null)
  const [uploadFlowError, setUploadFlowError] = useState<string | null>(null)
  const [viewingDoc, setViewingDoc] = useState<UploadedDocument | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState<string | null>(null)
  const [viewRows, setViewRows] = useState<AiExtractionWithId[] | null>(null)
  const [confirmDeleteDoc, setConfirmDeleteDoc] =
    useState<UploadedDocument | null>(null)
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [rawJsonDoc, setRawJsonDoc] = useState<UploadedDocument | null>(null)
  const [rawJsonLoading, setRawJsonLoading] = useState(false)
  const [rawJsonError, setRawJsonError] = useState<string | null>(null)
  const [rawJsonPayload, setRawJsonPayload] = useState<Record<
    string,
    unknown
  > | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const [selectedType, setSelectedType] = useState<SelectedDocumentType | null>(
    null
  )
  const [typeError, setTypeError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || devBypass || !user) {
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        if (cancelled) return
        const token = await getTokenForApi(user)
        const list = await getDocuments({ token })
        if (!cancelled) {
          setDocs(list)
          setClientListError(null)
        }
      } catch (err) {
        console.error('getDocuments failed', err)
        if (!cancelled) {
          setClientListError(describeRequestError(err))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, devBypass])

  async function openRawJsonDialog(doc: UploadedDocument) {
    setRawJsonDoc(doc)
    setRawJsonLoading(true)
    setRawJsonError(null)
    setRawJsonPayload(null)
    try {
      const token = user ? await getTokenForApi(user) : undefined
      const data = await getDocumentDocAiJson({
        documentId: doc.id,
        ctx: { token },
      })
      setRawJsonPayload(data)
    } catch (err) {
      console.error('getDocumentDocAiJson failed', err)
      setRawJsonError(describeRequestError(err))
    } finally {
      setRawJsonLoading(false)
    }
  }

  async function openViewDialog(doc: UploadedDocument) {
    setViewingDoc(doc)
    setViewLoading(true)
    setViewError(null)
    setViewRows(null)
    try {
      const token = user ? await getTokenForApi(user) : undefined
      const rows = await getDocumentExtractions({
        documentId: doc.id,
        ctx: { token },
      })
      setViewRows(rows)
    } catch (err) {
      console.error('getDocumentExtractions failed', err)
      setViewError(describeRequestError(err))
    } finally {
      setViewLoading(false)
    }
  }

  async function processFile(file: File, documentType: SelectedDocumentType) {
    const id = crypto.randomUUID()
    const sizeKb = Math.max(1, Math.round(file.size / 1024))
    const newDoc: UploadedDocument = {
      id,
      name: file.name,
      sizeKb,
      uploadedAt: new Date().toISOString(),
      status: 'uploading',
      category: null,
    }
    setDocs((prev) => [newDoc, ...prev])
    setUploadFlowError(null)
    setListRefreshError(null)

    try {
      if (devBypass || !user) {
        throw new Error(
          'Sign in with Firebase (disable dev bypass) to upload with the real API.'
        )
      }
      if (!isFirebaseConfigured() || !isFirebaseStorageReady()) {
        throw new Error(
          'Firebase Storage is not configured. Set NEXT_PUBLIC_FIREBASE_* including STORAGE_BUCKET.'
        )
      }
      setDocs((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: 'processing' as const } : d
        )
      )

      const token = await getTokenForApi(user)
      const registered = await uploadAndRegisterUserDocument(user, {
        file,
        documentId: id,
        documentType,
        token,
      })
      setDocs((prev) => prev.map((d) => (d.id === id ? registered : d)))
      try {
        const list = await getDocuments({ token })
        setDocs(list)
        setListRefreshError(null)
      } catch (err) {
        console.error('getDocuments after upload failed', err)
        setListRefreshError(
          `Upload finished but the list could not be refreshed: ${describeRequestError(err)}`
        )
      }
    } catch (err) {
      console.error('processFile failed', err)
      setUploadFlowError(describeRequestError(err))
      setDocs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'error' as const } : d))
      )
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    if (!selectedType) {
      setTypeError('Select “EA Form” or “Receipt” before uploading.')
      return
    }
    setTypeError(null)
    Array.from(files).forEach((file) => {
      void processFile(file, selectedType)
    })
  }

  const showUploadBlockedHint = devBypass || !isFirebaseStorageReady()

  return (
    <>
      <Dialog
        open={Boolean(rawJsonDoc)}
        onOpenChange={(open) => {
          if (!open) {
            setRawJsonDoc(null)
            setRawJsonPayload(null)
            setRawJsonError(null)
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document AI JSON</DialogTitle>
            <DialogDescription>
              Normalized payload stored from Google Document AI (text, entities,
              kvPairs, pages) for {rawJsonDoc?.name ?? 'this file'}.
            </DialogDescription>
          </DialogHeader>

          {rawJsonLoading ? (
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-xs font-semibold text-on-surface-variant">
                Loading…
              </p>
            </div>
          ) : rawJsonError ? (
            <div className="rounded-xl bg-error-container p-4">
              <p className="text-sm font-semibold text-on-error-container">
                {rawJsonError}
              </p>
            </div>
          ) : rawJsonPayload ? (
            <pre className="max-h-[65vh] min-h-[120px] overflow-auto rounded-xl bg-surface-container-highest p-4 text-left text-xs leading-relaxed text-on-surface font-mono ghost-border">
              {JSON.stringify(rawJsonPayload, null, 2)}
            </pre>
          ) : null}

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewingDoc)}
        onOpenChange={(open) => {
          if (!open) setViewingDoc(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewingDoc?.name ?? 'Document'}</DialogTitle>
            <DialogDescription>
              Breakdown of extracted information from this PDF.
            </DialogDescription>
          </DialogHeader>

          {viewLoading ? (
            <div className="rounded-xl bg-surface-container-lowest p-4">
              <p className="text-xs font-semibold text-on-surface-variant">
                Loading…
              </p>
            </div>
          ) : viewError ? (
            <div className="rounded-xl bg-error-container p-4">
              <p className="text-sm font-semibold text-on-error-container">
                {viewError}
              </p>
            </div>
          ) : viewRows && viewRows.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No extraction rows found for this document yet.
            </p>
          ) : viewRows ? (
            <div className="flex max-h-[50vh] flex-col gap-3 overflow-auto pr-1">
              {viewRows.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl bg-surface-container-lowest p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-surface">
                        {r.label}
                      </p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {r.category} · {r.taxSection || '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-on-surface">
                        RM {Number.isFinite(r.amount) ? r.amount.toFixed(2) : '0.00'}
                      </p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Conf {Math.round((r.confidence ?? 0) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(confirmDeleteDoc)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDeleteDoc(null)
            setDeleteError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete document?</DialogTitle>
            <DialogDescription>
              This removes the stored file and its extracted rows.
            </DialogDescription>
          </DialogHeader>

          {deleteError ? (
            <div className="rounded-xl bg-error-container p-4">
              <p className="text-sm font-semibold text-on-error-container">
                {deleteError}
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              disabled={Boolean(deletingDocId)}
              onClick={() => {
                setConfirmDeleteDoc(null)
                setDeleteError(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={Boolean(deletingDocId) || !confirmDeleteDoc}
              onClick={async () => {
                const doc = confirmDeleteDoc
                if (!doc) return
                setDeletingDocId(doc.id)
                setDeleteError(null)
                try {
                  const token = user ? await getTokenForApi(user) : undefined
                  await deleteDocument({
                    documentId: doc.id,
                    auth: { token },
                  })
                  setDocs((prev) => prev.filter((d) => d.id !== doc.id))
                  setConfirmDeleteDoc(null)
                } catch (err) {
                  console.error('deleteDocument failed', err)
                  setDeleteError(describeRequestError(err))
                } finally {
                  setDeletingDocId(null)
                }
              }}
            >
              {deletingDocId ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showUploadBlockedHint ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Cannot upload</AlertTitle>
          <AlertDescription>
            {devBypass
              ? 'Turn off NEXT_PUBLIC_DEV_AUTH_BYPASS and sign in with Firebase.'
              : 'Configure Firebase web env vars including NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.'}
          </AlertDescription>
        </Alert>
      ) : null}

      {typeError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Document type required</AlertTitle>
          <AlertDescription>{typeError}</AlertDescription>
        </Alert>
      ) : null}

      {initialLoadError && !dismissedInitialLoadError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Could not load documents</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{initialLoadError}</span>
            <button
              type="button"
              className="self-start text-xs font-semibold underline text-on-error-container"
              onClick={() => setDismissedInitialLoadError(true)}
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      ) : null}

      {clientListError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Could not refresh document list</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{clientListError}</span>
            <button
              type="button"
              className="self-start text-xs font-semibold underline text-on-error-container"
              onClick={() => setClientListError(null)}
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      ) : null}

      {listRefreshError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>List refresh</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{listRefreshError}</span>
            <button
              type="button"
              className="self-start text-xs font-semibold underline text-on-error-container"
              onClick={() => setListRefreshError(null)}
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      ) : null}

      {uploadFlowError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Upload failed</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{uploadFlowError}</span>
            <button
              type="button"
              className="self-start text-xs font-semibold underline text-on-error-container"
              onClick={() => setUploadFlowError(null)}
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-4 rounded-xl bg-surface-container-low p-5">
        <h3 className="text-sm font-semibold text-on-surface">
          Document type
        </h3>
        <p className="mt-1 text-xs text-on-surface-variant">
          Choose the type for this batch. We’ll route processing based on your
          selection.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors ghost-border',
              selectedType === 'EA_FORM'
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-surface text-on-surface hover:bg-surface-container-high'
            )}
            onClick={() => {
              setSelectedType('EA_FORM')
              setTypeError(null)
            }}
          >
            EA Form
          </button>
          <button
            type="button"
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors ghost-border',
              selectedType === 'RECEIPT'
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-surface text-on-surface hover:bg-surface-container-high'
            )}
            onClick={() => {
              setSelectedType('RECEIPT')
              setTypeError(null)
            }}
          >
            Receipt
          </button>
        </div>
      </div>

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
          type="button"
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
          {!authLoading && !user && docs.length === 0 ? (
            <div className="rounded-xl bg-surface-container-lowest p-5">
              <p className="text-sm font-semibold text-on-surface">
                No uploads yet
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Sign in to view your uploaded documents.
              </p>
              <div className="mt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:opacity-90 transition-opacity"
                >
                  Sign in
                </Link>
              </div>
            </div>
          ) : null}
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
                  {doc.status === 'processed' ? (
                    <Link
                      href={`/upload/${doc.id}`}
                      className="text-sm font-semibold text-on-surface hover:underline"
                    >
                      {doc.name}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-on-surface">
                      {doc.name}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    {formatUploadTime(doc.uploadedAt)} ·{' '}
                    {formatFileSize(doc.sizeKb)}
                  </p>
                  {doc.status === 'error' && doc.processingError ? (
                    <p
                      className="mt-1 max-w-md text-xs text-on-error-container line-clamp-3"
                      title={doc.processingError}
                    >
                      {doc.processingError}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                <StatusBadge status={doc.status} />
                {doc.documentType === 'RECEIPT' && doc.status === 'processed' ? (
                  <MappingStatusChip summary={doc.mappingStatusSummary} />
                ) : null}
                {doc.status === 'processed' ? (
                  <Link
                    href={`/upload/${doc.id}`}
                    className="rounded-lg bg-surface-container-high px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors"
                  >
                    Review
                  </Link>
                ) : null}
                {doc.status === 'processed' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void openRawJsonDialog(doc)}
                  >
                    Raw JSON
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void openViewDialog(doc)}
                >
                  View
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deletingDocId === doc.id}
                  onClick={() => setConfirmDeleteDoc(doc)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
