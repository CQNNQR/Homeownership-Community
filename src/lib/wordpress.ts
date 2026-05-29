import { GraphQLClient } from 'graphql-request';

// You'll need to update this to your WordPress site URL
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://your-wordpress-site.com';

const endpoint = `${WORDPRESS_URL}/graphql`;

export const wpClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});

// GraphQL Queries for WPGraphQL
export const GET_POSTS = `
  query GetPosts($first: Int, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        slug
        title
        excerpt
        date
        modified
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            name
          }
        }
        author {
          node {
            name
          }
        }
      }
    }
  }
`;

export const GET_POST_BY_SLUG = `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      slug
      title
      content
      date
      modified
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      categories {
        nodes {
          name
        }
      }
      author {
        node {
          name
          avatar {
            url
          }
        }
      }
    }
  }
`;

export const GET_ALL_POST_SLUGS = `
  query GetAllPostSlugs {
    posts(first: 100, where: { status: PUBLISH }) {
      nodes {
        slug
      }
    }
  }
`;

// Type definitions for WordPress data
export interface WPPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  modified: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  } | null;
  categories: {
    nodes: {
      name: string;
    }[];
  };
  author: {
    node: {
      name: string;
      avatar?: {
        url: string;
      };
    };
  };
}

export interface WPPageInfo {
  hasNextPage: boolean;
  endCursor: string;
}

export interface WPPostsResponse {
  posts: {
    pageInfo: WPPageInfo;
    nodes: WPPost[];
  };
}
