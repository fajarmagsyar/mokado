import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return <DashboardClient username={profile?.username ?? ''} rooms={rooms ?? []} />
}
