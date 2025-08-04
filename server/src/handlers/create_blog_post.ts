
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput, type BlogPost } from '../schema';

export const createBlogPost = async (input: CreateBlogPostInput): Promise<BlogPost> => {
  try {
    // Insert blog post record
    const result = await db.insert(blogPostsTable)
      .values({
        title: input.title
      })
      .returning()
      .execute();

    const blogPost = result[0];
    return blogPost;
  } catch (error) {
    console.error('Blog post creation failed:', error);
    throw error;
  }
};
