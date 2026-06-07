'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import PageLoader from './PageLoader'

const PageTransitionContent: React.FC = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState(false)
  const [lastPathname, setLastPathname] = useState(pathname)
  const [lastSearch, setLastSearch] = useState(searchParams.toString())

  // Hide loader when path or search query changes
  useEffect(() => {
    const currentSearch = searchParams.toString()
    if (pathname !== lastPathname || currentSearch !== lastSearch) {
      setLastPathname(pathname)
      setLastSearch(currentSearch)
      setIsLoading(false)
    }
  }, [pathname, searchParams, lastPathname, lastSearch])

  // Intercept navigation triggers to display loader
  useEffect(() => {
    const handleNavigationStart = (targetHref: string) => {
      try {
        const url = new URL(targetHref, window.location.origin)
        const currentUrl = new URL(window.location.href)

        // Only load if destination is internal and target URL is different
        if (
          url.origin === currentUrl.origin &&
          (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) &&
          !targetHref.startsWith('#') &&
          !url.hash
        ) {
          setTimeout(() => {
            setIsLoading(true)
          }, 0)
        }
      } catch (err) {
        // Safe fallback
      }
    }

    // 1. Capture user anchor click events
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (anchor) {
        const href = anchor.getAttribute('href')
        const targetAttr = anchor.getAttribute('target')

        // Only capture simple client-side link clicks
        if (
          href &&
          href.startsWith('/') &&
          !href.startsWith('/#') &&
          (!targetAttr || targetAttr === '_self') &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey
        ) {
          handleNavigationStart(href)
        }
      }
    }

    // 2. Intercept programmatic navigation (Router.push)
    const originalPushState = window.history.pushState
    window.history.pushState = function (...args) {
      const url = args[2] ? String(args[2]) : ''
      if (url) {
        handleNavigationStart(url)
      }
      return originalPushState.apply(this, args)
    }

    document.addEventListener('click', handleAnchorClick)

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      window.history.pushState = originalPushState
    }
  }, [])

  return <PageLoader isVisible={isLoading} />
}

const PageTransition: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <PageTransitionContent />
    </Suspense>
  )
}

export default PageTransition
