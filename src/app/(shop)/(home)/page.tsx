import BackgroundSection from '@/components/BackgroundSection/BackgroundSection'
import { Divider } from '@/components/Divider'
import Heading from '@/components/Heading/Heading'
import SectionClientSay from '@/components/SectionClientSay'
import SectionCollectionSlider from '@/components/SectionCollectionSlider'
import SectionCollectionSlider2 from '@/components/SectionCollectionSlider2'
import SectionGridFeatureItems from '@/components/SectionGridFeatureItems'
import SectionGridMoreExplore from '@/components/SectionGridMoreExplore/SectionGridMoreExplore'
import SectionHero2 from '@/components/SectionHero/SectionHero2'
import SectionHowItWork from '@/components/SectionHowItWork/SectionHowItWork'
import SectionPromo1 from '@/components/SectionPromo1'
import SectionPromo2 from '@/components/SectionPromo2'
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import SectionMagazine5 from '@/components/blog/SectionMagazine5'
import { getBlogPosts, getCollections, getGroupCollections, getProducts } from '@/data/data'
import { Button } from '@/shared/Button/Button'
import { ArrowRightIcon } from '@heroicons/react/24/solid'
import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Welcome to Thread & Love, your premium boutique storefront for beautiful handcrafted amigurumi plushies, cozy wearables, and custom home crochet decor.',
  keywords: ['Crochet', 'Handmade', 'Amigurumi', 'DIY Kits', 'Wearables', 'Thread & Love'],
}

async function PageHome() {
  const supabase = await createClient()

  // Fetch all layout data, blog posts, collections and products concurrently
  const [allCollections, groupCollections, products, blogPosts, bannerRes, layoutRes] = await Promise.all([
    getCollections(),
    getGroupCollections(),
    getProducts(),
    getBlogPosts(),
    supabase.from('store_settings').select('value').eq('key', 'banners').single(),
    supabase.from('store_settings').select('value').eq('key', 'homepage_layout').single(),
  ])

  const departmentCollections = allCollections.slice(11, 15)
  const featuredCollections = allCollections.slice(7, 11)
  const carouselProducts1 = products.slice(0, 5)
  const carouselProducts2 = products.slice(3, 10)
  const carouselProducts3 = products.slice(1, 5)

  // Fetch banners from store_settings
  let dbBanners: any[] = []
  if (bannerRes.data?.value && Array.isArray(bannerRes.data.value)) {
    dbBanners = bannerRes.data.value
  }

  const heroBanners = dbBanners.length > 0
    ? dbBanners.map((b: any, idx: number) => ({
        id: idx + 1,
        imageUrl: b.image || '/Crochet/IMG_20260605_154246_117.jpg',
        heading: b.title || 'Artisan Crochet Masterpieces',
        subHeading: b.subtitle || 'Lovingly hand-knitted & crafted',
        btnText: 'Shop Collection',
        btnHref: b.link || '#',
        bgColor: idx % 3 === 0 ? 'bg-[#FAEEE2]' : idx % 3 === 1 ? 'bg-[#F7ECE1]' : 'bg-[#EAE5DB]',
      }))
    : undefined

  // Load layout from store_settings
  let layoutConfig = [
    { id: 'hero', name: 'Hero Slider', visible: true },
    { id: 'featured_collections', name: 'Featured Collections Slider', visible: true },
    { id: 'new_arrivals', name: 'New Arrivals Products', visible: true },
    { id: 'how_it_works', name: 'How It Works Panel', visible: true },
    { id: 'promo_1', name: 'Promotion Banner 1', visible: true },
    { id: 'explore', name: 'Explore Collections Grid', visible: true },
    { id: 'best_sellers', name: 'Best Sellers Slider', visible: true },
    { id: 'promo_2', name: 'Promotion Banner 2', visible: true },
    { id: 'large_product', name: 'Large Product Spotlight', visible: true },
    { id: 'featured_products', name: 'Featured Items Grid', visible: true },
    { id: 'departments', name: 'Department Collections Slider', visible: true },
    { id: 'blog', name: 'Latest Crafting Journal Blog', visible: true },
    { id: 'reviews', name: 'Customer Testimonials Slider', visible: true }
  ]

  if (layoutRes.data?.value && Array.isArray(layoutRes.data.value)) {
    layoutConfig = layoutRes.data.value
  }

  return (
    <div className="nc-PageHome relative overflow-hidden">
      {layoutConfig.map((section: any) => {
        if (!section.visible) return null

        const spacingClass = section.id === 'hero' ? '' : 'mt-24 lg:mt-32'

        switch (section.id) {
          case 'hero':
            return <SectionHero2 key={section.id} data={heroBanners} />

          case 'featured_collections':
            return (
              <SectionCollectionSlider
                key={section.id}
                className={spacingClass}
                collections={featuredCollections}
              />
            )

          case 'new_arrivals':
            return (
              <div key={section.id} className={`container ${spacingClass}`}>
                <SectionSliderProductCard data={carouselProducts1} />
              </div>
            )

          case 'how_it_works':
            return (
              <div key={section.id} className={`container ${spacingClass} pb-16`}>
                <SectionHowItWork />
              </div>
            )

          case 'promo_1':
            return (
              <div key={section.id} className={`container ${spacingClass}`}>
                <SectionPromo1 />
              </div>
            )

          case 'explore':
            return (
              <div key={section.id} className={`container ${spacingClass}`}>
                <div className="relative pt-24 pb-20 lg:pt-28">
                  <BackgroundSection />
                  <SectionGridMoreExplore groupCollections={groupCollections} />
                </div>
              </div>
            )

          case 'best_sellers':
            return (
              <div key={section.id} className={`container ${spacingClass}`}>
                <SectionSliderProductCard
                  data={carouselProducts2}
                  heading="Best Sellers"
                  subHeading="Best selling of the month"
                />
              </div>
            )

          case 'promo_2':
            return (
              <div key={section.id} className={`container ${spacingClass}`}>
                <SectionPromo2 />
              </div>
            )

          case 'large_product':
            return (
              <div key={section.id} className={`container ${spacingClass}`}>
                <SectionSliderLargeProduct products={carouselProducts3} />
              </div>
            )

          case 'featured_products':
            return (
              <div key={section.id} className={`container ${spacingClass}`}>
                <SectionGridFeatureItems data={products.slice(0, 8)} />
              </div>
            )

          case 'departments':
            return (
              <div key={section.id} className={`container ${spacingClass}`}>
                <SectionCollectionSlider2 collections={departmentCollections} />
              </div>
            )

          case 'blog':
            return (
              <div key={section.id} className={`container ${spacingClass}`}>
                <Heading headingDim="From our crafting journal">The latest news</Heading>
                <SectionMagazine5 posts={blogPosts} />
                <div className="mt-20 flex justify-center">
                  <Button href="/blog" outline>
                    Show all blog articles
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )

          case 'reviews':
            return (
              <div key={section.id} className={`container ${spacingClass} pb-24 lg:pb-32`}>
                <SectionClientSay />
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}

export default PageHome
