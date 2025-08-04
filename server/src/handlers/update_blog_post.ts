
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type UpdateBlogPostInput, type BlogPost } from '../schema';
import { eq } from 'drizzle-orm';

export const updateBlogPost = async (input: UpdateBlogPostInput): Promise<BlogPost> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<{ title: string }> = {};
    
    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    // If no fields to update, just return the current record
    if (Object.keys(updateData).length === 0) {
      const existingPost = await db.select()
        .from(blogPostsTable)
        .where(eq(blogPostsTable.id, input.id))
        .execute();
      
      if (existingPost.length === 0) {
        throw new Error(`Blog post with id ${input.id} not found`);
      }
      
      return existingPost[0];
    }

    // Update the blog post
    const result = await db.update(blogPostsTable)
      .set(updateData)
      .where(eq(blogPostsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Blog post with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Blog post update failed:', error);
    throw error;
  }
};
