'use client'

import { useState } from 'react'
import { updateContactInfo } from './actions'
import toast from 'react-hot-toast'

interface EditShippingUpdatesProps {
  initialEmail: string
  initialPhone: string
}

export default function EditShippingUpdates({ initialEmail, initialPhone }: EditShippingUpdatesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [email, setEmail] = useState(initialEmail)
  const [phone, setPhone] = useState(initialPhone)
  const [loading, setLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await updateContactInfo(email, phone)
      if (res.success) {
        toast.success('Shipping updates contact info updated!')
        setIsEditing(false)
      } else {
        toast.error(res.error || 'Failed to update contact info')
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="flex flex-col gap-3 mt-3 w-full max-w-sm">
        <div>
          <label className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm text-neutral-900 shadow-sm focus:border-neutral-500 focus:outline-hidden focus:ring-1 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm text-neutral-900 shadow-sm focus:border-neutral-500 focus:outline-hidden focus:ring-1 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail(initialEmail)
              setPhone(initialPhone)
              setIsEditing(false)
            }}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700 dark:hover:bg-neutral-700"
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  return (
    <dd className="mt-3 flex flex-col gap-y-2 text-neutral-500 dark:text-neutral-400">
      <p className="break-all">{email || 'No email provided'}</p>
      <p>{phone || 'No phone number provided'}</p>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="font-medium underline text-left w-fit"
      >
        Edit
        <span aria-hidden="true"> &rarr;</span>
      </button>
    </dd>
  )
}
