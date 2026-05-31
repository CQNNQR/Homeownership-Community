'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  event_url: string
  is_active: boolean
}

export default function EventsPreview() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [primaryColor, setPrimaryColor] = useState('#A61C30')

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.theme_primary_color) {
          setPrimaryColor(data.theme_primary_color)
        }
      })
      .catch(() => {})

    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const now = new Date()
          const upcoming = data.filter(e => new Date(e.event_date) >= now)
          setEvents(upcoming.slice(0, 3))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null
  if (events.length === 0) return null

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: primaryColor }}>Upcoming</span>
            <h2 className="text-4xl font-bold text-black mt-2">Events & Webinars</h2>
          </div>
        </div>

        <div className="grid gap-6">
          {events.map(event => (
            <div key={event.id} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="text-white rounded-lg p-4 text-center min-w-[80px]" style={{ backgroundColor: primaryColor }}>
                    <div className="text-2xl font-bold">
                      {new Date(event.event_date).getDate()}
                    </div>
                    <div className="text-xs uppercase">
                      {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-black mb-1">{event.title}</h3>
                  {event.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{event.description}</p>
                  )}
                  <p className="text-gray-500 text-sm">
                    {new Date(event.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {event.event_url && (
                  <div className="flex-shrink-0">
                    <a
                      href={event.event_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Register
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
