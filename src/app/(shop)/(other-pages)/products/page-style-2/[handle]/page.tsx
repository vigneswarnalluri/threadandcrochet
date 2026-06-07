import AccordionInfo from '@/components/AccordionInfo'
import { Divider } from '@/components/Divider'
import LikeButton from '@/components/LikeButton'
import Prices from '@/components/Prices'
import NcInputNumber from '@/components/NcInputNumber'
import { ProductColorProvider } from '@/components/ProductForm/ProductColorContext'
import ProductColorOptions from '@/components/ProductForm/ProductColorOptions'
import ProductGalleryClient from '@/components/ProductForm/ProductGalleryClient'
import ProductForm from '@/components/ProductForm/ProductForm'
import ProductSizeOptions from '@/components/ProductForm/ProductSizeOptions'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import { getProductDetailByHandle, getProductReviews, getProducts } from '@/data/data'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { StarIcon } from '@heroicons/react/24/solid'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Policy from '../../Policy'
import ProductReviews from '../../ProductReviews'
import ProductStatus from '../../ProductStatus'

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductDetailByHandle(handle)
  const title = (product as any)?.metaTitle || product?.title || 'product detail'
  const description = (product as any)?.metaDescription || product?.description || 'product detail page'
  const keywordsStr = (product as any)?.metaKeywords || ''
  const keywords = keywordsStr ? keywordsStr.split(',').map((k: string) => k.trim()) : []
  const ogImage = (product as any)?.ogImage || product?.featuredImage?.src

  const meta: Metadata = {
    title,
    description,
  }

  if (keywords.length > 0) {
    meta.keywords = keywords
  }

  if (ogImage) {
    meta.openGraph = {
      images: [{ url: ogImage }]
    }
  }

  return meta
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const product = await getProductDetailByHandle(handle)
  const relatedProducts = (await getProducts()).slice(2, 8)
  const reviews = await getProductReviews(handle)

  if (!product.id) {
    return notFound()
  }

  const { title, status, featuredImage, options, price, selectedOptions, images } = product

  const actualReviewNumber = reviews.length
  const actualRating = actualReviewNumber > 0
    ? parseFloat((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / actualReviewNumber).toFixed(1))
    : 0
  const sizeSelected = selectedOptions?.find((option) => option.name === 'Size')?.value || ''
  const colorSelected = selectedOptions?.find((option) => option.name === 'Color')?.value || ''

  // Build colorName → image URL map for context
  const colorImageMap: Record<string, string> = {}
  options
    ?.find((o) => o.name === 'Color')
    ?.optionValues?.forEach((cv) => {
      if (cv.swatch?.image) colorImageMap[cv.name] = cv.swatch.image
    })

  const allGalleryImages = [featuredImage, ...(images || [])].filter(Boolean)

  const renderSectionSidebar = () => {
    return (
      <div className="listingSectionSidebar__wrap lg:shadow-lg">
        <div className="flex flex-col">
          {/* ----------  HEADING ----------  */}
          <div className="flex items-center justify-between gap-x-5">
            <Prices
              price={price || 0}
              contentClass="text-2xl font-semibold border-0 p-0 text-neutral-900 dark:text-neutral-100"
            />

            <a href="#reviews" className="flex items-center text-sm font-medium">
              <div>
                <StarIcon className="size-5 pb-px text-orange-400" />
              </div>
              <span className="ms-1.5 flex">
                <span>{actualRating}</span>
                <span className="mx-1.5">·</span>
                <span className="text-neutral-700 underline dark:text-neutral-400">{actualReviewNumber} reviews</span>
              </span>
            </a>
          </div>

          {/* Low Stock / Out of Stock Warning */}
          {product.stock != null && (
            product.stock === 0 ? (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 mt-4 dark:bg-red-950/30 dark:border-red-800">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500 shrink-0"></span>
                <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                  Out of Stock — this item is currently unavailable
                </span>
              </div>
            ) : product.stock <= 4 ? (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mt-4 dark:bg-amber-950/30 dark:border-amber-800">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  Only {product.stock} left — order soon before it runs out!
                </span>
              </div>
            ) : null
          )}

          <ProductForm product={product} className="mt-6">
            <fieldset>
              {/* ----------  VARIANTS AND SIZE LIST ----------  */}
              <div className="flex flex-col gap-y-7 lg:gap-y-8">
                <ProductColorOptions options={options} defaultColor={colorSelected} />
                <ProductSizeOptions options={options} defaultSize={sizeSelected} />
              </div>

              {/*  ----------  QTY AND ADD TO CART BUTTON */}
              <div className="flex gap-x-3.5 pt-11 lg:pt-12">
                <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
                  <NcInputNumber defaultValue={1} />
                </div>

                <ButtonPrimary className="flex-1" type="submit">
                  <HugeiconsIcon
                    icon={ShoppingBag03Icon}
                    size={20}
                    color="currentColor"
                    className="hidden sm:block"
                    strokeWidth={1.5}
                  />
                  <span className="text-base/6 font-normal sm:ml-2">Add to cart</span>
                </ButtonPrimary>
              </div>
            </fieldset>
          </ProductForm>
        </div>
      </div>
    )
  }

  const renderSection1 = () => {
    return (
      <div className="listingSection__wrap gap-y-6!">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
          <div className="mt-4 flex items-center sm:mt-5">
            <a href="#reviews" className="hidden items-center text-sm font-medium sm:flex">
              <div>
                <StarIcon className="h-5 w-5 pb-px text-neutral-800 dark:text-neutral-200" />
              </div>
              <span className="ml-1.5">
                <span>{actualRating}</span>
                <span className="mx-1.5">·</span>
                <span className="text-neutral-700 underline dark:text-neutral-400">{actualReviewNumber} reviews</span>
              </span>
            </a>
            <span className="mx-2.5 hidden sm:block">·</span>
            <ProductStatus status={status || ''} />
          </div>
        </div>
        {/*  */}
        <div className="block lg:hidden">{renderSectionSidebar()}</div>

        {/*  */}
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        {/*  */}
        <AccordionInfo
          panelClassName="p-4 pt-3.5 text-neutral-600 text-base dark:text-neutral-300 leading-7"
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
              content: product.careInstruction || 'Hand wash in cold water, dry flat.',
            },
            {
              name: 'Shipping & Return',
              content: product.shippingAndReturn || 'We offer free shipping on all orders over $50.',
            },
          ]}
        />
      </div>
    )
  }

  const renderSection2 = () => {
    return (
      <div className="listingSection__wrap border-b-0! pb-0!">
        <h2 className="text-2xl font-semibold">Product details</h2>
        <div className="prose prose-sm sm:prose sm:max-w-4xl dark:prose-invert">
          <p>
            The patented eighteen-inch hardwood Arrowhead deck --- finely mortised in, makes this the strongest and most
            rigid canoe ever built. You cannot buy a canoe that will afford greater satisfaction.
          </p>
          <p>
            The St. Louis Meramec Canoe Company was founded by Alfred Wickett in 1922. Wickett had previously worked for
            the Old Town Canoe Co from 1900 to 1914. Manufacturing of the classic wooden canoes in Valley Park, Missouri
            ceased in 1978.
          </p>
          <ul>
            <li>Regular fit, mid-weight t-shirt</li>
            <li>Natural color, 100% premium combed organic cotton</li>
            <li>Quality cotton grown without the use of herbicides or pesticides - GOTS certified</li>
            <li>Soft touch water based printed in the USA</li>
          </ul>
        </div>
        {/* ---------- 6 ----------  */}
        <Policy />
      </div>
    )
  }


  return (
    <ProductColorProvider defaultColor={colorSelected} colorImageMap={colorImageMap}>
      <div>
        <div className="container mt-8 sm:mt-10">
          <div className="relative">
            <LikeButton productHandle={handle} className="absolute top-3 left-3 z-10" />
            <ProductGalleryClient allImages={allGalleryImages} />
          </div>
        </div>

        {/* MAIn */}
        <main className="relative container mt-9 flex sm:mt-11">
          {/* CONTENT */}
          <div className="flex w-full flex-col gap-y-10 lg:w-3/5 lg:gap-y-14 lg:pr-14 xl:w-2/3">
            {renderSection1()}
            {renderSection2()}
          </div>

          {/* SIDEBAR */}
          <div className="grow">
            <div className="sticky top-10 hidden lg:block">{renderSectionSidebar()}</div>
          </div>
        </main>

        {/* OTHER SECTION */}
        <div className="container flex flex-col gap-y-14 pt-14 pb-24 lg:pb-28">
          <Divider />
          <ProductReviews reviewNumber={actualReviewNumber} rating={actualRating} reviews={reviews} productHandle={handle} />
          <Divider />
          <SectionSliderProductCard
            heading="Customers also purchased"
            subHeading=""
            data={relatedProducts}
            headingFontClassName="text-2xl font-semibold"
            headingClassName="mb-10 text-neutral-900 dark:text-neutral-50"
          />
        </div>
      </div>
    </ProductColorProvider>
  )
}
