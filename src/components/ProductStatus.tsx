import { ClockIcon, NoSymbolIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { FC } from 'react'
import IconDiscount from './IconDiscount'

interface Props {
  status?: string
  className?: string
}

const ProductStatus: FC<Props> = ({
  status = 'New in',
  className = 'absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300',
}) => {
  const renderStatus = () => {
    if (!status) {
      return null
    }
    const classes = `nc-shadow-lg rounded-full flex items-center justify-center ${className}`
    if (status === 'New in') {
      return (
        <div className={classes}>
          <SparklesIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === '50% Discount') {
      return (
        <div className={classes}>
          <IconDiscount className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === 'Sold Out') {
      return (
        <div className={classes}>
          <NoSymbolIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === 'limited edition') {
      return (
        <div className={classes}>
          <ClockIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      )
    }
    if (status === 'Pinterest Pin') {
      return (
        <div className="nc-shadow-lg rounded-full flex items-center justify-center bg-red-600 px-2.5 py-1.5 text-xs text-white font-medium gap-1">
          <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.16-.1-.95-.19-2.4.04-3.43.21-.92 1.34-5.69 1.34-5.69s-.34-.68-.34-1.69c0-1.58.92-2.76 2.06-2.76.97 0 1.44.73 1.44 1.61 0 .98-.62 2.44-.94 3.79-.27 1.13.56 2.05 1.68 2.05 2.02 0 3.57-2.13 3.57-5.21 0-2.72-1.96-4.63-4.75-4.63-3.24 0-5.14 2.43-5.14 4.94 0 .98.38 2.03.85 2.6.09.11.1.2.07.32-.08.33-.26 1.05-.29 1.2-.05.19-.17.23-.39.13-1.46-.68-2.37-2.82-2.37-4.54 0-3.69 2.69-7.09 7.74-7.09 4.06 0 7.22 2.9 7.22 6.77 0 4.04-2.55 7.28-6.08 7.28-1.19 0-2.31-.62-2.69-1.35 0 0-.59 2.24-.73 2.79-.27 1.03-.98 2.32-1.46 3.09A12.02 12.02 0 0012 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
          </svg>
          <span className="leading-none">Pinterest</span>
        </div>
      )
    }
    return null
  }

  return renderStatus()
}

export default ProductStatus
