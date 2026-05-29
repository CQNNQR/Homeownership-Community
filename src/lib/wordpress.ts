const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://your-wordpress-site.com';
const REST_API = `${WORDPRESS_URL}/wp-json/wp/v2`;

// WordPress REST API types
export interface WPRestPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  modified: string;
  featured_media: number;
  categories: number[];
  author: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    'wp:term'?: Array<Array<{ name: string }>>;
    author?: Array<{ name: string }>;
  };
}

export interface WPRestPostListResponse {
  headers: {
    get: (name: string) => string | null;
  };
  data: WPRestPost[];
}

export interface WPRestPageInfo {
  totalPages: number;
  currentPage: number;
}

// Helper to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Fetch posts from WordPress REST API
export async function getPosts(page = 1, perPage = 10): Promise<{
  posts: WPRestPost[];
  pageInfo: WPRestPageInfo;
}> {
  try {
    const url = `${REST_API}/posts?_embed&page=${page}&per_page=${perPage}&status=publish`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts = await response.json();
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);

    return {
      posts,
      pageInfo: {
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], pageInfo: { totalPages: 0, currentPage: 1 } };
  }
}

// Fetch single post by slug
export async function getPostBySlug(slug: string): Promise<WPRestPost | null> {
  try {
    const url = `${REST_API}/posts?slug=${slug}&_embed&status=publish`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts: WPRestPost[] = await response.json();
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
}

// Fetch all post slugs (for static generation)
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const url = `${REST_API}/posts?per_page=100&fields=slug&status=publish`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts: Array<{ slug: string }> = await response.json();
    return posts.map((post) => post.slug);
  } catch (error) {
    console.error('Error fetching post slugs:', error);
    return [];
  }
}
