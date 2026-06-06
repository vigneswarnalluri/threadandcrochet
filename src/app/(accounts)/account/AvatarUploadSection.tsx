'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { ImageAdd02Icon, Tick02Icon, Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface Props {
  currentAvatarUrl: string | null
  fallbackAvatarSrc: string
}

// Submit button that shows loading state via useFormStatus — export for use anywhere in the form
export function SubmitButton({ label = 'Update account' }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
    >
      {pending ? (
        <>
          <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" color="currentColor" />
          Saving…
        </>
      ) : (
        label
      )}
    </button>
  )
}

export default function AvatarUploadSection({ currentAvatarUrl, fallbackAvatarSrc }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate: image only, max 5 MB
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB.')
      return
    }

    setFileName(file.name)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const displaySrc = preview || currentAvatarUrl || fallbackAvatarSrc

  return (
    <>
      {/* Avatar circle with click-to-change */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative size-32 cursor-pointer overflow-hidden rounded-full ring-2 ring-offset-2 ring-neutral-200 dark:ring-neutral-700"
          onClick={() => inputRef.current?.click()}
          title="Click to change photo"
        >
          <Image
            src={displaySrc}
            alt="Profile photo"
            fill
            sizes="132px"
            className="object-cover"
            unoptimized={!!preview || !!currentAvatarUrl}
          />
          {/* Dark overlay on hover */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 transition-all hover:bg-black/50 text-transparent hover:text-white">
            <HugeiconsIcon icon={ImageAdd02Icon} size={28} color="currentColor" strokeWidth={1.5} />
            <span className="mt-1 text-xs font-medium">Change</span>
          </div>
        </div>

        {/* File name badge */}
        {fileName ? (
          <div className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            <HugeiconsIcon icon={Tick02Icon} size={12} color="currentColor" />
            {fileName}
          </div>
        ) : (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Click to change photo</p>
        )}

        {/* Hidden file input — name="avatar" so the server action picks it up */}
        <input
          ref={inputRef}
          type="file"
          name="avatar"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </>
  )
}
