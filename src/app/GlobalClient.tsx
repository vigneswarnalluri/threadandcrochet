'use client'

import { Toaster } from 'react-hot-toast'
import VisitorTracker from '@/components/VisitorTracker'

const GlobalClient = () => {
  return (
    <>
      <Toaster />
      <VisitorTracker />
    </>
  )
}

export default GlobalClient
