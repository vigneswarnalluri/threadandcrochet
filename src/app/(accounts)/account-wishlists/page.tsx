'use client'

import ProductCard from '@/components/ProductCard'
import type { TProductItem } from '@/data/data'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { useStore } from '@/context/StoreContext'
import { useEffect, useState } from 'react'

const Page = () => {
  const { wishlist, isLiked } = useStore()
  const [allProducts, setAllProducts] = useState<TProductItem[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const prodList = await res.json()
          setAllProducts(prodList)
        }
      } catch (err) {
        console.error('Error fetching products in wishlist page', err)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchAll()
  }, [])

  const likedProducts = allProducts.filter((product) => isLiked(product.handle))

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      <div>
        <h1 className="text-2xl font-semibold">Wishlists</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          Check out your wishlists. You can add or remove items from your wishlists.
        </p>
      </div>

      {loadingProducts ? (
        <div className="flex items-center justify-center py-20">
          <svg className="h-8 w-8 animate-spin text-neutral-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : likedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-3xl p-8 bg-neutral-50/50 dark:bg-neutral-800/10">
          <p className="text-neutral-500 dark:text-neutral-400">Your wishlist is currently empty.</p>
          <ButtonPrimary href="/collections/all" className="mt-6">
            Explore products
          </ButtonPrimary>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-x-8 lg:grid-cols-3">
          {likedProducts.map((product) => (
            <ProductCard key={product.id} data={product} isLiked={true} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Page
