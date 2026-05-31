import { NextResponse } from 'next/server'

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://your-wordpress-site.com'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '1'
  const perPage = searchParams.get('perPage') || '6'

  try {
    const url = `${WORDPRESS_URL}/wp-json/wp/v2/posts?_embed&page=${page}&per_page=${perPage}&status=publish`
    const response = await fetch(url, {
      cache: 'no-store', // Don't cache, always fetch fresh
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10)

    return NextResponse.json({
      posts: data,
      pageInfo: {
        totalPages,
        currentPage: parseInt(page, 10),
      },
    })
  } catch (error) {
    console.error('Error fetching from WordPress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
