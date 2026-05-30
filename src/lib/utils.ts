import { WPRestPost } from './wordpress';

export function formatDate(dateString: string): string {
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
  // First decode HTML entities, then remove tags
  const decoded = decodeHtmlEntities(html);
  return decoded.replace(/<[^>]*>/g, '').trim();
}

export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#8217;': "'",
    '&#8216;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#039;': "'",
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '...',
    '&#8211;': '–',
    '&#8212;': '—',
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }
  // Handle numeric entities like &#8217;
  result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  result = result.replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return result;
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

// Keyword-based category mapping
const categoryKeywords: { [key: string]: string[] } = {
  'Mortgage': ['mortgage', 'loan', 'financing', 'interest rate', 'preapproval', 'lender', 'credit score', 'debt', ' FHA ', ' VA loan '],
  'Investing': ['investing', 'investment', 'returns', 'portfolio', 'stocks', 'dividend', 'wealth', 'passive income', 'cash flow'],
  'Real Estate': ['real estate', 'property', 'homeowner', 'house', 'buying', 'selling', 'listing', 'market', 'agent', 'realtor'],
  'Landlord': ['landlord', 'tenant', 'rental', 'lease', 'rent', 'eviction', 'property management', 'renters'],
  'Taxes': ['tax', 'taxes', 'deduction', 'IRS', 'write-off', 'capital gains', '1031 exchange'],
  'Insurance': ['insurance', 'coverage', 'policy', 'claim', 'homeowners insurance'],
  'Maintenance': ['maintenance', 'repair', 'renovation', 'remodel', 'fix', 'damage', 'wear and tear'],
  'General': [], // Default category
};

export function autoCategorize(title: string, content: string): string {
  const text = (title + ' ' + stripHtml(content)).toLowerCase();

  let bestMatch = 'General';
  let highestCount = 0;

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === 'General') continue;

    let count = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        count++;
      }
    }

    if (count > highestCount) {
      highestCount = count;
      bestMatch = category;
    }
  }

  return bestMatch;
}

export function getCategoryName(categories: number[], embedded?: WPRestPost['_embedded'], title?: string, content?: string): string {
  // Use WordPress category if available
  if (embedded?.['wp:term']?.[0]?.[0]?.name) {
    const wpCategory = embedded['wp:term'][0][0].name;
    // Only use if it's not "Uncategorized" or similar default
    if (wpCategory && wpCategory.toLowerCase() !== 'uncategorized') {
      return wpCategory;
    }
  }

  // Auto-categorize based on content if no valid WordPress category
  if (title && content) {
    return autoCategorize(title, content);
  }

  return 'General';
}

export function normalizePost(post: WPRestPost) {
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];
  const title = stripHtml(post.title.rendered);
  const content = post.content?.rendered || '';

  return {
    id: String(post.id),
    slug: post.slug,
    title: title,
    excerpt: truncateExcerpt(post.excerpt.rendered),
    content: content,
    date: formatDate(post.date),
    modified: formatDate(post.modified),
    image: featuredImage?.source_url || null,
    imageAlt: featuredImage?.alt_text || title,
    category: getCategoryName(post.categories, post._embedded, title, content),
    author: post._embedded?.author?.[0]?.name || 'The Home Ownership Community',
    readingTime: content ? getReadingTime(content) : '5 min read',
  };
}
