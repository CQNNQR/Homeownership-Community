'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminLoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      // Confirm via the server. The server is the source of truth for
      // app_metadata.role (it's tamper-resistant in the JWT, not the
      // client-side user object). If the user authenticated but isn't
      // an admin, sign them out and surface a clear error.
      let checkRes = await fetch('/api/auth/check')
      let checkData = await checkRes.json().catch(() => ({ isAdmin: false, user: null }))

      // If the server says "we just granted you admin but the cookie
      // doesn't have it yet", call the refresh endpoint to mint a
      // fresh session cookie. The user typed their password on this
      // page, so re-validating it is safe (the refresh endpoint
      // re-checks the password before issuing a new session).
      if (!checkData?.isAdmin && checkData?.healed && checkData?.reason === 'role-granted-please-relogin') {
        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const refreshData = await refreshRes.json().catch(() => ({}))

        if (refreshRes.ok && refreshData?.isAdmin) {
          // Re-check to confirm the cookie state is correct.
          checkRes = await fetch('/api/auth/check')
          checkData = await checkRes.json().catch(() => ({ isAdmin: false, user: null }))
        } else {
          await supabase.auth.signOut()
          setError(
            refreshData?.error ||
              'We could not activate admin access for this account. ' +
                'Please sign out, sign back in, and try again.'
          )
          setLoading(false)
          return
        }
      }

      if (!checkData?.user) {
        await supabase.auth.signOut()
        setError('Authentication failed. Please try again.')
        setLoading(false)
        return
      }

      if (!checkData.isAdmin) {
        await supabase.auth.signOut()
        setError('Not an admin account. This account does not have admin access.')
        setLoading(false)
        return
      }

      // Use router.push instead of window.location.href so this is an SPA
      // navigation. A hard reload can tear down the page mid-flight while
      // Supabase SSR / dev-time extension messages are still pending, which
      // surfaces as: "A listener indicated an asynchronous response by
      // returning true, but the message channel closed before a response
      // was received." router.push keeps the page lifecycle clean and lets
      // the middleware re-run the auth check on the way to /admin.
      router.push('/admin')
    } catch (err) {
      console.error('Login error:', err)
      setError('Connection failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black">Site Editor Login</h1>
          <p className="text-gray-600 mt-2">Sign in to manage your site content</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-colors"
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-colors"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            Back to Website
          </a>
        </div>
      </div>
    </div>
  )
}
