'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export default function SiteEditor() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('settings')

  // Settings state
  const [settings, setSettings] = useState({
    contact_email: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    twitter_url: '',
    youtube_url: '',
    podcast_url: '',
    site_tagline: '',
    hero_title: '',
    hero_subtitle: '',
    // Site Identity
    site_name: 'The Homeownership Community',
    site_description: 'Empowering future homeowners, real estate investors, and aspiring landlords to build generational wealth through ownership.',
    // Hero & Media
    hero_image_url: '',
    // Meta / SEO
    meta_title: '',
    meta_description: '',
    // Section Visibility
    show_books_section: 'true',
    show_community_ad: 'true',
    show_events_section: 'true',
    show_testimonials_section: 'true',
    // CTA Button Text
    cta_button_text: 'Start Your Journey',
    cta_secondary_text: 'Get My Book',
    // Blog
    blog_title: 'Latest from the Blog',
    // Opt-in Modal
    optin_title: 'Join the Community',
    optin_message: 'Fill out the form below and we\'ll be in touch soon.',
    // Footer
    footer_mission: 'Empowering future homeowners, real estate investors, and aspiring landlords to build generational wealth through ownership.',
    // About Page
    about_title: 'About Brandon Bee Dixon',
    about_content: '',
  })
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/admin/login'
        return
      }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  // Fetch settings when section changes
  useEffect(() => {
    if (activeSection === 'settings') {
      fetchSettings()
    }
  }, [activeSection])

  const fetchSettings = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (!error && data) {
      const settingsObj: any = {}
      data.forEach((item: any) => {
        settingsObj[item.key] = item.value
      })
      setSettings(prev => ({ ...prev, ...settingsObj }))
    }
  }

  const handleLogout = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const saveSettings = async () => {
    setSaving(true)
    setSaveMessage('')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    let hasError = false

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value }, { onConflict: 'key' })

      if (error) {
        console.error(`Error saving ${key}:`, error)
        hasError = true
      }
    }

    setSaving(false)
    if (hasError) {
      setSaveMessage('Some settings failed to save. Please try again.')
    } else {
      setSaveMessage('Settings saved successfully!')
    }
    setTimeout(() => setSaveMessage(''), 5000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-black text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-black">Site Editor</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Welcome, {user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          <button
            onClick={() => setActiveSection('settings')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeSection === 'settings'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Site Settings
          </button>
          <button
            onClick={() => setActiveSection('testimonials')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeSection === 'testimonials'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Testimonials
          </button>
          <button
            onClick={() => setActiveSection('podcast')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeSection === 'podcast'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Podcast
          </button>
          <button
            onClick={() => setActiveSection('media')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeSection === 'media'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Media
          </button>
          <button
            onClick={() => setActiveSection('subscribers')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeSection === 'subscribers'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Subscribers
          </button>
          <button
            onClick={() => setActiveSection('events')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeSection === 'events'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveSection('blog')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeSection === 'blog'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Blog
          </button>
          <button
            onClick={() => setActiveSection('books')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeSection === 'books'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Books
          </button>
          <button
            onClick={() => setActiveSection('theme')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeSection === 'theme'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Theme
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Site Settings Section */}
        {activeSection === 'settings' && (
          <div className="space-y-6">
            {/* Site Identity */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-lg font-bold text-black mb-4">Site Identity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={settings.site_name || ''}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="The Homeownership Community"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                  <input
                    type="text"
                    value={settings.site_description || ''}
                    onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="Your site description"
                  />
                </div>
              </div>
            </div>

            {/* SEO Meta Tags */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-lg font-bold text-black mb-4">SEO & Meta Tags</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (for search engines)</label>
                  <input
                    type="text"
                    value={settings.meta_title || ''}
                    onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="Your site title for Google"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    rows={2}
                    value={settings.meta_description || ''}
                    onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="Brief description for search results..."
                  />
                </div>
              </div>
            </div>

            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-lg font-bold text-black mb-4">Hero Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
                  <input
                    type="url"
                    value={settings.hero_image_url || ''}
                    onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: Use an Unsplash URL (2000x1200px)</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-lg font-bold text-black mb-4">CTA Button Text</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button (Hero)</label>
                  <input
                    type="text"
                    value={settings.cta_button_text || ''}
                    onChange={(e) => setSettings({ ...settings, cta_button_text: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="Start Your Journey"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button (Hero)</label>
                  <input
                    type="text"
                    value={settings.cta_secondary_text || ''}
                    onChange={(e) => setSettings({ ...settings, cta_secondary_text: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="Get My Book"
                  />
                </div>
              </div>
            </div>

            {/* Blog Section */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-lg font-bold text-black mb-4">Blog Section</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blog Section Title</label>
                <input
                  type="text"
                  value={settings.blog_title || ''}
                  onChange={(e) => setSettings({ ...settings, blog_title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                  placeholder="Latest from the Blog"
                />
              </div>
            </div>

            {/* Homepage Sections Visibility */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-lg font-bold text-black mb-4">Homepage Sections</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.show_books_section === 'true'}
                    onChange={(e) => setSettings({ ...settings, show_books_section: e.target.checked ? 'true' : 'false' })}
                    className="w-4 h-4 text-red-700 rounded"
                  />
                  <span className="text-sm text-gray-700">Show Books Section</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.show_community_ad === 'true'}
                    onChange={(e) => setSettings({ ...settings, show_community_ad: e.target.checked ? 'true' : 'false' })}
                    className="w-4 h-4 text-red-700 rounded"
                  />
                  <span className="text-sm text-gray-700">Show Community Ad Banner</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.show_events_section === 'true'}
                    onChange={(e) => setSettings({ ...settings, show_events_section: e.target.checked ? 'true' : 'false' })}
                    className="w-4 h-4 text-red-700 rounded"
                  />
                  <span className="text-sm text-gray-700">Show Events Section</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.show_testimonials_section === 'true'}
                    onChange={(e) => setSettings({ ...settings, show_testimonials_section: e.target.checked ? 'true' : 'false' })}
                    className="w-4 h-4 text-red-700 rounded"
                  />
                  <span className="text-sm text-gray-700">Show Testimonials Section</span>
                </label>
              </div>
            </div>

            {/* Join Modal */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-lg font-bold text-black mb-4">Join Community Modal</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modal Title</label>
                  <input
                    type="text"
                    value={settings.optin_title || ''}
                    onChange={(e) => setSettings({ ...settings, optin_title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="Join the Community"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modal Message</label>
                  <textarea
                    rows={2}
                    value={settings.optin_message || ''}
                    onChange={(e) => setSettings({ ...settings, optin_message: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="Fill out the form below..."
                  />
                </div>
              </div>
            </div>

            {/* About Page */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-lg font-bold text-black mb-4">About Page Content</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                  <input
                    type="text"
                    value={settings.about_title || ''}
                    onChange={(e) => setSettings({ ...settings, about_title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="About Brandon Bee Dixon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio Content (HTML allowed)</label>
                  <textarea
                    rows={8}
                    value={settings.about_content || ''}
                    onChange={(e) => setSettings({ ...settings, about_content: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 font-mono text-sm"
                    placeholder="<p>Your bio content here...</p>"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-lg font-bold text-black mb-4">Social Media Links</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                    <input
                      type="url"
                      value={settings.facebook_url || ''}
                      onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      value={settings.instagram_url || ''}
                      onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={settings.linkedin_url || ''}
                      onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">X (Twitter) URL</label>
                    <input
                      type="url"
                      value={settings.twitter_url || ''}
                      onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                      placeholder="https://x.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-lg font-bold text-black mb-4">Contact & Footer</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contact_email || ''}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="brandon@hocmortgage.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Podcast URL</label>
                  <input
                    type="url"
                    value={settings.podcast_url || ''}
                    onChange={(e) => setSettings({ ...settings, podcast_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="https://youtube.com/@channel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer Mission Statement</label>
                  <textarea
                    rows={2}
                    value={settings.footer_mission || ''}
                    onChange={(e) => setSettings({ ...settings, footer_mission: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="Your mission statement..."
                  />
                </div>
              </div>
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="w-full sm:w-auto bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {saveMessage && (
              <span className="ml-4 text-green-700 font-medium">{saveMessage}</span>
            )}
          </div>
        )}

        {/* Testimonials Section */}
        {activeSection === 'testimonials' && (
          <TestimonialsEditor />
        )}

        {/* Podcast Section */}
        {activeSection === 'podcast' && (
          <PodcastEditor />
        )}

        {/* Media Section */}
        {activeSection === 'media' && (
          <MediaLibrary />
        )}

        {/* Subscribers Section */}
        {activeSection === 'subscribers' && (
          <SubscribersManager />
        )}

        {/* Events Section */}
        {activeSection === 'events' && (
          <EventsManager />
        )}

        {/* Blog Section */}
        {activeSection === 'blog' && (
          <BlogManager />
        )}

        {/* Books Section */}
        {activeSection === 'books' && (
          <BooksManager />
        )}

        {/* Theme Section */}
        {activeSection === 'theme' && (
          <ThemeEditor />
        )}
      </main>
    </div>
  )
}

// Books Manager Component
function BooksManager() {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', author: 'Brandon Bee Dixon', amazon_url: '', description: '', sort_order: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from('books')
      .select('*')
      .order('sort_order', { ascending: true })
    setBooks(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (editingId) {
      await fetch('/api/books', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...form }),
      })
    } else {
      await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }

    setForm({ title: '', author: 'Brandon Bee Dixon', amazon_url: '', description: '', sort_order: 0 })
    setShowForm(false)
    setEditingId(null)
    setSaving(false)
    fetchBooks()
    alert('Book saved successfully!')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this book?')) return
    await fetch('/api/books', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchBooks()
  }

  const handleEdit = (book: any) => {
    setForm({
      title: book.title,
      author: book.author || 'Brandon Bee Dixon',
      amazon_url: book.amazon_url,
      description: book.description || '',
      sort_order: book.sort_order || 0,
    })
    setEditingId(book.id)
    setShowForm(true)
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-black">Books</h2>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: '', author: 'Brandon Bee Dixon', amazon_url: '', description: '', sort_order: 0 }); }}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Add Book
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h3 className="text-lg font-bold text-black mb-4">{editingId ? 'Edit Book' : 'Add New Book'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700" placeholder="Book title..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700" placeholder="Author name..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amazon URL</label>
              <input type="url" required value={form.amazon_url} onChange={(e) => setForm({ ...form, amazon_url: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700" placeholder="https://amazon.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700" placeholder="Brief description..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button type="submit" disabled={saving} className="bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors">{saving ? 'Saving...' : 'Save Book'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {books.length === 0 && <p className="text-gray-500 text-center py-8">No books yet. Add your first one!</p>}
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-xl shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Order: {book.sort_order}</span>
                </div>
                <h3 className="font-bold text-black">{book.title}</h3>
                <p className="text-sm text-gray-500">{book.author}</p>
                {book.description && <p className="text-sm text-gray-600 mt-1">{book.description}</p>}
                <a href={book.amazon_url} target="_blank" rel="noopener noreferrer" className="text-sm text-red-700 hover:text-red-800 mt-2 inline-block">View on Amazon →</a>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => handleEdit(book)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Blog Manager Component - Focus on visibility management
function BlogManager() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog-visibility')
      const data = await response.json()
      setPosts(data || [])
    } catch (err) {
      console.error('Error fetching posts:', err)
    }
    setLoading(false)
  }

  const syncPosts = async () => {
    if (!confirm('Sync posts from WordPress? This will add any new posts to the visibility list.')) return
    try {
      await fetch('/api/blog-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      })
      fetchPosts()
      alert('Posts synced from WordPress!')
    } catch (err) {
      console.error('Error syncing posts:', err)
    }
  }

  const toggleVisibility = async (post: any) => {
    try {
      await fetch('/api/blog-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          wordpress_id: post.wordpress_id,
          slug: post.slug,
          title: post.title,
        }),
      })
      fetchPosts()
    } catch (err) {
      console.error('Error toggling visibility:', err)
    }
  }

  const toggleSelect = (wordpressId: number) => {
    setSelectedIds(prev =>
      prev.includes(wordpressId) ? prev.filter(i => i !== wordpressId) : [...prev, wordpressId]
    )
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredPosts.map(p => p.wordpress_id))
    }
    setSelectAll(!selectAll)
  }

  const bulkHide = async () => {
    if (!confirm(`Hide ${selectedIds.length} selected posts?`)) return
    for (const wpId of selectedIds) {
      const post = posts.find(p => p.wordpress_id === wpId)
      if (post) {
        await fetch('/api/blog-visibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'toggle',
            wordpress_id: post.wordpress_id,
            slug: post.slug,
            title: post.title,
          }),
        })
      }
    }
    setSelectedIds([])
    setSelectAll(false)
    fetchPosts()
    alert('Selected posts hidden!')
  }

  const bulkShow = async () => {
    if (!confirm(`Show ${selectedIds.length} selected posts?`)) return
    for (const wpId of selectedIds) {
      const post = posts.find(p => p.wordpress_id === wpId)
      if (post) {
        await fetch('/api/blog-visibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'toggle',
            wordpress_id: post.wordpress_id,
            slug: post.slug,
            title: post.title,
          }),
        })
      }
    }
    setSelectedIds([])
    setSelectAll(false)
    fetchPosts()
    alert('Selected posts shown!')
  }

  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))]
  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  )

  const visibleCount = posts.filter(p => p.is_visible).length

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-black">Blog Visibility</h2>
            <button
              onClick={syncPosts}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-3 py-1 rounded-lg text-xs transition-colors"
            >
              Sync from WordPress
            </button>
          </div>
          <p className="text-sm text-gray-500">{visibleCount} of {posts.length} posts visible on site</p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <button onClick={bulkHide} className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              Hide Selected ({selectedIds.length})
            </button>
            <button onClick={bulkShow} className="bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              Show Selected
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts by title or category..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSearch('')}
          className={`px-3 py-1 rounded-full text-sm font-medium ${search === '' ? 'bg-red-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All ({posts.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSearch(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${search === cat ? 'bg-red-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {cat} ({posts.filter(p => p.category === cat).length})
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-2">
        {filteredPosts.length === 0 && (
          <p className="text-gray-500 text-center py-8">No posts found</p>
        )}
        {filteredPosts.map((post) => (
          <div key={post.wordpress_id} className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedIds.includes(post.wordpress_id)}
              onChange={() => toggleSelect(post.wordpress_id)}
              className="w-4 h-4 text-red-700 rounded"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {post.is_visible ? 'Visible' : 'Hidden'}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category}</span>
              </div>
              <p className="font-medium text-black truncate" dangerouslySetInnerHTML={{ __html: post.title }} />
            </div>
            <button
              onClick={() => toggleVisibility(post)}
              className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${post.is_visible ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}
            >
              {post.is_visible ? 'Hide' : 'Show'}
            </button>
          </div>
        ))}
      </div>

      {/* Select All */}
      {filteredPosts.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectAll && selectedIds.length === filteredPosts.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 text-red-700 rounded"
          />
          <span className="text-sm text-gray-600">Select all ({filteredPosts.length})</span>
        </div>
      )}
    </div>
  )
}

// Theme Editor Component
function ThemeEditor() {
  const [theme, setTheme] = useState({
    preset: 'default',
    header_bg: '#FFFFFF',
    header_text: '#000000',
    footer_bg: '#F9F9F9',
    footer_text: '#333333',
    primary_color: '#A61C30',
    button_text: '#FFFFFF',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const presets = [
    { id: 'default', name: 'Classic Red', header_bg: '#FFFFFF', header_text: '#000000', footer_bg: '#F9F9F9', footer_text: '#333333', primary_color: '#A61C30', button_text: '#FFFFFF' },
    { id: 'midnight', name: 'Midnight Blue', header_bg: '#1a1a2e', header_text: '#FFFFFF', footer_bg: '#16213e', footer_text: '#E8E8E8', primary_color: '#0F3460', button_text: '#FFFFFF' },
    { id: 'forest', name: 'Forest Green', header_bg: '#2D5A27', header_text: '#FFFFFF', footer_bg: '#1E3D1A', footer_text: '#E8E8E8', primary_color: '#4A7C44', button_text: '#FFFFFF' },
    { id: 'sunset', name: 'Sunset Orange', header_bg: '#FF6B35', header_text: '#FFFFFF', footer_bg: '#4A2C2A', footer_text: '#FFFFFF', primary_color: '#F7931E', button_text: '#FFFFFF' },
    { id: 'minimal', name: 'Minimal Black', header_bg: '#000000', header_text: '#FFFFFF', footer_bg: '#111111', footer_text: '#CCCCCC', primary_color: '#333333', button_text: '#FFFFFF' },
  ]

  // Calculate luminance to determine if text should be light or dark
  const getContrastColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  const applyPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    if (preset) {
      setTheme({
        preset: presetId,
        header_bg: preset.header_bg,
        header_text: preset.header_text,
        footer_bg: preset.footer_bg,
        footer_text: preset.footer_text,
        primary_color: preset.primary_color,
        button_text: preset.button_text,
      })
    }
  }

  const updateColor = (key: string, value: string) => {
    const newTheme = { ...theme, [key]: value, preset: 'custom' }
    // Auto-adjust text color if changing a background color
    if (key === 'header_bg') {
      newTheme.header_text = getContrastColor(value)
    } else if (key === 'footer_bg') {
      newTheme.footer_text = getContrastColor(value)
    }
    setTheme(newTheme)
  }

  const saveTheme = async () => {
    setSaving(true)
    setMessage('')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    for (const [key, value] of Object.entries(theme)) {
      await supabase
        .from('site_settings')
        .upsert({ key: `theme_${key}`, value }, { onConflict: 'key' })
    }

    setSaving(false)
    setMessage('Theme saved successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const previewStyles = {
    header: { backgroundColor: theme.header_bg, color: theme.header_text },
    footer: { backgroundColor: theme.footer_bg, color: theme.footer_text },
    button: { backgroundColor: theme.primary_color, color: theme.button_text },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-black">Site Theme</h2>
          <p className="text-sm text-gray-500">Customize the look and feel of your site</p>
        </div>
        <button
          onClick={saveTheme}
          disabled={saving}
          className="bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {saving ? 'Saving...' : 'Save Theme'}
        </button>
      </div>

      {message && <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">{message}</div>}

      {/* Presets */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <h3 className="text-lg font-bold text-black mb-4">Style Presets</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {presets.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`p-3 rounded-lg border-2 transition-all ${theme.preset === preset.id ? 'border-red-700' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex gap-1 mb-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.header_bg }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primary_color }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.footer_bg }} />
              </div>
              <p className="text-xs font-medium text-black">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <h3 className="text-lg font-bold text-black mb-4">Custom Colors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Header Background</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.header_bg}
                onChange={(e) => updateColor('header_bg', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={theme.header_bg}
                onChange={(e) => updateColor('header_bg', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-black text-sm font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Text: {theme.header_text}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Footer Background</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.footer_bg}
                onChange={(e) => updateColor('footer_bg', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={theme.footer_bg}
                onChange={(e) => updateColor('footer_bg', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-black text-sm font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Text: {theme.footer_text}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color (Buttons)</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.primary_color}
                onChange={(e) => updateColor('primary_color', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={theme.primary_color}
                onChange={(e) => updateColor('primary_color', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-black text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.button_text}
                onChange={(e) => updateColor('button_text', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={theme.button_text}
                onChange={(e) => updateColor('button_text', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-black text-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <h3 className="text-lg font-bold text-black mb-4">Preview</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Mini header */}
          <div style={previewStyles.header} className="px-4 py-3 flex items-center justify-between">
            <div className="font-bold text-sm">THE HOMEOWNERSHIP COMMUNITY</div>
            <div className="flex gap-2 text-xs">
              <span>Blog</span>
              <span>About</span>
              <span>Resources</span>
            </div>
          </div>
          {/* Mini content */}
          <div className="bg-gray-50 px-4 py-6">
            <div className="h-4 w-32 bg-gray-300 rounded mb-2" />
            <div className="h-3 w-48 bg-gray-200 rounded mb-4" />
            <button style={previewStyles.button} className="px-4 py-2 rounded text-sm font-medium">
              Join the Community
            </button>
          </div>
          {/* Mini footer */}
          <div style={previewStyles.footer} className="px-4 py-3 text-xs">
            <p>&copy; 2024 The Homeownership Community</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Events Manager Component
function EventsManager() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', event_date: '', event_url: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
    setEvents(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      title: form.title,
      description: form.description,
      event_date: form.event_date,
      event_url: form.event_url,
    }

    if (editingId) {
      await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...payload }),
      })
    } else {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    setForm({ title: '', description: '', event_date: '', event_url: '' })
    setShowForm(false)
    setEditingId(null)
    setSaving(false)
    fetchEvents()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return
    await fetch('/api/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchEvents()
  }

  const handleEdit = (event: any) => {
    setForm({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date ? event.event_date.slice(0, 16) : '',
      event_url: event.event_url || '',
    })
    setEditingId(event.id)
    setShowForm(true)
  }

  const handleToggleActive = async (event: any) => {
    await fetch('/api/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: event.id, is_active: !event.is_active }),
    })
    fetchEvents()
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-black">Events & Webinars</h2>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: '', description: '', event_date: '', event_url: '' }); }}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Add Event
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h3 className="text-lg font-bold text-black mb-4">
            {editingId ? 'Edit Event' : 'New Event'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                placeholder="Event title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event URL (optional)</label>
              <input
                type="url"
                value={form.event_url}
                onChange={(e) => setForm({ ...form, event_url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                placeholder="https://zoom.us/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                placeholder="Event description..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {events.length === 0 && (
          <p className="text-gray-500 text-center py-8">No events yet. Add your first one!</p>
        )}
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-xl shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${event.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {event.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(event.event_date).toLocaleDateString()} at {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="font-bold text-black">{event.title}</h3>
                {event.description && <p className="text-sm text-gray-600 mt-1">{event.description}</p>}
                {event.event_url && (
                  <a href={event.event_url} target="_blank" rel="noopener noreferrer" className="text-sm text-red-700 hover:text-red-800 mt-2 inline-block">
                    Join Event →
                  </a>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleToggleActive(event)}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  {event.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleEdit(event)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Media Library Component
function MediaLibrary() {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', type: 'image', size: 0 })
  const [uploadUrl, setUploadUrl] = useState('')

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
    setMedia(data || [])
    setLoading(false)
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.url) return

    setUploading(true)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase
      .from('media')
      .insert([{ name: form.name, url: form.url, type: form.type, size: form.size }])

    setForm({ name: '', url: '', type: 'image', size: 0 })
    setUploadUrl('')
    setShowForm(false)
    setUploading(false)
    fetchMedia()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media item?')) return

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.from('media').delete().eq('id', id)
    fetchMedia()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('URL copied to clipboard!')
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-black">Media Library</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Media'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h3 className="text-lg font-bold text-black mb-4">Add Media from URL</h3>
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                placeholder="Image or PDF name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                required
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
              >
                <option value="image">Image</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {uploading ? 'Adding...' : 'Add Media'}
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {media.length === 0 && (
          <p className="text-gray-500 text-center py-8">No media items yet. Add your first one!</p>
        )}
        {media.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.name} className="h-20 w-auto rounded mb-2" />
                ) : (
                  <div className="h-20 w-20 bg-red-100 rounded flex items-center justify-center mb-2">
                    <span className="text-red-700 font-bold text-sm">PDF</span>
                  </div>
                )}
                <p className="font-semibold text-black">{item.name}</p>
                <p className="text-sm text-gray-500 break-all">{item.url}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(item.url)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Subscribers Manager Component
function SubscribersManager() {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    const res = await fetch('/api/subscribers')
    const data = await res.json()
    setSubscribers(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const exportToCSV = () => {
    setExporting(true)
    const rows = [['Email', 'Subscribed At', 'Status']]
    subscribers.forEach((sub: any) => {
      rows.push([sub.email, new Date(sub.subscribed_at).toLocaleDateString(), sub.is_active ? 'Active' : 'Inactive'])
    })
    const csvContent = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    setExporting(false)
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-black">Email Subscribers</h2>
          <p className="text-sm text-gray-500">{subscribers.length} total subscribers</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={exporting || subscribers.length === 0}
          className="bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Subscribed</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No subscribers yet</td>
                </tr>
              )}
              {subscribers.map((sub: any) => (
                <tr key={sub.id}>
                  <td className="px-4 py-3 text-sm text-black">{sub.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(sub.subscribed_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${sub.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {sub.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Testimonials Editor Component
function TestimonialsEditor() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', quote: '', role: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
    setTestimonials(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    if (editingId) {
      await supabase
        .from('testimonials')
        .update({ name: form.name, quote: form.quote, role: form.role })
        .eq('id', editingId)
    } else {
      await supabase
        .from('testimonials')
        .insert([{ name: form.name, quote: form.quote, role: form.role }])
    }

    setForm({ name: '', quote: '', role: '' })
    setShowForm(false)
    setEditingId(null)
    setSaving(false)
    fetchTestimonials()
    alert('Testimonial saved successfully!')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase
      .from('testimonials')
      .update({ is_active: false })
      .eq('id', id)
    fetchTestimonials()
  }

  const handleEdit = (testimonial: any) => {
    setForm({ name: testimonial.name, quote: testimonial.quote, role: testimonial.role || '' })
    setEditingId(testimonial.id)
    setShowForm(true)
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-black">Customer Testimonials</h2>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', quote: '', role: '' }); }}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Add Testimonial
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h3 className="text-lg font-bold text-black mb-4">
            {editingId ? 'Edit Testimonial' : 'New Testimonial'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                placeholder="John D."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                placeholder="First-time Homeowner"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
              <textarea
                required
                rows={3}
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                placeholder="What they said..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {testimonials.length === 0 && (
          <p className="text-gray-500 text-center py-8">No testimonials yet. Add your first one!</p>
        )}
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white rounded-xl shadow p-4 sm:p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="text-gray-800 italic mb-2">"{t.quote}"</p>
                <p className="font-semibold text-black">{t.name}</p>
                {t.role && <p className="text-sm text-gray-500">{t.role}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(t)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Podcast Editor Component
function PodcastEditor() {
  const [episodes, setEpisodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', youtube_url: '', episode_number: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEpisodes()
  }, [])

  const fetchEpisodes = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from('podcast_episodes')
      .select('*')
      .order('episode_number', { ascending: true })
    setEpisodes(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const payload = {
      title: form.title,
      description: form.description,
      youtube_url: form.youtube_url,
      episode_number: parseInt(form.episode_number) || null,
    }

    if (editingId) {
      await supabase
        .from('podcast_episodes')
        .update(payload)
        .eq('id', editingId)
    } else {
      await supabase
        .from('podcast_episodes')
        .insert([payload])
    }

    setForm({ title: '', description: '', youtube_url: '', episode_number: '' })
    setShowForm(false)
    setEditingId(null)
    setSaving(false)
    fetchEpisodes()
    alert('Episode saved successfully!')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this episode?')) return

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase
      .from('podcast_episodes')
      .delete()
      .eq('id', id)
    fetchEpisodes()
  }

  const handleToggleVisibility = async (episode: any) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase
      .from('podcast_episodes')
      .update({ is_visible: !episode.is_visible })
      .eq('id', episode.id)
    fetchEpisodes()
  }

  const handleEdit = (episode: any) => {
    setForm({
      title: episode.title,
      description: episode.description || '',
      youtube_url: episode.youtube_url,
      episode_number: episode.episode_number?.toString() || '',
    })
    setEditingId(episode.id)
    setShowForm(true)
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-black">Podcast Episodes</h2>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: '', description: '', youtube_url: '', episode_number: '' }); }}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Add Episode
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h3 className="text-lg font-bold text-black mb-4">
            {editingId ? 'Edit Episode' : 'New Episode'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Episode Number</label>
              <input
                type="number"
                value={form.episode_number}
                onChange={(e) => setForm({ ...form, episode_number: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                placeholder="Episode title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
              <input
                type="url"
                required
                value={form.youtube_url}
                onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                placeholder="Episode description..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {episodes.length === 0 && (
          <p className="text-gray-500 text-center py-8">No episodes yet. Add your first one!</p>
        )}
        {episodes.map((ep) => (
          <div key={ep.id} className="bg-white rounded-xl shadow p-4 sm:p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                    Ep. {ep.episode_number || '?'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${ep.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {ep.is_visible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <h3 className="font-bold text-black mt-2">{ep.title}</h3>
                {ep.description && <p className="text-sm text-gray-600 mt-1">{ep.description}</p>}
                <a
                  href={ep.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-700 hover:text-red-800 mt-2 inline-block"
                >
                  View on YouTube →
                </a>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleVisibility(ep)}
                  className={`text-sm font-medium px-3 py-1 rounded ${ep.is_visible ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                >
                  {ep.is_visible ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => handleEdit(ep)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(ep.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
