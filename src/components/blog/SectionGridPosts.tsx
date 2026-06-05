import Heading from '@/components/Heading/Heading'
import { TBlogPost } from '@/data/data'
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'
import { FC } from 'react'
import PostCard1 from './PostCard1'

interface SectionLatestPostsProps {
  className?: string
  posts: TBlogPost[]
  heading?: string
  currentPage?: number
  totalPages?: number
}

function getVisiblePages(currentPage: number, totalPages: number): (number | 'gap')[] {
  const visible: (number | 'gap')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      visible.push(i)
    }
    return visible
  }

  visible.push(1)

  let start = Math.max(2, currentPage - 1)
  let end = Math.min(totalPages - 1, currentPage + 1)

  if (currentPage <= 3) {
    end = 4
  } else if (currentPage >= totalPages - 2) {
    start = totalPages - 3
  }

  if (start > 2) {
    visible.push('gap')
  }

  for (let i = start; i <= end; i++) {
    visible.push(i)
  }

  if (end < totalPages - 1) {
    visible.push('gap')
  }

  visible.push(totalPages)
  return visible
}

const SectionGridPosts: FC<SectionLatestPostsProps> = ({
  className = '',
  posts,
  heading = 'Latest articles 🎈',
  currentPage = 1,
  totalPages = 1,
}) => {
  const visiblePages = getVisiblePages(currentPage, totalPages)

  return (
    <div className={`relative ${className}`}>
      <Heading>{heading}</Heading>
      {posts.length > 0 ? (
        <div className={'grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3'}>
          {posts.map((post) => (
            <PostCard1 size="sm" key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center text-neutral-500 py-12">
          No articles found.
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-16 flex justify-center md:mt-24">
          <Pagination className="mx-auto">
            <PaginationPrevious href={currentPage > 1 ? `?page=${currentPage - 1}` : null} />
            <PaginationList>
              {visiblePages.map((p, idx) =>
                p === 'gap' ? (
                  <PaginationGap key={`gap-${idx}`} />
                ) : (
                  <PaginationPage key={p} href={`?page=${p}`} current={p === currentPage}>
                    {p}
                  </PaginationPage>
                )
              )}
            </PaginationList>
            <PaginationNext href={currentPage < totalPages ? `?page=${currentPage + 1}` : null} />
          </Pagination>
        </div>
      )}
    </div>
  )
}

export default SectionGridPosts
