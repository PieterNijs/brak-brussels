import { useState } from 'react'
import { useClient, useEditState } from 'sanity'
import type { DocumentActionProps } from 'sanity'

type ImageField = {
  asset?: { _ref?: string }
}

export function DeleteWithImagesAction(props: DocumentActionProps) {
  const { id, type, onComplete } = props
  const { published, draft } = useEditState(id, type)
  const client = useClient({ apiVersion: '2024-01-01' })

  const [confirming, setConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const doc = published || draft

  // Collect all image asset IDs from the images array
  const assetIds: string[] = []
  if (doc?.images && Array.isArray(doc.images)) {
    for (const img of doc.images as ImageField[]) {
      if (img?.asset?._ref) {
        assetIds.push(img.asset._ref)
      }
    }
  }

  const n = assetIds.length

  return {
    label: 'Delete with images',
    tone: 'critical' as const,
    disabled: isDeleting || !doc,
    onHandle: () => setConfirming(true),
    dialog: confirming
      ? {
          type: 'confirm' as const,
          tone: 'critical' as const,
          message:
            n > 0
              ? `Permanently delete this product and its ${n} image${n === 1 ? '' : 's'}? This cannot be undone.`
              : 'Permanently delete this product? This cannot be undone.',
          onCancel: () => {
            setConfirming(false)
            onComplete()
          },
          onConfirm: async () => {
            setIsDeleting(true)
            setConfirming(false)
            try {
              // Delete the document (both published and draft) first so
              // references to the image assets are gone before we delete them.
              const docTx = client.transaction()
              docTx.delete(id)
              docTx.delete(`drafts.${id}`)
              await docTx.commit()

              // Now delete the image assets — no references remain.
              if (assetIds.length > 0) {
                const assetTx = client.transaction()
                for (const assetId of assetIds) {
                  assetTx.delete(assetId)
                }
                await assetTx.commit()
              }
            } catch (err) {
              console.error('Delete with images failed:', err)
            } finally {
              onComplete()
            }
          },
        }
      : undefined,
  }
}
