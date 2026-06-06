'use client'

import { useState } from 'react'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { changeUserPassword } from './actions'
import toast from 'react-hot-toast'

interface PasswordFormProps {
  hasPassword: boolean
}

export default function PasswordForm({ hasPassword }: PasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await changeUserPassword(hasPassword ? currentPassword : null, newPassword)
      if (res.success) {
        toast.success(hasPassword ? 'Password updated successfully!' : 'Password set successfully! You can now log in using your email or Google.')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        
        // Refresh the page so the hasPassword state updates in server component
        window.location.reload()
      } else {
        toast.error(res.error || 'Failed to update password')
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Fieldset>
        <FieldGroup className="max-w-xl space-y-6">
          
          {/* Banner if Google OAuth user */}
          {!hasPassword && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
              <div className="flex">
                <div className="shrink-0 text-amber-600 dark:text-amber-500">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400">Signed in via Google</h3>
                  <div className="mt-1 text-sm text-amber-700 dark:text-amber-500">
                    <p>
                      Because you logged in with Google, you don't have a local password set. 
                      You can enter a password below to enable logging in directly using your email and password.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasPassword && (
            <Field>
              <Label>Current password</Label>
              <Input
                type="password"
                name="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Field>
          )}

          <Field>
            <Label>New password</Label>
            <Input
              type="password"
              name="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>

          <Field>
            <Label>Confirm password</Label>
            <Input
              type="password"
              name="confirm-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>

          <div className="pt-2">
            <ButtonPrimary type="submit" disabled={loading}>
              {loading ? 'Please wait...' : hasPassword ? 'Update password' : 'Set password'}
            </ButtonPrimary>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}
