'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function AccountSuccessToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const hasShown = useRef(false)

  useEffect(() => {
    if (searchParams.get('updated') !== '1') return
    if (hasShown.current) return
    hasShown.current = true

    toast.custom(
      (t) => (
        <div
          className={`flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-lg ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10 transition-all ${
            t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <HugeiconsIcon icon={Tick02Icon} size={18} color="#16a34a" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Profile updated!</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Your account details have been saved.</p>
          </div>
        </div>
      ),
      { duration: 4000 }
    )

    // Clean the URL so the toast doesn't re-show on refresh
    const params = new URLSearchParams(searchParams.toString())
    params.delete('updated')
    const newUrl = params.toString() ? `${pathname}?${params}` : pathname
    router.replace(newUrl, { scroll: false })
  }, [searchParams, router, pathname])

  return null
}
