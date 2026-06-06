import { TReview } from '@/data/data'
import Avatar from '@/shared/Avatar/Avatar'
import { StarIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { FC } from 'react'

export interface ReviewItemProps {
  className?: string
  data: TReview
}

const ReviewItem: FC<ReviewItemProps> = ({ className, data }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex gap-x-4">
        <div className="shrink-0 pt-0.5">
          <Avatar
            sizeClass="size-10 text-lg"
            radius="rounded-full"
            userName={data.author || ''}
            imgUrl={data.authorAvatar?.src}
          />
        </div>

        <div className="flex flex-1 justify-between">
          <div className="text-sm sm:text-base">
            <span className="block font-semibold">{data.author}</span>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">{data.date}</span>
              {data.isVerifiedBuyer && (
                <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-3">
                    <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-3.073a.75.75 0 10-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4.137-5.7z" clipRule="evenodd" />
                  </svg>
                  Verified Buyer
                </span>
              )}
            </div>
          </div>

          <div className="mt-0.5 flex text-yellow-500">
            {[0, 1, 2, 3, 4].map((rating) => (
              <StarIcon
                key={rating}
                aria-hidden="true"
                className={clsx((data.rating || 1) > rating ? 'text-yellow-400' : 'text-gray-200', 'size-5 shrink-0')}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="prose prose-sm mt-4 sm:prose sm:max-w-2xl dark:prose-invert">
        <div
          className="text-neutral-600 dark:text-neutral-300"
          dangerouslySetInnerHTML={{ __html: data.content || '' }}
        ></div>
      </div>
    </div>
  )
}

export default ReviewItem
