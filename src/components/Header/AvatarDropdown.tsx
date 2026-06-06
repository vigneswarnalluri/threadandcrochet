'use client'

import Avatar from '@/shared/Avatar/Avatar'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { UserCircle02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useStore } from '@/context/StoreContext'
import { Divider } from '../Divider'

interface Props {
  className?: string
}

interface Profile {
  fullName: string
  address: string
  email: string
  avatarUrl: string | null
}

export default function AvatarDropdown({ className }: Props) {
  const { user } = useStore()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      sessionStorage.removeItem('__tl_profile')
      setLoading(false)
      return
    }

    // If the page just had a profile update, clear the cache to force a re-fetch
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('updated') === '1') {
      sessionStorage.removeItem('__tl_profile')
    }

    // Check sessionStorage first, validating against the active user's email
    const cached = sessionStorage.getItem('__tl_profile')
    if (cached) {
      try {
        const data = JSON.parse(cached)
        if (data.email === user.email) {
          setProfile(data)
          setLoading(false)
          return
        }
      } catch {
        sessionStorage.removeItem('__tl_profile')
      }
    }

    fetch('/api/profile')
      .then((res) => {
        if (!res.ok) return null
        return res.json()
      })
      .then((data) => {
        if (data && data.fullName) {
          const p: Profile = {
            fullName: data.fullName,
            address: data.address || '',
            email: data.email || '',
            avatarUrl: data.avatarUrl || null,
          }
          setProfile(p)
          // Cache for this session so navigating pages doesn't re-fetch
          sessionStorage.setItem('__tl_profile', JSON.stringify(p))
        } else {
          setProfile(null)
        }
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [user])

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    sessionStorage.removeItem('__tl_profile') // Clear cache on logout
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = '/'
  }

  // Show nothing while checking auth (prevents flash)
  if (loading) {
    return (
      <div className={className}>
        <div className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 opacity-40">
          <HugeiconsIcon icon={UserCircle02Icon} size={24} color="currentColor" strokeWidth={1.5} />
        </div>
      </div>
    )
  }

  // NOT logged in — show simple Sign In link
  if (!profile) {
    return (
      <div className={className}>
        <Link
          href="/login"
          className="-m-2.5 flex cursor-pointer items-center gap-1.5 rounded-full p-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <HugeiconsIcon icon={UserCircle02Icon} size={24} color="currentColor" strokeWidth={1.5} />
          <span className="hidden sm:inline">Sign In</span>
        </Link>
      </div>
    )
  }

  // LOGGED IN — show avatar dropdown
  return (
    <div className={className}>
      <Popover>
        <PopoverButton className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-hidden dark:hover:bg-neutral-800">
          {profile.avatarUrl ? (
            <Avatar imgUrl={profile.avatarUrl} userName={profile.fullName} sizeClass="size-7" containerClassName="" />
          ) : (
            <HugeiconsIcon icon={UserCircle02Icon} size={24} color="currentColor" strokeWidth={1.5} />
          )}
        </PopoverButton>

        <PopoverPanel
          transition
          anchor="bottom end"
          className="z-10 mt-3 w-80 rounded-3xl px-4 shadow-lg ring-1 ring-black/5 transition duration-200 ease-in-out data-closed:translate-y-1 data-closed:opacity-0 sm:px-0"
        >
          <div className="relative grid grid-cols-1 gap-6 bg-white px-6 py-7 dark:bg-neutral-800">
            <div className="flex items-center space-x-3">
              <Avatar imgUrl={profile.avatarUrl || undefined} userName={profile.fullName} sizeClass="size-12" />
              <div className="grow">
                <h4 className="font-semibold">{profile.fullName}</h4>
                <p className="mt-0.5 text-xs text-neutral-500">{profile.email || profile.address}</p>
              </div>
            </div>

            <Divider />

            {/* My Account */}
            <Link
              href="/account"
              className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700"
            >
              <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.1601 10.87C12.0601 10.86 11.9401 10.86 11.8301 10.87C9.45006 10.79 7.56006 8.84 7.56006 6.44C7.56006 3.99 9.54006 2 12.0001 2C14.4501 2 16.4401 3.99 16.4401 6.44C16.4301 8.84 14.5401 10.79 12.1601 10.87Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7.15997 14.56C4.73997 16.18 4.73997 18.82 7.15997 20.43C9.90997 22.27 14.42 22.27 17.17 20.43C19.59 18.81 19.59 16.17 17.17 14.56C14.43 12.73 9.91997 12.73 7.15997 14.56Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">My Account</p>
              </div>
            </Link>

            {/* My Orders */}
            <Link
              href="/orders"
              className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700"
            >
              <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 12.2H15" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 16.2H12.38" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 6H14C16 6 16 5 16 4C16 2 15 2 14 2H10C9 2 8 2 8 4C8 6 9 6 10 6Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 4.02002C19.33 4.20002 21 5.43002 21 10V16C21 20 20 22 15 22H9C4 22 3 20 3 16V10C3 5.44002 4.67 4.20002 8 4.02002" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">My Orders</p>
              </div>
            </Link>

            {/* Wishlist */}
            <Link
              href="/account-wishlists"
              className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700"
            >
              <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">Wishlist</p>
              </div>
            </Link>

            <Divider />

            {/* Log Out */}
            <Link
              href="/"
              onClick={handleLogout}
              className="-m-3 flex items-center rounded-lg p-2 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-orange-500/50 dark:hover:bg-neutral-700"
            >
              <div className="flex shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 12H3.62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.85 8.6499L2.5 11.9999L5.85 15.3499" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">Log out</p>
              </div>
            </Link>
          </div>
        </PopoverPanel>
      </Popover>
    </div>
  )
}
