export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

export function truncateExcerpt(excerpt: string, maxLength: number = 150): string {
  const plainText = stripHtml(excerpt);
  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength).trim() + '...';
}

export function getReadingTime(content: string): string {
  if (!content) return '5 min read';
  const wordsPerMinute = 200;
  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export function normalizePost(post: any) {
  return {
    id: String(post.id),
    slug: post.slug,
    title: stripHtml(post.title),
    excerpt: truncateExcerpt(post.excerpt || ''),
    content: post.content || '',
    date: formatDate(post.date),
    image: post.featuredImage || null,
    imageAlt: stripHtml(post.title) || 'Home Ownership Community',
    category: post.category || 'General',
    author: post.author || 'The Home Ownership Community',
    readingTime: post.content ? getReadingTime(post.content) : '5 min read',
    link: post.link || '',
  };
}
