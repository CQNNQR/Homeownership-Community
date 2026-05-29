import { WPPost } from './wordpress';

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

export function getCategoryName(categories: { nodes: { name: string }[] }): string {
  return categories?.nodes?.[0]?.name || 'General';
}

export function normalizePost(post: WPPost) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title.replace(/<[^>]*>/g, ''),
    excerpt: truncateExcerpt(post.excerpt),
    content: post.content,
    date: formatDate(post.date),
    modified: formatDate(post.modified),
    image: post.featuredImage?.node?.sourceUrl || null,
    imageAlt: post.featuredImage?.node?.altText || post.title,
    category: getCategoryName(post.categories),
    author: post.author?.node?.name || 'The Home Ownership Community',
    readingTime: post.content ? getReadingTime(post.content) : '5 min read',
  };
}
