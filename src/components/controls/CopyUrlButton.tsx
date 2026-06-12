import { useEffect, useRef, useState } from 'react'
import { shareableUrl } from '../../services/url-state/urlStateSource'
import { COPY_FEEDBACK_MS } from '../../config'
import type { MapState } from '../../domain/MapState'

interface CopyUrlButtonProps {
  mapState: MapState
}

export default function CopyUrlButton({ mapState }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleCopy() {
    await navigator.clipboard.writeText(shareableUrl(mapState))
    setCopied(true)
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{ width: '100%', padding: '8px', cursor: 'pointer' }}
    >
      {copied ? 'Copied' : 'Copy link'}
    </button>
  )
}
