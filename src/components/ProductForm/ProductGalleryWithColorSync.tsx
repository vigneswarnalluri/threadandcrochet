'use client'

import { TProductItem } from '@/data/data'
import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * ProductGalleryWithColorSync
 *
 * A client component that renders:
 *  - A color swatch picker (like ProductColorOptions)
 *  - A live gallery that reorders images whenever a different color is selected
 *
 * When a color swatch is clicked, the image stored in swatch.image is moved to
 * position 0 of the gallery so it becomes the primary displayed photo.
 */

interface Props {
  /** All product options (Color, Size, …) */
  options: TProductItem['options']
  /** Default selected color name */
  defaultColor: string
  /** All gallery image URLs (merged from all variants) */
  allImages: string[]
}

const ProductGalleryWithColorSync = ({ options, defaultColor, allImages }: Props) => {
  const [colorSelected, setColorSelected] = useState(defaultColor)

  const colorOptionValues = options?.find((opt) => opt.name === 'Color')?.optionValues ?? []

  // Build a map: colorName -> swatch image URL
  const colorImageMap = useMemo(() => {
    const map: Record<string, string> = {}
    colorOptionValues.forEach((cv) => {
      if (cv.swatch?.image) {
        map[cv.name] = cv.swatch.image
      }
    })
    return map
  }, [colorOptionValues])

  // Reorder allImages so that the selected color's image is first
  const orderedImages = useMemo(() => {
    const selectedImg = colorImageMap[colorSelected]
    if (!selectedImg) return allImages
    const withoutSelected = allImages.filter((img) => img !== selectedImg)
    return [selectedImg, ...withoutSelected]
  }, [colorSelected, colorImageMap, allImages])

  // ── Gallery state ──────────────────────────────────────────────────────────
  const [mainImage, setMainImage] = useState<string>(orderedImages[0] ?? '')

  // When color changes → jump to the new primary image
  useEffect(() => {
    setMainImage(orderedImages[0] ?? '')
  }, [orderedImages])

  const handleColorChange = useCallback(
    (colorName: string) => {
      setColorSelected(colorName)
    },
    []
  )

  if (!allImages.length) return null

  return (
    <div className="flex flex-col gap-4">
      {/* ── Main image ────────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800"
        style={{ paddingBottom: '100%' }}
      >
        <Image
          key={mainImage}
          src={mainImage}
          alt={colorSelected}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 55vw"
          priority
        />
      </div>

      {/* ── Thumbnail strip ───────────────────────────────────────────────── */}
      {orderedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {orderedImages.slice(0, 8).map((img, idx) => (
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

      {/* ── Color swatches ────────────────────────────────────────────────── */}
      {colorOptionValues.length > 0 && (
        <Headless.Field>
          <Headless.RadioGroup
            value={colorSelected}
            name="color"
            onChange={handleColorChange}
            aria-label="Color"
          >
            <Headless.Label className="block text-sm font-medium rtl:text-right">Color</Headless.Label>
            <div className="mt-2.5 flex flex-wrap gap-x-2.5 gap-y-2">
              {colorOptionValues.map((value) => {
                const isActive = value.name === colorSelected
                return (
                  <Headless.Radio
                    key={value.name}
                    value={value.name}
                    as="div"
                    title={value.name}
                    className={clsx(
                      'relative size-9 cursor-pointer rounded-full transition-all',
                      isActive && 'ring-2 ring-offset-1 ring-neutral-900 dark:ring-neutral-300'
                    )}
                  >
                    <div
                      className="absolute inset-0.5 z-0 overflow-hidden rounded-full bg-cover ring-1 ring-neutral-900/10 dark:ring-white/15"
                      style={{
                        backgroundColor: value.swatch?.color ?? '#ebd9be',
                        backgroundImage: value.swatch?.image ? `url(${value.swatch.image})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  </Headless.Radio>
                )
              })}
            </div>
          </Headless.RadioGroup>
        </Headless.Field>
      )}
    </div>
  )
}

export default ProductGalleryWithColorSync
