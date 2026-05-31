import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function getSettings() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, returning empty settings')
    return {}
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

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
  if (!supabaseUrl || !supabaseKey) {
    return []
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

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
  if (!supabaseUrl || !supabaseKey) {
    return []
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

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
