'use client'

import ReviewItem from '@/components/ReviewItem'
import StarReview from '@/components/StarReview'
import { TReview } from '@/data/data'
import { Button } from '@/shared/Button/Button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/shared/dialog'
import { Field, Fieldset, Label } from '@/shared/fieldset'
import { Textarea } from '@/shared/textarea'
import { StarIcon } from '@heroicons/react/24/solid'
import { MessageAdd01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import Form from 'next/form'
import React, { useState, useEffect } from 'react'
import { useStore } from '@/context/StoreContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const ProductReviews = ({
  rating,
  reviewNumber,
  reviews,
  productHandle,
  className,
}: {
  reviews: TReview[]
  className?: string
  rating: number
  reviewNumber: number
  productHandle: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useStore()
  const router = useRouter()

  const [localReviews, setLocalReviews] = useState<TReview[]>(reviews)
  const [localRating, setLocalRating] = useState(rating)
  const [localReviewNumber, setLocalReviewNumber] = useState(reviewNumber)

  useEffect(() => {
    fetchReviews()
  }, [productHandle])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?product_id=${encodeURIComponent(productHandle)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.reviews) {
          setLocalReviews(data.reviews)
          const num = data.reviews.length
          setLocalReviewNumber(num)
          if (num > 0) {
            const sum = data.reviews.reduce((acc: number, r: any) => acc + r.rating, 0)
            setLocalRating(parseFloat((sum / num).toFixed(1)))
          } else {
            setLocalRating(0)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching updated reviews:', err)
    }
  }

  const handleWriteReviewClick = () => {
    if (!user) {
      toast.error('Please sign in to write a review.')
      router.push(`/login?redirectedFrom=/products/${productHandle}`)
      return
    }
    setIsOpen(true)
  }

  const handleSubmit = async (formData: FormData) => {
    const reviewText = formData.get('review')?.toString() || ''
    const ratingVal = formData.get('rating') ? parseInt(formData.get('rating')?.toString() || '0', 10) : 0

    if (!reviewText || ratingVal < 1 || ratingVal > 5) {
      toast.error('Please select a rating and enter your comments.')
      return
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productHandle,
          rating: ratingVal,
          content: reviewText,
          title: reviewText.slice(0, 40) + (reviewText.length > 40 ? '...' : ''),
        }),
      })

      if (res.ok) {
        toast.success('Thank you! Your review has been submitted.')
        setIsOpen(false)
        fetchReviews()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to submit review')
      }
    } catch (err) {
      console.error('Error submitting review:', err)
      toast.error('An error occurred. Please try again.')
    }
  }

  return (
    <div className={clsx(className)}>
      <div>
        {/* HEADING */}
        <h2 className="flex scroll-mt-8 items-center text-2xl font-semibold" id="reviews">
          <StarIcon className="mb-0.5 size-7 text-yellow-400" />
          <span className="ml-1.5">
            {localRating} · {localReviewNumber} Reviews
          </span>
        </h2>

        {/* comment */}
        <div className="mt-10">
          {localReviews.length === 0 ? (
            <div className="text-neutral-500 py-4 dark:text-neutral-400">
              No reviews yet. Be the first to write a review!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-14 gap-y-11 md:grid-cols-2 lg:gap-x-28">
              {localReviews.map((review) => (
                <ReviewItem key={review.id} data={review} />
              ))}
            </div>
          )}
        </div>

        {/* Add review form */}
        <Button className="mt-10" onClick={handleWriteReviewClick}>
          <HugeiconsIcon icon={MessageAdd01Icon} size={20} />
          Write a review
        </Button>

        <Dialog size="2xl" open={isOpen} onClose={setIsOpen}>
          <DialogTitle>
            <div className="flex items-center">
              <HugeiconsIcon icon={MessageAdd01Icon} size={20} className="mr-2" />
              Write a review
            </div>
          </DialogTitle>
          <DialogDescription>
            Your email address will not be published. Required fields are marked with an asterisk (*).
          </DialogDescription>
          <DialogBody>
            <Form action={handleSubmit} id="review-form">
              <Fieldset>
                <StarReview />
                <Field className="mt-5">
                  <Label>Your review *</Label>
                  <Textarea name="review" placeholder="" rows={6} required />
                </Field>
              </Fieldset>
            </Form>
          </DialogBody>
          <DialogActions>
            <Button size="smaller" plain onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button size="smaller" type="submit" form="review-form">
              Submit review
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
}

export default ProductReviews

