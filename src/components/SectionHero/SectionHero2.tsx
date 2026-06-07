'use client'

import backgroundLineSvg from '@/images/Moon.svg'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import Image from 'next/image'
import { FC, useEffect, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { useInterval } from 'react-use'

// DEMO DATA
const DEMO_SLIDES = [
  {
    id: 1,
    imageUrl: '/Crochet/IMG_20260605_154246_117.jpg',
    heading: 'Artisan Crochet <br /> Bags & Totes',
    subHeading: 'Handcrafted granny-square totes, lovingly looped stitch by stitch 🧶',
    btnText: 'Shop Bags & Totes',
    btnHref: '/collections/bags',
    bgColor: 'bg-[#FAEEE2]',
  },
  {
    id: 2,
    imageUrl: '/Crochet/IMG_20260605_154009_634.jpg',
    heading: 'Everlasting Crochet <br /> Flower Bouquets',
    subHeading: 'Never-wilting blooms, hand-stitched with wire-reinforced stems 🌸',
    btnText: 'Shop Flower Bouquets',
    btnHref: '/products/crochet-flower-bouquet',
    bgColor: 'bg-[#F7ECE1]',
  },
  {
    id: 3,
    imageUrl: '/Crochet/IMG_20260605_154015_438.jpg',
    heading: 'Adopt a Cuddly <br /> Amigurumi Companion',
    subHeading: 'Sweet plush keychains handcrafted to bring smiles to little ones 🧸',
    btnText: 'Shop Amigurumi Toys',
    btnHref: '/collections/t-shirts',
    bgColor: 'bg-[#EAE5DB]',
  },
]

export interface HeroSlide {
  id: number
  imageUrl: string
  heading: string
  subHeading: string
  btnText: string
  btnHref: string
  bgColor: string
}

interface Props {
  className?: string
  data?: HeroSlide[]
}

let TIME_OUT: NodeJS.Timeout | null = null
const SectionHero2: FC<Props> = ({ className = '', data: customData }) => {
  // =================

  const slides = customData && customData.length > 0 ? customData : DEMO_SLIDES

  const [isSlided, setIsSlided] = useState(false)
  const [indexActive, setIndexActive] = useState(0)
  const [isRunning, toggleIsRunning] = useState(true)

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      handleClickNext()
    },
    onSwipedRight: () => {
      handleClickPrev()
    },
    trackMouse: true,
  })

  useEffect(() => {
    if (isSlided || !indexActive) {
      return
    }
    setIsSlided(true)
  }, [indexActive, isSlided])

  useInterval(
    () => {
      handleAutoNext()
    },
    isRunning ? 5000 : 999999
  )

  const handleAutoNext = () => {
    setIndexActive((state) => {
      if (state >= slides.length - 1) {
        return 0
      }
      return state + 1
    })
  }

  const handleClickNext = () => {
    setIndexActive((state) => {
      if (state >= slides.length - 1) {
        return 0
      }
      return state + 1
    })
    handleAfterClick()
  }

  const handleClickPrev = () => {
    setIndexActive((state) => {
      if (state === 0) {
        return slides.length - 1
      }
      return state - 1
    })
    handleAfterClick()
  }

  const handleAfterClick = () => {
    toggleIsRunning(false)
    if (TIME_OUT) {
      clearTimeout(TIME_OUT)
    }
    TIME_OUT = setTimeout(() => {
      toggleIsRunning(true)
    }, 1000)
  }

  // ===================================================

  const renderItem = (index: number) => {
    const isActive = indexActive === index
    const item = slides[index]

    return (
      <div
        className={clsx(
          'fade--animation relative flex h-full flex-col gap-6 overflow-hidden py-10 pl-container sm:py-12 lg:flex-row lg:items-center',
          isActive ? 'flex' : 'hidden'
        )}
        key={index}
      >
        {/* BG */}
        <div className={clsx("absolute inset-0 -z-10", item.bgColor)}>
          <Image
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="absolute h-full w-full object-contain"
            src={backgroundLineSvg}
            alt="hero"
          />
        </div>

        {/* DOTS */}
        <div className="absolute start-1/2 bottom-4 flex -translate-x-1/2 justify-center rtl:translate-x-1/2">
          {slides.map((_, index) => {
            const isActive = indexActive === index
            return (
              <div
                key={index}
                onClick={() => {
                  setIndexActive(index)
                  handleAfterClick()
                }}
                className="relative cursor-pointer px-1 py-1.5"
              >
                <div className="relative h-1 w-20 rounded-md bg-white shadow-xs">
                  {isActive && <div className={`absolute inset-0 rounded-md bg-neutral-900 fade--animation__dot`} />}
                </div>
              </div>
            )
          })}
        </div>

        <div className="relative flex max-w-5xl flex-1/2 flex-col items-start fade--animation__left">
          <span className="block text-base font-medium text-neutral-700 fade--animation__subheading md:text-xl">
            {item.subHeading}
          </span>
          <h2
            className="mt-5 text-4xl font-semibold text-neutral-900 fade--animation__heading sm:mt-6 md:text-5xl xl:text-6xl xl:leading-[1.2] 2xl:text-7xl"
            dangerouslySetInnerHTML={{ __html: item.heading }}
          />

          <ButtonPrimary className="mt-8 fade--animation__button sm:mt-10" href={item.btnHref || '#'}>
            <span className="me-2">{item.btnText}</span>
            <HugeiconsIcon icon={Search01Icon} size={20} />
          </ButtonPrimary>
        </div>

        <div className="relative -z-10 flex flex-1/2 items-center justify-center lg:pr-10">
          <Image
            sizes="(max-width: 768px) 100vw, 60vw"
            className="h-auto w-full max-w-[40rem] max-h-[60vh] object-contain fade--animation__image select-none"
            src={item.imageUrl}
            alt={item.heading}
            width={790}
            height={790}
            priority
          />
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('relative z-[1] h-screen', className)} suppressHydrationWarning {...handlers}>
      {slides.map((_, index) => renderItem(index))}

      <button
        type="button"
        className="absolute inset-y-px end-0 z-10 hidden items-center justify-center px-10 text-neutral-700 lg:flex"
        onClick={handleClickNext}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={0.6}
          stroke="currentColor"
          className="h-12 w-12"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      <button
        type="button"
        className="absolute inset-y-px start-0 z-10 hidden items-center justify-center px-10 text-neutral-700 lg:flex"
        onClick={handleClickPrev}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={0.6}
          stroke="currentColor"
          className="h-12 w-12"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
    </div>
  )
}

export default SectionHero2
