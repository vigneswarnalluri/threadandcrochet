'use client'

import AccordionInfo from '@/components/AccordionInfo'
import IconDiscount from '@/components/IconDiscount'
import LikeButton from '@/components/LikeButton'
import NcInputNumber from '@/components/NcInputNumber'
import Prices from '@/components/Prices'
import { TProductDetail, getProductDetailByHandle } from '@/data/data'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Link } from '@/shared/link'
import { ClockIcon, NoSymbolIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { FC, useEffect, useState, useMemo } from 'react'
import { Divider } from './Divider'
import ProductColorOptions from './ProductForm/ProductColorOptions'
import ProductForm from './ProductForm/ProductForm'
import ProductSizeOptions from './ProductForm/ProductSizeOptions'
import { useAside } from './aside'
import { ProductColorProvider, useProductColor } from './ProductForm/ProductColorContext'

interface ProductQuickViewProps {
  className?: string
}

const ProductQuickViewGallery = ({
  images,
  defaultImage,
}: {
  images: any[]
  defaultImage: any
}) => {
  const { selectedColor, colorImageMap } = useProductColor()

  const filteredImages = useMemo(() => {
    if (!images) return []
    const matches = images.filter(
      (img) => img?.color && img.color.toLowerCase() === selectedColor.toLowerCase()
    )
    if (matches.length > 0) return matches
    return images
  }, [images, selectedColor])

  // Find the image for the selected color
  const activeImageSrc = colorImageMap[selectedColor]

  // Use color image if found, otherwise default to first image
  const displayImage = activeImageSrc
    ? { src: activeImageSrc, alt: selectedColor }
    : (filteredImages[0] || defaultImage)

  const otherImages = useMemo(() => {
    return filteredImages.filter((img) => img?.src !== displayImage?.src).slice(0, 2)
  }, [filteredImages, displayImage])

  return (
    <>
      <div className="aspect-w-16 aspect-h-16 relative">
        {displayImage?.src && (
          <Image
            src={displayImage.src}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full rounded-xl object-cover"
            alt={displayImage.alt || 'product image'}
            priority
          />
        )}
      </div>
      <div className="mt-3 hidden grid-cols-2 gap-3 sm:mt-6 sm:gap-6 lg:grid xl:mt-5 xl:gap-5">
        {otherImages.map((image, index) => {
          if (!image?.src) {
            return null
          }
          return (
            <div key={index} className="aspect-w-3 aspect-h-4 relative">
              <Image
                fill
                src={image.src}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full rounded-xl object-cover"
                alt={image.alt || 'product thumbnail'}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}

const ProductQuickView: FC<ProductQuickViewProps> = ({ className }) => {
  const { productQuickViewHandle: handle } = useAside()

  const [product, setProduct] = useState<TProductDetail>()

  // Fetch product details by handle when the component mounts or when the handle changes
  useEffect(() => {
    if (!handle) {
      return
    }

    const fetchProduct = async () => {
      const response = await getProductDetailByHandle(handle)
      if (!response) {
        return
      }
      setProduct(response)
    }
    fetchProduct()
  }, [handle])

  if (!product) {
    return null
  }

  const { title, status, featuredImage, rating, reviewNumber, options, price, selectedOptions, images } = product
  const sizeSelected = selectedOptions?.find((option) => option.name === 'Size')?.value || ''
  const colorSelected = selectedOptions?.find((option) => option.name === 'Color')?.value || ''

  // Build colorName → image URL map for context
  const colorImageMap: Record<string, string> = {}
  options
    ?.find((o) => o.name === 'Color')
    ?.optionValues?.forEach((cv) => {
      if (cv.swatch?.image) colorImageMap[cv.name] = cv.swatch.image
    })

  const renderStatus = () => {
    if (!status) {
      return null
    }
    const CLASSES =
      'absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 nc-shadow-lg rounded-full flex items-center justify-center text-neutral-700 text-neutral-900 dark:text-neutral-300'
    if (status === 'New in') {
      return (
        <div className={CLASSES}>
          <SparklesIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === '50% Discount') {
      return (
        <div className={CLASSES}>
          <IconDiscount className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === 'Sold Out') {
      return (
        <div className={CLASSES}>
          <NoSymbolIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === 'limited edition') {
      return (
        <div className={CLASSES}>
          <ClockIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    return null
  }

  const renderSectionContent = () => {
    return (
      <div className="space-y-8">
        {/* ---------- 1 HEADING ----------  */}
        <div>
          <h2 className="text-3xl font-semibold">
            <Link href={`/products/${handle}`}>{title}</Link>
          </h2>

          <div className="mt-5 flex flex-wrap items-center justify-start gap-x-4 gap-y-1.5 sm:gap-x-5 rtl:justify-end">
            <Prices contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold" price={price || 1} />
            <div className="h-6 border-s border-neutral-300 dark:border-neutral-700"></div>
            <div className="flex items-center">
              <Link href={'/products/' + handle} className="flex items-center text-sm font-medium">
                <StarIcon className="h-5 w-5 pb-px text-yellow-400" />
                <div className="ms-1.5 flex">
                  <span>{rating}</span>
                  <span className="mx-2 block">·</span>
                  <span className="text-neutral-600 underline dark:text-neutral-400">{reviewNumber} reviews</span>
                </div>
              </Link>
              <span className="mx-2.5 hidden sm:block">·</span>
              <div className="hidden items-center text-sm sm:flex">
                <SparklesIcon className="h-3.5 w-3.5" />
                <span className="ms-1 leading-none">{status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- 3 VARIANTS AND SIZE LIST ----------  */}
        <ProductForm product={product}>
          <fieldset className="flex flex-col gap-y-10">
            {/* ---------- 3 VARIANTS AND SIZE LIST ----------  */}
            <div className="flex flex-col gap-y-8">
              <ProductColorOptions options={options || []} defaultColor={colorSelected} />
              <ProductSizeOptions options={options || []} defaultSize={sizeSelected} />
            </div>

            {/*  ---------- 4  QTY AND ADD TO CART BUTTON */}
            <div className="flex gap-x-3.5">
              <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
                <NcInputNumber name="quantity" defaultValue={1} />
              </div>

              <ButtonPrimary className="flex-1" type="submit">
                <HugeiconsIcon
                  icon={ShoppingBag03Icon}
                  size={20}
                  color="currentColor"
                  className="hidden sm:block"
                  strokeWidth={1.5}
                />
                <span className="text-base/6 font-normal sm:ml-2.5">Add to cart</span>
              </ButtonPrimary>
            </div>
          </fieldset>
        </ProductForm>

        <Divider />

        {/* ---------- 5 ----------  */}
        <AccordionInfo
          data={[
            {
              name: 'Description',
              content: product.description || 'No description available for this item.',
            },
            {
              name: 'Features',
              content: `<ul class="list-disc list-inside leading-7">
                ${(product.features || []).map((f: string) => `<li>${f}</li>`).join('')}
              </ul>`,
            },
            {
              name: 'Fabric + Care',
              content: product.careInstruction || 'Hand wash cold with like colors.',
            },
            {
              name: 'Shipping & Return',
              content: product.shippingAndReturn || 'We offer free shipping on all orders over $50.',
            },
          ]}
        />

        <div className="mt-6 flex text-sm text-neutral-500">
          <p className="text-xs">
            or{' '}
            <Link href={'/products/' + handle} className="text-xs font-medium text-neutral-900 uppercase">
              Go to product detail page <span aria-hidden="true"> →</span>
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <ProductColorProvider defaultColor={colorSelected} colorImageMap={colorImageMap}>
      <div className={className}>
        <div className="lg:flex">
          <div className="w-full lg:w-[50%]">
            <div className="relative">
              <ProductQuickViewGallery images={images || []} defaultImage={featuredImage} />
              {renderStatus()}
              <LikeButton productHandle={handle} className="absolute end-3 top-3" />
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="w-full pt-6 lg:w-[50%] lg:ps-7 lg:pt-0 xl:ps-8">{renderSectionContent()}</div>
        </div>
      </div>
    </ProductColorProvider>
  )
}

export default ProductQuickView
