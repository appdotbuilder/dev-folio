
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput } from '../schema';
import { createBlogPost } from '../handlers/create_blog_post';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateBlogPostInput = {
  title: 'Test Blog Post'
};

describe('createBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a blog post', async () => {
    const result = await createBlogPost(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Blog Post');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save blog post to database', async () => {
    const result = await createBlogPost(testInput);

    // Query using proper drizzle syntax
    const blogPosts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, result.id))
      .execute();

    expect(blogPosts).toHaveLength(1);
    expect(blogPosts[0].title).toEqual('Test Blog Post');
    expect(blogPosts[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple blog posts with different titles', async () => {
    const firstPost = await createBlogPost({ title: 'First Post' });
    const secondPost = await createBlogPost({ title: 'Second Post' });

    expect(firstPost.id).not.toEqual(secondPost.id);
    expect(firstPost.title).toEqual('First Post');
    expect(secondPost.title).toEqual('Second Post');

    // Verify both posts exist in database
    const allPosts = await db.select()
      .from(blogPostsTable)
      .execute();

    expect(allPosts).toHaveLength(2);
  });
});
