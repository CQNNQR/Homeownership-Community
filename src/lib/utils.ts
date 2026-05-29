import { WPRestPost } from './wordpress';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export function truncateExcerpt(excerpt: string, maxLength: number = 150): string {
  const plainText = stripHtml(excerpt);
  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength).trim() + '...';
}

export function getReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = stripHtml(content).split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export function getCategoryName(categories: number[], embedded?: WPRestPost['_embedded']): string {
  if (embedded?.['wp:term']?.[0]?.[0]?.name) {
    return embedded['wp:term'][0][0].name;
  }
  return 'General';
}

export function normalizePost(post: WPRestPost) {
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];

  return {
    id: String(post.id),
    slug: post.slug,
    title: stripHtml(post.title.rendered),
    excerpt: truncateExcerpt(post.excerpt.rendered),
    content: post.content?.rendered || '',
    date: formatDate(post.date),
    modified: formatDate(post.modified),
    image: featuredImage?.source_url || null,
    imageAlt: featuredImage?.alt_text || stripHtml(post.title.rendered),
    category: getCategoryName(post.categories, post._embedded),
    author: post._embedded?.author?.[0]?.name || 'The Home Ownership Community',
    readingTime: post.content?.rendered ? getReadingTime(post.content.rendered) : '5 min read',
  };
}
