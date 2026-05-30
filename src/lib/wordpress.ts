import Parser from 'rss-parser';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://your-wordpress-site.com';
const RSS_URL = `${WORDPRESS_URL}/feed/`;

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Homeownership-Community/1.0',
  },
});

// Custom fields for WordPress RSS
interface CustomItem {
  'content:encoded': string;
  'wp:post_id': string;
  'wp:post_date': string;
  'wp:post_name': string;
  'wp:status': string;
  'wp:term': Array<Array<{ _attr: { domain: string; nicename: string }; $: { [key: string]: string[] } }>>;
  'enclosure': { url: string; type: string };
}

type WordPressItem = Parser.Item & CustomItem;

// Helper to fetch with timeout
async function fetchWithTimeout(url: string, timeout = 10000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Fetch and parse RSS feed
export async function getPostsFromRSS(page = 1, perPage = 10): Promise<{
  posts: any[];
  hasMore: boolean;
  totalPages: number;
}> {
  try {
    const xml = await fetchWithTimeout(RSS_URL);
    const feed = await parser.parseString(xml);

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedPosts = feed.items.slice(startIndex, endIndex);

    const posts = paginatedPosts.map((item) => {
      // Extract featured image from enclosure or content
      let featuredImage = null;
      if ((item as any).enclosure?.url) {
        featuredImage = (item as any).enclosure.url;
      } else {
        // Try to extract image from content
        const contentMatch = (item as any)['content:encoded']?.match(/<img[^>]+src="([^">]+)"/);
        if (contentMatch) {
          featuredImage = contentMatch[1];
        }
      }

      // Extract categories
      const categories = (item as any)['wp:term']?.find(
        (term: any) => term._attr?.domain === 'category'
      );
      const category = categories?.$[0]?.['wp:term']?.[0] || 'General';

      // Extract slug from link
      const slug = (item as any)['wp:post_name'] || item.link?.split('/').pop() || '';

      return {
        id: (item as any)['wp:post_id'] || item.guid || item.link,
        title: item.title || 'Untitled',
        slug: slug,
        excerpt: item.contentSnippet?.slice(0, 200) || item.content?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
        date: item.pubDate || item.isoDate || '',
        link: item.link,
        featuredImage,
        category,
        content: (item as any)['content:encoded'] || item.content || '',
        author: item.creator || item.author || 'The Home Ownership Community',
      };
    });

    return {
      posts,
      hasMore: endIndex < feed.items.length,
      totalPages: Math.ceil(feed.items.length / perPage),
    };
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return { posts: [], hasMore: false, totalPages: 0 };
  }
}

// Fetch single post by slug
export async function getPostBySlugFromRSS(slug: string): Promise<any | null> {
  try {
    const xml = await fetchWithTimeout(RSS_URL);
    const feed = await parser.parseString(xml);

    const post = feed.items.find((item) => {
      const itemSlug = (item as any)['wp:post_name'] || item.link?.split('/').pop() || '';
      return itemSlug === slug;
    });

    if (!post) return null;

    let featuredImage = null;
    if ((post as any).enclosure?.url) {
      featuredImage = (post as any).enclosure.url;
    } else {
      const contentMatch = (post as any)['content:encoded']?.match(/<img[^>]+src="([^">]+)"/);
      if (contentMatch) {
        featuredImage = contentMatch[1];
      }
    }

    const categories = (post as any)['wp:term']?.find(
      (term: any) => term._attr?.domain === 'category'
    );
    const category = categories?.$[0]?.['wp:term']?.[0] || 'General';

    return {
      id: (post as any)['wp:post_id'] || post.guid || post.link,
      title: post.title || 'Untitled',
      slug: (post as any)['wp:post_name'] || post.link?.split('/').pop() || '',
      excerpt: post.contentSnippet?.slice(0, 200) || post.content?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
      date: post.pubDate || post.isoDate || '',
      link: post.link,
      featuredImage,
      category,
      content: (post as any)['content:encoded'] || post.content || '',
      author: post.creator || post.author || 'The Home Ownership Community',
    };
  } catch (error) {
    console.error('Error fetching post from RSS:', error);
    return null;
  }
}

// Get all post slugs
export async function getAllSlugsFromRSS(): Promise<string[]> {
  try {
    const xml = await fetchWithTimeout(RSS_URL);
    const feed = await parser.parseString(xml);

    return feed.items.map((item) => {
      return (item as any)['wp:post_name'] || item.link?.split('/').pop() || '';
    }).filter(Boolean);
  } catch (error) {
    console.error('Error fetching slugs from RSS:', error);
    return [];
  }
}
