'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function JoinCommunityButton() {
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [primaryColor, setPrimaryColor] = useState('#A61C30')
  const [optinTitle, setOptinTitle] = useState('Join the Community')
  const [optinMessage, setOptinMessage] = useState("Fill out the form below and we'll be in touch soon.")
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })

      if (res.ok) {
        alert('Thank you for joining! We will be in touch soon.')
        setShowModal(false)
        setFormData({ firstName: '', lastName: '', email: '', phone: '' })
      } else {
        const data = await res.json()
        alert(data.message || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      alert('Failed to submit. Please try again.')
    }

    setSubmitting(false)
  }

  useEffect(() => {
    setMounted(true)
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.theme_primary_color) {
          setPrimaryColor(data.theme_primary_color)
        }
        if (data.optin_title) {
          setOptinTitle(data.optin_title)
        }
        if (data.optin_message) {
          setOptinMessage(data.optin_message)
        }
      })
      .catch(() => {})
  }, [])

  const modal = showModal ? (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 sm:pt-[10vh] overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowModal(false)}
      />
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl my-auto">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close join form"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-2xl font-bold text-black mb-2">{optinTitle}</h3>
        <p className="text-gray-600 mb-6">{optinMessage}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-colors"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-colors"
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-colors"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-colors"
              placeholder="(555) 123-4567"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full text-white font-semibold py-4 rounded-lg transition-colors mt-2 disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-white font-semibold px-6 py-3 rounded text-sm transition-opacity"
        style={{ backgroundColor: primaryColor }}
      >
        Join the Community
      </button>

      {mounted && createPortal(modal, document.body)}
    </>
  )
}
