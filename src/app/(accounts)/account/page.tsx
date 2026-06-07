import avatarFallback from '@/images/users/avatar1.jpg'
import { createClient } from '@/utils/supabase/server'
import { Field, Fieldset, Label } from '@/shared/fieldset'
import { Input, InputGroup } from '@/shared/input'
import { Select } from '@/shared/select'
import { Textarea } from '@/shared/textarea'
import {
  Calendar01Icon,
  Mail01Icon,
  MapsLocation01Icon,
  SmartPhone01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Suspense } from 'react'
import AvatarUploadSection, { SubmitButton } from './AvatarUploadSection'
import AccountSuccessToast from './AccountSuccessToast'

export const metadata: Metadata = {
  title: 'Account — Thread & Crochet',
  description: 'Manage your Thread & Crochet account',
}

const Page = async () => {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile from Supabase
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fallback defaults if profile not yet created
  const displayProfile = {
    fullName: profile?.full_name || user.email?.split('@')[0] || 'Guest',
    email: profile?.email || user.email || '',
    dateOfBirth: profile?.date_of_birth || '',
    address: profile?.address || '',
    gender: profile?.gender || 'Other',
    phoneNumber: profile?.phone_number || '',
    aboutYou: profile?.about_you || '',
  }

  const handleSubmit = async (formData: FormData) => {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Handle avatar upload to Supabase Storage
    let avatarUrl = profile?.avatar_url || null
    const avatarFile = formData.get('avatar') as File | null

    if (avatarFile && avatarFile.size > 0) {
      const fileExt = avatarFile.name.split('.').pop() || 'jpg'
      const filePath = `${user.id}/avatar.${fileExt}`
      const fileBuffer = await avatarFile.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileBuffer, {
          contentType: avatarFile.type,
          upsert: true,
        })

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
        avatarUrl = publicUrlData.publicUrl
      } else {
        console.error('Avatar upload error:', uploadError.message)
      }
    }

    const profileData = {
      id: user.id,
      full_name: (formData.get('full-name') as string) || displayProfile.fullName,
      email: (formData.get('email') as string) || displayProfile.email,
      date_of_birth: (formData.get('date-of-birth') as string) || null,
      address: (formData.get('address') as string) || '',
      gender: (formData.get('gender') as string) || 'Other',
      phone_number: (formData.get('phone-number') as string) || '',
      about_you: (formData.get('about-you') as string) || '',
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    }

    await supabase.from('profiles').upsert(profileData)
    revalidatePath('/account')
    redirect('/account?updated=1')
  }

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      {/* Success Toast — zero-render client component */}
      <Suspense fallback={null}>
        <AccountSuccessToast />
      </Suspense>

      {/* HEADING */}
      <h1 className="text-2xl font-semibold sm:text-3xl">Account information</h1>

      <form action={handleSubmit}>
        <Fieldset className="flex flex-col md:flex-row">
          <div className="flex shrink-0 items-start">
            {/* AVATAR — interactive client component */}
            <AvatarUploadSection
              currentAvatarUrl={profile?.avatar_url || null}
              fallbackAvatarSrc={avatarFallback.src}
            />
          </div>
          <div className="mt-10 max-w-3xl grow space-y-7 md:mt-0 md:pl-16">
            <Field>
              <Label>Full name</Label>
              <Input name="full-name" defaultValue={displayProfile.fullName} />
            </Field>

            {/* ---- */}
            <Field>
              <Label>Email</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={Mail01Icon} size={16} />
                <Input name="email" type="email" placeholder="example@email.com" defaultValue={displayProfile.email} />
              </InputGroup>
            </Field>

            {/* ---- */}
            <Field className="max-w-lg">
              <Label>Date of birth</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={Calendar01Icon} size={16} />
                <Input name="date-of-birth" type="date" defaultValue={displayProfile.dateOfBirth} />
              </InputGroup>
            </Field>
            {/* ---- */}
            <Field>
              <Label>Address</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={MapsLocation01Icon} size={16} />
                <Input name="address" defaultValue={displayProfile.address} />
              </InputGroup>
            </Field>

            {/* ---- */}
            <Field>
              <Label>Gender</Label>
              <Select name="gender" defaultValue={displayProfile.gender}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </Field>

            {/* ---- */}
            <Field>
              <Label>Phone number</Label>
              <InputGroup>
                <HugeiconsIcon data-slot="icon" icon={SmartPhone01Icon} size={16} />
                <Input name="phone-number" placeholder="+91" defaultValue={displayProfile.phoneNumber} />
              </InputGroup>
            </Field>
            {/* ---- */}
            <Field>
              <Label>About you</Label>
              <Textarea rows={4} name="about-you" defaultValue={displayProfile.aboutYou} />
            </Field>
            <div className="pt-2">
              <SubmitButton />
            </div>
          </div>
        </Fieldset>
      </form>
    </div>
  )
}

export default Page
