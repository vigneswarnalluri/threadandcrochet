import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

interface AdminActionParams {
  action: string
  targetType: string
  targetId?: string
  details?: string
}

export async function logAdminAction(params: AdminActionParams) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const adminClient = createAdminClient()
    await adminClient
      .from('admin_audit_logs')
      .insert({
        admin_id: user.id,
        admin_email: user.email,
        action: params.action,
        target_type: params.targetType,
        target_id: params.targetId || null,
        details: params.details || null
      })
  } catch (err) {
    console.error('Failed to log admin action:', err)
  }
}
