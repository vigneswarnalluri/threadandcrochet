'use client'

import React from 'react'
import { useStore } from '@/context/StoreContext'

interface Props {
  className?: string
  liked?: boolean // kept for backwards compatibility / defaults
  productHandle?: string
}

const LikeButton: React.FC<Props> = ({ className = '', liked = false, productHandle }) => {
  const { isLiked, toggleWishlist } = useStore()

  const activeLiked = productHandle ? isLiked(productHandle) : liked

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (productHandle) {
      toggleWishlist(productHandle)
    }
  }

  return (
    <button
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 nc-shadow-lg dark:bg-neutral-900 dark:text-neutral-200 ${className}`}
      onClick={handleLikeClick}
      type="button"
      aria-label="Toggle wishlist"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path
          d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z"
          stroke={activeLiked ? '#ef4444' : 'currentColor'}
          fill={activeLiked ? '#ef4444' : 'none'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default LikeButton
