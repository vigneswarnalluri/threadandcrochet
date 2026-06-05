import AccordionInfo from '@/components/AccordionInfo'
import { Divider } from '@/components/Divider'
import LikeButton from '@/components/LikeButton'
import NcInputNumber from '@/components/NcInputNumber'
import Prices from '@/components/Prices'
import { ProductColorProvider } from '@/components/ProductForm/ProductColorContext'
import ProductColorOptions from '@/components/ProductForm/ProductColorOptions'
import ProductGalleryClient from '@/components/ProductForm/ProductGalleryClient'
import ProductForm from '@/components/ProductForm/ProductForm'
import ProductSizeOptions from '@/components/ProductForm/ProductSizeOptions'
import SectionPromo2 from '@/components/SectionPromo2'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import { getProductDetailByHandle, getProductReviews, getProducts } from '@/data/data'
import Breadcrumb from '@/shared/Breadcrumb'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { StarIcon } from '@heroicons/react/24/solid'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Policy from '../Policy'
import ProductReviews from '../ProductReviews'
import ProductStatus from '../ProductStatus'

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductDetailByHandle(handle)
  const title = product?.title || 'product detail'
  const description = product?.description || 'product detail page'
  return {
    title,
    description,
  }
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const product = await getProductDetailByHandle(handle)
  const relatedProducts = (await getProducts()).slice(2, 8)
  const reviews = await getProductReviews(handle)

  if (!product.id) {
    return notFound()
  }

  const { title, status, featuredImage, rating, reviewNumber, options, price, selectedOptions, images, breadcrumbs } =
    product
  const sizeSelected = selectedOptions?.find((option) => option.name === 'Size')?.value || ''
  const colorSelected = selectedOptions?.find((option) => option.name === 'Color')?.value || ''

  // Build colorName → image URL map for context (used by gallery to swap images)
  const colorImageMap: Record<string, string> = {}
  options
    ?.find((o) => o.name === 'Color')
    ?.optionValues?.forEach((cv) => {
      if (cv.swatch?.image) colorImageMap[cv.name] = cv.swatch.image
    })

  const allGalleryImages = [featuredImage, ...(images || [])].filter(Boolean)

  const renderDetailSection = () => {
    return (
      <div className="">
        <h2 className="text-2xl font-semibold">Product Details</h2>
        <div className="prose prose-sm mt-7 sm:prose sm:max-w-4xl dark:prose-invert">
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
      </div>
    )
  }

  return (
    <ProductColorProvider defaultColor={colorSelected} colorImageMap={colorImageMap}>
      <main className="container mt-5 lg:mt-11">
        <div className="lg:flex">
          {/* ── LEFT – Gallery (reacts to context color) ── */}
          <div className="w-full lg:w-[55%]">
            <div className="relative">
              <LikeButton className="absolute top-3 left-3 z-10" />
              <ProductGalleryClient allImages={allGalleryImages} />
            </div>
          </div>

          {/* ── RIGHT – Product details + form ── */}
          <div className="w-full pt-10 lg:w-[45%] lg:pt-0 lg:pl-7 xl:pl-9 2xl:pl-10">
            <div className="sticky top-8 flex flex-col gap-y-10">
              {/* Heading */}
              <div>
                <Breadcrumb breadcrumbs={breadcrumbs} currentPage={product.title} />
                <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">{title}</h1>
                <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2.5 sm:gap-x-6">
                  <Prices contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold" price={price || 0} />
                  <div className="hidden h-7 border-l border-neutral-300 sm:block dark:border-neutral-700"></div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <a href="#reviews" className="flex items-center text-sm font-medium">
                      <StarIcon className="size-5 pb-px text-yellow-400" />
                      <div className="ms-1.5 flex">
                        <span>{rating}</span>
                        <span className="mx-2 block">·</span>
                        <span className="text-neutral-600 underline dark:text-neutral-400">{reviewNumber} reviews</span>
                      </div>
                    </a>
                    <span>·</span>
                    <ProductStatus status={status} />
                  </div>
                </div>
              </div>

              <ProductForm product={product}>
                <fieldset className="flex flex-col gap-y-10">
                  {/* Color + Size */}
                  <div className="flex flex-col gap-y-8">
                    {/* Color swatches on the RIGHT — writes to context → gallery updates */}
                    <ProductColorOptions options={options} defaultColor={colorSelected} />
                    <ProductSizeOptions options={options} defaultSize={sizeSelected} />
                  </div>

                  {/* Qty + Add to cart */}
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

              {/* Accordion */}
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
                    content: product.careInstruction || 'Hand wash in cold water, dry flat.',
                  },
                  {
                    name: 'Shipping & Return',
                    content: product.shippingAndReturn || 'We offer free shipping on all orders over $50.',
                  },
                ]}
              />

              {/* Policy (xl+) */}
              <div className="hidden xl:block">
                <Policy />
              </div>
            </div>
          </div>
        </div>

        {/* Detail + Reviews */}
        <div className="mt-12 flex flex-col gap-y-10 sm:mt-16 sm:gap-y-16">
          <div className="block xl:hidden">
            <Policy />
          </div>
          {renderDetailSection()}
          <Divider />
          <ProductReviews reviewNumber={reviewNumber || 0} rating={rating || 1} reviews={reviews} />
          <Divider />
          <SectionSliderProductCard
            data={relatedProducts}
            heading="Customers also purchased"
            subHeading=""
            headingFontClassName="text-3xl font-semibold"
            headingClassName="mb-12 text-neutral-900 dark:text-neutral-50"
          />
          <div className="pb-20 lg:pt-16 xl:pb-28">
            <SectionPromo2 />
          </div>
        </div>
      </main>
    </ProductColorProvider>
  )
}
