import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Hard timeout for any Supabase read. Static page generation at
// build time will block the entire build if a Supabase call hangs;
// this guarantees the build never waits more than 3s on the read
// and just falls back to empty settings.
const SUPABASE_READ_TIMEOUT_MS = 3000

function withTimeout<T>(promise: PromiseLike<T>, ms: number, fallback: any): Promise<T | any> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<any>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ])
}

// Discriminated timeout fallback that matches the shape of a
// Supabase PostgrestResponse on a real error. We use `any` here
// because the PostgrestResponse generic is awkward to construct
// by hand; this fallback only fires on timeout and is read-only
// by the callers (they only access `.data` and `.error`).
const TIMEOUT_FALLBACK: any = { data: null, error: { message: 'read-timeout' } }

export async function getSettings() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, returning empty settings')
    return {}
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await withTimeout(
    supabase.from('site_settings').select('key, value'),
    SUPABASE_READ_TIMEOUT_MS,
    TIMEOUT_FALLBACK
  )

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

  const { data, error } = await withTimeout(
    supabase.from('testimonials').select('*').eq('is_active', true),
    SUPABASE_READ_TIMEOUT_MS,
    TIMEOUT_FALLBACK
  )

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

  const { data, error } = await withTimeout(
    supabase.from('podcast_episodes')
      .select('*')
      .eq('is_visible', true)
      .order('episode_number', { ascending: true }),
    SUPABASE_READ_TIMEOUT_MS,
    TIMEOUT_FALLBACK
  )

  if (error) {
    console.error('Error fetching podcast episodes:', error)
    return []
  }

  return data || []
}

// Get visible blog post IDs from our visibility table
export async function getVisibleBlogPostIds(): Promise<string[]> {
  if (!supabaseUrl || !supabaseKey) {
    return []
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await withTimeout(
    supabase.from('blog_post_visibility')
      .select('wordpress_id')
      .eq('is_visible', true),
    SUPABASE_READ_TIMEOUT_MS,
    TIMEOUT_FALLBACK
  )

  if (error) {
    console.error('Error fetching visible blog posts:', error)
    return []
  }

  return data?.map((row: { wordpress_id: number | string }) => String(row.wordpress_id)) || []
}
