
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { deleteBlogPost } from '../handlers/delete_blog_post';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: DeleteInput = {
  id: 1
};

describe('deleteBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing blog post', async () => {
    // Create a blog post first
    const createResult = await db.insert(blogPostsTable)
      .values({
        title: 'Test Blog Post'
      })
      .returning()
      .execute();

    const blogPostId = createResult[0].id;

    // Delete the blog post
    const result = await deleteBlogPost({ id: blogPostId });

    expect(result.success).toBe(true);

    // Verify the blog post was deleted from database
    const blogPosts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, blogPostId))
      .execute();

    expect(blogPosts).toHaveLength(0);
  });

  it('should return false when deleting non-existent blog post', async () => {
    const result = await deleteBlogPost({ id: 999 });

    expect(result.success).toBe(false);
  });

  it('should not affect other blog posts when deleting', async () => {
    // Create two blog posts
    const createResults = await db.insert(blogPostsTable)
      .values([
        { title: 'First Blog Post' },
        { title: 'Second Blog Post' }
      ])
      .returning()
      .execute();

    const firstId = createResults[0].id;
    const secondId = createResults[1].id;

    // Delete only the first blog post
    const result = await deleteBlogPost({ id: firstId });

    expect(result.success).toBe(true);

    // Verify first blog post is deleted
    const deletedBlogPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, firstId))
      .execute();

    expect(deletedBlogPost).toHaveLength(0);

    // Verify second blog post still exists
    const remainingBlogPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, secondId))
      .execute();

    expect(remainingBlogPost).toHaveLength(1);
    expect(remainingBlogPost[0].title).toEqual('Second Blog Post');
  });
});
