'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase'

export default function SiteEditor() {
  const [user, setUser] = useState<{ email: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('settings')
  // Inline, user-visible error messages for the Site Settings section.
  const [errors, setErrors] = useState<string[]>([])

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
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check')
        const data = await res.json()
        if (!data.user) {
          window.location.href = '/admin/login'
          return
        }
        if (!data.isAdmin) {
          window.location.href = '/'
          return
        }
        setUser(data.user)
        setLoading(false)
      } catch {
        window.location.href = '/admin/login'
      }
    }
    checkAuth()
  }, [])

  // Fetch settings when the Settings tab mounts (also re-fetches on
  // every section change so edits in other tabs that touch settings
  // are reflected). GET /api/settings is public (the keys are all
  // public-by-nature: theme, social, hero, footer, SEO); POST stays
  // admin-gated server-side. Auth is enforced by /api/auth/check on
  // the page-mount useEffect above and by the server on POST, so anon
  // users cannot mutate site_settings.
  useEffect(() => {
    if (activeSection === 'settings') {
      fetchSettings()
    }
  }, [activeSection])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { credentials: 'include' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrors([`Failed to load settings: ${data.error || res.statusText}`])
        return
      }
      const data = await res.json()
      setSettings(prev => ({ ...prev, ...data }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setErrors([`Failed to load settings: ${msg}`])
    }
  }

  const handleLogout = async () => {
    // Use the module-level Supabase singleton so we don't create a
    // second GoTrueClient and trigger the "Multiple GoTrueClient
    // instances" warning.
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const saveSettings = async () => {
    setSaving(true)
    setSaveMessage('')
    setErrors([])

    // Build the array form expected by POST /api/settings.
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: value == null ? '' : String(value),
    }))

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        // Surface the server's error message inline instead of
        // logging it to the console where the user can't see it.
        const data = await res.json().catch(() => ({}))
        const message = data.error || `Save failed (HTTP ${res.status})`
        setErrors([message])
        setSaving(false)
        return
      }

      const data = await res.json().catch(() => ({}))
      const count = typeof data.count === 'number' ? data.count : updates.length
      setSaveMessage(`Settings saved successfully! (${count} key${count === 1 ? '' : 's'} updated)`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setErrors([`Save failed: ${msg}`])
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(''), 5000)
    }
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
            {errors.length > 0 && (
              <div
                role="alert"
                data-testid="settings-errors"
                className="bg-red-50 border border-red-300 text-red-800 rounded-lg px-4 py-3"
              >
                <p className="font-semibold text-sm mb-1">
                  {errors.length === 1 ? 'Error' : `${errors.length} errors`}
                </p>
                <ul className="list-disc list-inside text-sm space-y-0.5">
                  {errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

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

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="w-full sm:w-auto bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              {saveMessage && (
                <div
                  role="status"
                  data-testid="settings-save-message"
                  className="bg-green-100 border border-green-300 text-green-800 rounded-lg px-4 py-2 text-sm font-medium"
                >
                  {saveMessage}
                </div>
              )}
            </div>
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
    // The /api/books GET is public (filters is_active=true) and the
    // editor's session is authed by the proxy, so we use the public
    // path here. If the editor ever needs to see inactive rows, the
    // server-side admin override can be added later.
    const res = await fetch('/api/books')
    const data = await res.json()
    setBooks(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const res = await fetch('/api/books', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Failed to save: ${data.error || `HTTP ${res.status}`}`)
      setSaving(false)
      return
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
    const res = await fetch('/api/books', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Failed to delete: ${data.error || `HTTP ${res.status}`}`)
      return
    }
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

// Blog Manager Component - Visibility + Local CRUD
function BlogManager() {
  const [blogTab, setBlogTab] = useState<'wordpress' | 'local'>('wordpress')

  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const [localPosts, setLocalPosts] = useState<any[]>([])
  const [localLoading, setLocalLoading] = useState(true)
  const [showLocalForm, setShowLocalForm] = useState(false)
  const [editingLocalId, setEditingLocalId] = useState<string | null>(null)
  const [localSaving, setLocalSaving] = useState(false)
  const [localError, setLocalError] = useState('')
  const emptyLocalForm = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    author_name: 'Brandon Bee Dixon',
    category: 'General',
    tagsString: '',
    reading_time_minutes: 5,
    is_published: false,
    is_featured: false,
    published_at: '',
  }
  const [localForm, setLocalForm] = useState(emptyLocalForm)

  useEffect(() => {
    fetchPosts()
    fetchLocalPosts()
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

  const fetchLocalPosts = async () => {
    try {
      const response = await fetch('/api/blog-posts?all=true')
      const data = await response.json()
      if (!response.ok) {
        setLocalError(data?.error || 'Failed to load posts')
        setLocalPosts([])
      } else {
        setLocalError('')
        setLocalPosts(data || [])
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to load posts')
      setLocalPosts([])
    }
    setLocalLoading(false)
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

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const openLocalForm = (post: any = null) => {
    if (post) {
      setLocalForm({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        featured_image_url: post.featured_image_url || '',
        author_name: post.author_name || 'Brandon Bee Dixon',
        category: post.category || 'General',
        tagsString: Array.isArray(post.tags) ? post.tags.join(', ') : '',
        reading_time_minutes: post.reading_time_minutes ?? 5,
        is_published: !!post.is_published,
        is_featured: !!post.is_featured,
        published_at: post.published_at ? post.published_at.slice(0, 16) : '',
      })
      setEditingLocalId(post.id)
    } else {
      setLocalForm(emptyLocalForm)
      setEditingLocalId(null)
    }
    setLocalError('')
    setShowLocalForm(true)
  }

  const closeLocalForm = () => {
    setShowLocalForm(false)
    setEditingLocalId(null)
    setLocalError('')
  }

  const handleLocalTitleChange = (value: string) => {
    setLocalForm(prev => {
      const auto = !prev.slug || prev.slug === slugify(prev.title)
      const next = { ...prev, title: value }
      if (auto) next.slug = slugify(value)
      return next
    })
  }

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalSaving(true)
    setLocalError('')

    const tags = localForm.tagsString
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const payload: any = {
      title: localForm.title,
      slug: localForm.slug.trim() || undefined,
      excerpt: localForm.excerpt.trim() || null,
      content: localForm.content,
      featured_image_url: localForm.featured_image_url.trim() || null,
      author_name: localForm.author_name.trim() || 'Brandon Bee Dixon',
      category: localForm.category.trim() || 'General',
      tags,
      reading_time_minutes: Number(localForm.reading_time_minutes) || 5,
      is_published: localForm.is_published,
      is_featured: localForm.is_featured,
      published_at: localForm.published_at
        ? new Date(localForm.published_at).toISOString()
        : null,
    }

    if (editingLocalId) {
      payload.id = editingLocalId
    }

    try {
      const response = await fetch('/api/blog-posts', {
        method: editingLocalId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        setLocalError(data?.error || 'Failed to save post')
        setLocalSaving(false)
        return
      }
      closeLocalForm()
      await fetchLocalPosts()
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to save post')
    } finally {
      setLocalSaving(false)
    }
  }

  const handleLocalDelete = async (id: string) => {
    if (!confirm('Delete this blog post? This cannot be undone.')) return
    setLocalError('')
    try {
      const response = await fetch('/api/blog-posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await response.json()
      if (!response.ok) {
        setLocalError(data?.error || 'Failed to delete post')
        return
      }
      await fetchLocalPosts()
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to delete post')
    }
  }

  const categories = [...new Set(posts.map(p => p.category).filter(Boolean))]
  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  )

  const visibleCount = posts.filter(p => p.is_visible).length

  const publishedCount = localPosts.filter(p => p.is_published).length
  const draftCount = localPosts.length - publishedCount

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setBlogTab('wordpress')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              blogTab === 'wordpress'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            WordPress Visibility
          </button>
          <button
            type="button"
            onClick={() => setBlogTab('local')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              blogTab === 'local'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Local Blog Posts
          </button>
        </nav>
      </div>

      {blogTab === 'wordpress' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
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

              <div className="bg-white rounded-xl shadow p-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search posts by title or category..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                />
              </div>

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
            </>
          )}
        </div>
      )}

      {blogTab === 'local' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-black">Local Blog Posts</h2>
              <p className="text-sm text-gray-500">
                {localLoading ? 'Loading…' : `${publishedCount} published, ${draftCount} draft${draftCount === 1 ? '' : 's'} of ${localPosts.length}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openLocalForm()}
              className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              + Add Post
            </button>
          </div>

          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
              {localError}
            </div>
          )}

          {showLocalForm && (
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h3 className="text-lg font-bold text-black mb-4">
                {editingLocalId ? 'Edit Post' : 'New Post'}
              </h3>
              <form onSubmit={handleLocalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={localForm.title}
                    onChange={(e) => handleLocalTitleChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                    placeholder="Post title..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={localForm.slug}
                      onChange={(e) => setLocalForm({ ...localForm, slug: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                      placeholder="auto-generated-from-title"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank to auto-generate from title.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={localForm.category}
                      onChange={(e) => setLocalForm({ ...localForm, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                      placeholder="General"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea
                    rows={2}
                    value={localForm.excerpt}
                    onChange={(e) => setLocalForm({ ...localForm, excerpt: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                    placeholder="Short summary shown in the blog list..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    required
                    rows={8}
                    value={localForm.content}
                    onChange={(e) => setLocalForm({ ...localForm, content: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700 font-mono text-sm"
                    placeholder="Write your post (markdown / HTML)..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                    <input
                      type="text"
                      value={localForm.author_name}
                      onChange={(e) => setLocalForm({ ...localForm, author_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                      placeholder="Brandon Bee Dixon"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
                    <input
                      type="url"
                      value={localForm.featured_image_url}
                      onChange={(e) => setLocalForm({ ...localForm, featured_image_url: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={localForm.tagsString}
                      onChange={(e) => setLocalForm({ ...localForm, tagsString: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                      placeholder="real-estate, first-time-buyer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reading Time (minutes)</label>
                    <input
                      type="number"
                      min={1}
                      value={localForm.reading_time_minutes}
                      onChange={(e) => setLocalForm({ ...localForm, reading_time_minutes: parseInt(e.target.value) || 5 })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Published At</label>
                  <input
                    type="datetime-local"
                    value={localForm.published_at}
                    onChange={(e) => setLocalForm({ ...localForm, published_at: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-red-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Required when published. Defaults to now on save.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={localForm.is_published}
                      onChange={(e) => setLocalForm({ ...localForm, is_published: e.target.checked })}
                      className="w-4 h-4 text-red-700 rounded"
                    />
                    Published
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={localForm.is_featured}
                      onChange={(e) => setLocalForm({ ...localForm, is_featured: e.target.checked })}
                      className="w-4 h-4 text-red-700 rounded"
                    />
                    Featured
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    disabled={localSaving}
                    className="bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    {localSaving ? 'Saving...' : editingLocalId ? 'Update Post' : 'Create Post'}
                  </button>
                  <button
                    type="button"
                    onClick={closeLocalForm}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-2">
            {localLoading ? (
              <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">Loading posts...</div>
            ) : localPosts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No posts yet. Click "Add Post" to create your first one.</p>
            ) : (
              localPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {post.is_published ? 'Published' : 'Draft'}
                        </span>
                        {post.is_featured && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Featured</span>
                        )}
                        {post.category && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category}</span>
                        )}
                        {post.reading_time_minutes != null && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.reading_time_minutes} min read</span>
                        )}
                      </div>
                      <h3 className="font-bold text-black truncate">{post.title}</h3>
                      {post.excerpt && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.excerpt}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        /{post.slug}
                        {post.published_at && ` · ${new Date(post.published_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openLocalForm(post)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLocalDelete(post.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Theme Editor Component
function ThemeEditor() {
  const [theme, setTheme] = useState({
    preset: '',
    header_bg: '',
    header_text: '',
    footer_bg: '',
    footer_text: '',
    primary_color: '',
    button_text: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const presets = [
    { id: 'default', name: 'Classic Red', header_bg: '#FFFFFF', header_text: '#000000', footer_bg: '#F9F9F9', footer_text: '#333333', primary_color: '#A61C30', button_text: '#FFFFFF' },
    { id: 'midnight', name: 'Midnight Blue', header_bg: '#1a1a2e', header_text: '#FFFFFF', footer_bg: '#16213e', footer_text: '#E8E8E8', primary_color: '#0F3460', button_text: '#FFFFFF' },
    { id: 'forest', name: 'Forest Green', header_bg: '#2D5A27', header_text: '#FFFFFF', footer_bg: '#1E3D1A', footer_text: '#E8E8E8', primary_color: '#4A7C44', button_text: '#FFFFFF' },
    { id: 'sunset', name: 'Sunset Orange', header_bg: '#FF6B35', header_text: '#FFFFFF', footer_bg: '#4A2C2A', footer_text: '#FFFFFF', primary_color: '#F7931E', button_text: '#FFFFFF' },
    { id: 'minimal', name: 'Minimal Black', header_bg: '#000000', header_text: '#FFFFFF', footer_bg: '#111111', footer_text: '#CCCCCC', primary_color: '#333333', button_text: '#FFFFFF' },
  ]

  const defaults = {
    preset: 'default',
    header_bg: '#FFFFFF',
    header_text: '#000000',
    footer_bg: '#F9F9F9',
    footer_text: '#333333',
    primary_color: '#A61C30',
    button_text: '#FFFFFF',
  }

  useEffect(() => {
    // Fetch theme_* keys from the admin-gated /api/settings endpoint
    // so we never read site_settings through the anon Supabase client.
    // The form is blocked (loading=true) until this resolves.
    const fetchTheme = async () => {
      try {
        const res = await fetch('/api/settings', { credentials: 'include' })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setMessage(`Failed to load theme: ${data.error || res.statusText}`)
          setTheme(defaults)
          setLoading(false)
          return
        }
        const data: Record<string, string> = await res.json()
        const fromDb: Record<string, string> = {}
        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith('theme_')) {
            fromDb[key.replace(/^theme_/, '')] = value
          }
        }
        setTheme(prev => ({ ...defaults, ...prev, ...fromDb }))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setMessage(`Failed to load theme: ${msg}`)
        setTheme(defaults)
      } finally {
        setLoading(false)
      }
    }
    fetchTheme()
  }, [])

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

    // Build the array form: [{ key: 'theme_xxx', value: '...' }, ...]
    // and POST to /api/settings in a single request. This matches the
    // exact key names the rest of the app reads (theme_header_bg
    // etc.) so we no longer fight the header_bg vs theme_header_bg
    // mismatch on first save.
    const updates = Object.entries(theme).map(([key, value]) => ({
      key: `theme_${key}`,
      value: value == null ? '' : String(value),
    }))

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setMessage(`Failed to save theme: ${data.error || `HTTP ${res.status}`}`)
        return
      }

      const data = await res.json().catch(() => ({}))
      const count = typeof data.count === 'number' ? data.count : updates.length
      setMessage(`Theme saved successfully! (${count} key${count === 1 ? '' : 's'} updated)`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setMessage(`Failed to save theme: ${msg}`)
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const previewStyles = {
    header: { backgroundColor: theme.header_bg, color: theme.header_text },
    footer: { backgroundColor: theme.footer_bg, color: theme.footer_text },
    button: { backgroundColor: theme.primary_color, color: theme.button_text },
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <p className="text-gray-500">Loading theme settings...</p>
      </div>
    )
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

      {message && (
        <div
          role="status"
          data-testid="theme-save-message"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            message.toLowerCase().includes('fail')
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-green-100 text-green-800 border border-green-300'
          }`}
        >
          {message}
        </div>
      )}

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
    // /api/events GET is public (filters is_active=true). The editor
    // uses the public path; if it ever needs to see inactive rows,
    // the admin override can be added later.
    const res = await fetch('/api/events')
    const data = await res.json()
    setEvents(Array.isArray(data) ? data : [])
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

    const res = await fetch('/api/events', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Failed to save: ${data.error || `HTTP ${res.status}`}`)
      setSaving(false)
      return
    }

    setForm({ title: '', description: '', event_date: '', event_url: '' })
    setShowForm(false)
    setEditingId(null)
    setSaving(false)
    fetchEvents()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return
    const res = await fetch('/api/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Failed to delete: ${data.error || `HTTP ${res.status}`}`)
      return
    }
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
    const res = await fetch('/api/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: event.id, is_active: !event.is_active }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Failed to update: ${data.error || `HTTP ${res.status}`}`)
      return
    }
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
    // Use the admin-gated GET on /api/media so the anon Supabase
    // client never reads from a server-side-gated table. The route
    // is admin-only, so credentials must be included.
    const res = await fetch('/api/media', { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) {
      setMedia([])
    } else {
      setMedia(Array.isArray(data) ? data : [])
    }
    setLoading(false)
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.url) return

    setUploading(true)

    const res = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: form.name,
        url: form.url,
        type: form.type,
        size: form.size,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Failed to add media: ${data.error || `HTTP ${res.status}`}`)
      setUploading(false)
      return
    }

    setForm({ name: '', url: '', type: 'image', size: 0 })
    setUploadUrl('')
    setShowForm(false)
    setUploading(false)
    fetchMedia()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media item?')) return

    const res = await fetch('/api/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Failed to delete: ${data.error || `HTTP ${res.status}`}`)
      return
    }
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
  const [showZapier, setShowZapier] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
    const rows = [['First Name', 'Last Name', 'Email', 'Phone', 'Subscribed At', 'Status']]
    subscribers.forEach((sub: any) => {
      rows.push([
        sub.first_name || '',
        sub.last_name || '',
        sub.email,
        sub.phone || '',
        new Date(sub.subscribed_at).toLocaleDateString(),
        sub.is_active ? 'Active' : 'Inactive',
      ])
    })
    const csvContent = rows.map(r => r.map(cell => {
      const s = String(cell ?? '')
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')).join('\n')
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            disabled={exporting || subscribers.length === 0}
            className="bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => setShowZapier(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors inline-flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Zapier
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Phone</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Subscribed</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No subscribers yet</td>
                </tr>
              )}
              {subscribers.map((sub: any) => {
                const fullName = [sub.first_name, sub.last_name].filter(Boolean).join(' ')
                return (
                  <tr key={sub.id}>
                    <td className="px-4 py-3 text-sm text-black">{fullName || '—'}</td>
                    <td className="px-4 py-3 text-sm text-black">{sub.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sub.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(sub.subscribed_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${sub.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {sub.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {mounted && showZapier && createPortal(
        <ZapierConfigModal
          onClose={() => { setShowZapier(false); fetchSubscribers() }}
        />,
        document.body
      )}
    </div>
  )
}

function ZapierConfigModal({ onClose }: { onClose: () => void }) {
  // Zapier config reads/writes a small set of site_settings keys
  // (zapier_webhook_url, zapier_last_sent_at, zapier_last_result).
  // All access goes through the admin-gated /api/settings endpoint
  // so the anon Supabase client never touches site_settings.
  const [webhookUrl, setWebhookUrl] = useState('')
  const [initialUrl, setInitialUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState('')
  const [testResult, setTestResult] = useState<{ ok: boolean; status?: number; error?: string } | null>(null)
  const [lastSentAt, setLastSentAt] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/settings', { credentials: 'include' })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setMessage(`Failed to load: ${data.error || res.statusText}`)
          return
        }
        const data: Record<string, string> = await res.json()
        const url = data.zapier_webhook_url || ''
        setWebhookUrl(url)
        setInitialUrl(url)
        setLastSentAt(data.zapier_last_sent_at || null)
        setLastResult(data.zapier_last_result || null)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setMessage(`Failed to load: ${msg}`)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const persistSetting = async (key: string, value: string | null) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify([{ key, value: value ?? '' }]),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `HTTP ${res.status}`)
    }
  }

  // persistMeta used to be a fire-and-forget upsert; preserve that
  // semantic so the test handler can keep calling it without await
  // errors leaking out. We just log failures to the inline message.
  const persistMeta = async (key: string, value: string | null) => {
    try {
      await persistSetting(key, value)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setMessage(`Failed to persist ${key}: ${msg}`)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const value = webhookUrl.trim()
    if (value && !/^https?:\/\//i.test(value)) {
      setMessage('Webhook URL must start with http:// or https://')
      setSaving(false)
      return
    }

    try {
      await persistSetting('zapier_webhook_url', value)
      setInitialUrl(value)
      setMessage(value ? 'Webhook saved.' : 'Webhook cleared.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setMessage(`Failed to save: ${msg}`)
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleClear = async () => {
    setSaving(true)
    setMessage('')
    try {
      await persistSetting('zapier_webhook_url', '')
      setWebhookUrl('')
      setInitialUrl('')
      setMessage('Webhook cleared.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setMessage(`Failed to clear: ${msg}`)
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleTest = async () => {
    const value = webhookUrl.trim()
    if (!value) {
      setTestResult({ ok: false, error: 'Save a webhook URL first.' })
      return
    }
    if (!/^https?:\/\//i.test(value)) {
      setTestResult({ ok: false, error: 'Webhook URL must start with http:// or https://' })
      return
    }

    setTesting(true)
    setTestResult(null)
    setMessage('')

    const payload = {
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'Lead',
      phone: '+15555550100',
      source: 'admin_test',
      created_at: new Date().toISOString(),
      note: 'This is a test lead from the Homeownership Community admin.',
    }

    try {
      const res = await fetch(value, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const text = await res.text().catch(() => '')
      setTestResult({ ok: res.ok, status: res.status, error: res.ok ? undefined : (text || `HTTP ${res.status}`) })
      const nowIso = new Date().toISOString()
      setLastSentAt(nowIso)
      const resultLabel = res.ok ? `OK (${res.status})` : `Failed (${res.status})`
      setLastResult(resultLabel)
      await persistMeta('zapier_last_sent_at', nowIso)
      await persistMeta('zapier_last_result', resultLabel)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setTestResult({ ok: false, error: errorMsg })
      const nowIso = new Date().toISOString()
      setLastSentAt(nowIso)
      setLastResult(`Error: ${errorMsg}`)
      await persistMeta('zapier_last_sent_at', nowIso)
      await persistMeta('zapier_last_result', `Error: ${errorMsg}`)
    } finally {
      setTesting(false)
    }
  }

  const isConfigured = initialUrl.length > 0

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 text-white w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-black">Zapier Integration</h2>
              <p className="text-xs text-gray-500">Send leads to GoHighLevel or any other CRM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${isConfigured ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
              {isConfigured ? 'Connected' : 'Not configured'}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-6 text-gray-500 text-sm">Loading...</div>
          ) : (
            <>
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black text-sm font-mono focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    inputMode="url"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                    In Zapier: create a Zap with <strong>Webhooks by Zapier</strong> (Catch Hook) as the trigger, copy the URL, then add a <strong>GoHighLevel</strong> &ldquo;Create Contact&rdquo; action mapped to the fields below.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={testing || !webhookUrl.trim()}
                    className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    {testing ? 'Sending...' : 'Send Test Lead'}
                  </button>
                  {isConfigured && (
                    <button
                      type="button"
                      onClick={handleClear}
                      disabled={saving}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>

              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                  {message}
                </div>
              )}

              {testResult && (
                <div className={`px-3 py-2 rounded-lg text-sm ${testResult.ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {testResult.ok
                    ? `Test lead sent${testResult.status ? ` (HTTP ${testResult.status})` : ''}. Check your Zap or GoHighLevel.`
                    : `Failed${testResult.status ? ` (HTTP ${testResult.status})` : ''}: ${testResult.error || 'Unknown error'}`}
                </div>
              )}

              {(lastSentAt || lastResult) && (
                <div className="text-xs text-gray-500 space-y-0.5 pt-2 border-t border-gray-100">
                  {lastSentAt && <p>Last test: {new Date(lastSentAt).toLocaleString()}</p>}
                  {lastResult && (
                    <p>
                      Last result:{' '}
                      <span className={lastResult.startsWith('OK') ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                        {lastResult}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <details className="bg-gray-50 rounded-lg p-3 text-sm">
                <summary className="cursor-pointer font-medium text-gray-700 select-none">
                  Payload reference
                </summary>
                <pre className="bg-gray-900 text-gray-100 rounded p-3 text-xs overflow-x-auto font-mono mt-2">{`{
  "email": "jane@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "phone": "+15555550100",
  "source": "nav_modal",
  "created_at": "2026-06-08T15:30:00.000Z"
}`}</pre>
                <p className="text-xs text-gray-500 mt-2">
                  <code className="bg-gray-100 px-1 rounded">source</code> is <code className="bg-gray-100 px-1 rounded">nav_modal</code> for the navigation &ldquo;Join Community&rdquo; form.
                </p>
              </details>
            </>
          )}
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
    // Use the admin-gated GET on /api/testimonials so the anon
    // Supabase client never has to read from a server-side-gated
    // table directly. The route is admin-only, so credentials must
    // be included so the session cookie rides along.
    const res = await fetch('/api/testimonials?all=1', { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) {
      setTestimonials([])
    } else {
      setTestimonials(Array.isArray(data) ? data : [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      name: form.name,
      quote: form.quote,
      role: form.role,
      is_active: true,
    }

    const res = await fetch('/api/testimonials', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Failed to save: ${data.error || `HTTP ${res.status}`}`)
      setSaving(false)
      return
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

    const res = await fetch('/api/testimonials', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Failed to delete: ${data.error || `HTTP ${res.status}`}`)
      return
    }
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
    // Use the admin-gated GET on /api/podcast?all=1 so the anon
    // Supabase client never has to read from a server-side-gated
    // table directly. The route is admin-only, so credentials must
    // be included so the session cookie rides along.
    const res = await fetch('/api/podcast?all=1', { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) {
      setEpisodes([])
    } else {
      const list = Array.isArray(data) ? data : []
      list.sort((a: any, b: any) => (a.episode_number ?? 0) - (b.episode_number ?? 0))
      setEpisodes(list)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      title: form.title,
      description: form.description,
      youtube_url: form.youtube_url,
      episode_number: parseInt(form.episode_number) || null,
      is_visible: true,
    }

    const res = await fetch('/api/podcast', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Failed to save: ${data.error || `HTTP ${res.status}`}`)
      setSaving(false)
      return
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

    const res = await fetch('/api/podcast', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Failed to delete: ${data.error || `HTTP ${res.status}`}`)
      return
    }
    fetchEpisodes()
  }

  const handleToggleVisibility = async (episode: any) => {
    const res = await fetch('/api/podcast', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: episode.id, is_visible: !episode.is_visible }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(`Failed to update: ${data.error || `HTTP ${res.status}`}`)
      return
    }
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
