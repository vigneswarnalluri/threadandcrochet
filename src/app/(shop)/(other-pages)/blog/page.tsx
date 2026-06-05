import BgGlassmorphism from '@/components/BgGlassmorphism/BgGlassmorphism'
import SectionPromo2 from '@/components/SectionPromo2'
import SectionAds from '@/components/blog/SectionAds'
import SectionGridPosts from '@/components/blog/SectionGridPosts'
import SectionMagazine5 from '@/components/blog/SectionMagazine5'
import { getBlogPosts } from '@/data/data'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Explore our blog for the latest news, articles, and insights on various topics.',
}

const BlogPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) => {
  const { page } = await searchParams
  const currentPage = typeof page === 'string' ? Math.max(1, parseInt(page, 10) || 1) : 1
  const itemsPerPage = 6

  const blogPosts = await getBlogPosts()
  const totalItems = blogPosts.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const paginatedPosts = blogPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div>
      <BgGlassmorphism />
      <div className="relative container">
        <div className="pt-12 pb-16 lg:pb-28">
          <SectionMagazine5 posts={blogPosts.slice(0, 5)} />
        </div>
        <SectionAds />
        <SectionGridPosts 
          posts={paginatedPosts} 
          currentPage={currentPage}
          totalPages={totalPages}
          className="py-16 lg:py-28" 
        />
        <SectionPromo2 className="pb-16 lg:pb-28" />
      </div>
    </div>
  )
}

export default BlogPage
