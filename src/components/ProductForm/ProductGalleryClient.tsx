'use client'

import clsx from 'clsx'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useProductColor } from './ProductColorContext'

/**
 * ProductGalleryClient
 *
 * Reads `selectedColor` from ProductColorContext and reorders `allImages`
 * so the chosen colour's featured image is shown first.
 * Clicking a thumbnail sets the main image.
 */
const ProductGalleryClient = ({ allImages }: { allImages: any[] }) => {
  const { selectedColor, colorImageMap } = useProductColor()

  // Filter images to show ONLY the selected colour's images
  const filteredImages = useMemo(() => {
    const matchedImages = allImages.filter((img) => {
      if (!img || typeof img === 'string') return false
      return img.color && img.color.toLowerCase() === selectedColor.toLowerCase()
    })

    if (matchedImages.length > 0) {
      return matchedImages.map((img) => (typeof img === 'string' ? img : img.src))
    }

    // Fallback: use all image sources and put the selected color's image at index 0
    const allSrcs = allImages.map((img) => (typeof img === 'string' ? img : img?.src)).filter(Boolean)
    const selectedImg = colorImageMap[selectedColor]
    if (!selectedImg || !allSrcs.includes(selectedImg)) return allSrcs
    return [selectedImg, ...allSrcs.filter((img) => img !== selectedImg)]
  }, [selectedColor, colorImageMap, allImages])

  const [mainImage, setMainImage] = useState<string>(filteredImages[0] ?? '')

  // Jump to the new primary image whenever the colour changes
  useEffect(() => {
    setMainImage(filteredImages[0] ?? '')
  }, [filteredImages])

  if (!allImages.length) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800"
        style={{ paddingBottom: '100%' }}
      >
        <Image
          key={mainImage}
          src={mainImage}
          alt={selectedColor}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 55vw"
          priority
        />
      </div>

      {/* Thumbnail strip */}
      {filteredImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filteredImages.slice(0, 8).map((img, idx) => (
            <button
              key={img + idx}
              type="button"
              onClick={() => setMainImage(img)}
              className={clsx(
                'relative size-16 flex-shrink-0 overflow-hidden rounded-lg ring-1 transition-all',
                mainImage === img
                  ? 'ring-2 ring-neutral-900 dark:ring-neutral-200'
                  : 'ring-neutral-200 dark:ring-neutral-700 hover:ring-neutral-400'
              )}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGalleryClient
