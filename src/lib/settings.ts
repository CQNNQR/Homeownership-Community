import { createClient } from '@supabase/supabase-js'

export async function getSettings() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')

  if (error) {
    console.error('Error fetching settings:', error)
    return {}
  }

  const settings: Record<string, string> = {}
  data?.forEach((item: { key: string; value: string }) => {
    settings[item.key] = item.value
  })

  return settings
}

export async function getTestimonials() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }

  return data || []
}

export async function getPodcastEpisodes() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('podcast_episodes')
    .select('*')
    .order('episode_number', { ascending: true })

  if (error) {
    console.error('Error fetching podcast episodes:', error)
    return []
  }

  return data || []
}
