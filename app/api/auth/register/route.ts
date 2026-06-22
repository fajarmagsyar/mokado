import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { email, password, username } = await request.json()

  if (!email || !password || !username) {
    return NextResponse.json({ error: 'Email, password, dan username diperlukan' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ user: data.user }, { status: 201 })
}
