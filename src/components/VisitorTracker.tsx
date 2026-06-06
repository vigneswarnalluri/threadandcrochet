'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useStore } from '@/context/StoreContext'

export default function VisitorTracker() {
  const pathname = usePathname()
  const { user, cart } = useStore()

  useEffect(() => {
    // Do not track admin portal or API page visits
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      return
    }

    // Get or initialize tab-session ID
    let sessionId = sessionStorage.getItem('storefront_session_id')
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem('storefront_session_id', sessionId)
    }

    const cartItemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
    const userEmail = user?.email || null

    const sendPing = async () => {
      try {
        await fetch('/api/visitor/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            userEmail,
            currentPage: pathname,
            cartItemsCount
          })
        })
      } catch (err) {
        console.warn('Failed to send visitor ping:', err)
      }
    }

    // Send immediate ping on load/route change
    sendPing()

    // Send periodic pings every 15 seconds
    const interval = setInterval(sendPing, 15000)

    return () => {
      clearInterval(interval)
    }
  }, [pathname, user, cart])

  return null
}
