import { Divider } from '@/components/Divider'
import Footer from '@/components/Footer'
import Header2 from '@/components/Header/Header2'
import AsideProductQuickView from '@/components/aside-product-quickview'
import AsideSidebarCart from '@/components/aside-sidebar-cart'
import AsideSidebarNavigation from '@/components/aside-sidebar-navigation'
import { createClient } from '@/utils/supabase/server'
import React from 'react'
import { redirect } from 'next/navigation'
import PageTab from './PageTab'

interface Props {
  children?: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch their profile
  let displayName = 'Guest'
  let displayEmail = ''
  let displayAddress = ''

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, address, role')
      .eq('id', user.id)
      .single()

    // Admins go straight to the admin dashboard — no customer account pages needed
    if (profile?.role === 'admin') {
      redirect('/admin')
    }

    displayName = profile?.full_name || user.email?.split('@')[0] || 'Guest'
    displayEmail = profile?.email || user.email || ''
    displayAddress = profile?.address || ''
  }

  return (
    <>
      <Header2 />
      <div className="container">
        <div className="mt-14 sm:mt-20">
          <div className="mx-auto max-w-4xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold xl:text-4xl">Account</h2>
              <span className="mt-4 block text-base text-neutral-500 sm:text-lg dark:text-neutral-400">
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">{displayName},</span>{' '}
                {displayEmail}
                {displayAddress && ` · ${displayAddress}`}
              </span>
            </div>

            <Divider className="mt-10" />
            <PageTab isLoggedIn={!!user} />
            <Divider />
          </div>
        </div>
        <div className="mx-auto max-w-4xl pt-14 pb-24 sm:pt-16 lg:pb-32">{children}</div>
      </div>
      <Footer />

      {/* ASIDES */}
      <AsideSidebarNavigation />
      <AsideSidebarCart />
      <AsideProductQuickView />
    </>
  )
}

export default Layout
