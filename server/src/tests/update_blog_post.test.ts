
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput, type UpdateBlogPostInput } from '../schema';
import { updateBlogPost } from '../handlers/update_blog_post';
import { eq } from 'drizzle-orm';

// Test data
const testBlogPostInput: CreateBlogPostInput = {
  title: 'Original Blog Post Title'
};

const updateInput: UpdateBlogPostInput = {
  id: 1,
  title: 'Updated Blog Post Title'
};

describe('updateBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a blog post title', async () => {
    // Create a blog post first
    const createResult = await db.insert(blogPostsTable)
      .values(testBlogPostInput)
      .returning()
      .execute();
    
    const createdPost = createResult[0];
    
    // Update the blog post
    const result = await updateBlogPost({
      id: createdPost.id,
      title: 'Updated Blog Post Title'
    });

    // Verify the update
    expect(result.id).toEqual(createdPost.id);
    expect(result.title).toEqual('Updated Blog Post Title');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at).toEqual(createdPost.created_at); // Should preserve original timestamp
  });

  it('should save updated blog post to database', async () => {
    // Create a blog post first
    const createResult = await db.insert(blogPostsTable)
      .values(testBlogPostInput)
      .returning()
      .execute();
    
    const createdPost = createResult[0];
    
    // Update the blog post
    await updateBlogPost({
      id: createdPost.id,
      title: 'Updated Blog Post Title'
    });

    // Query the database to verify the update
    const blogPosts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, createdPost.id))
      .execute();

    expect(blogPosts).toHaveLength(1);
    expect(blogPosts[0].title).toEqual('Updated Blog Post Title');
    expect(blogPosts[0].created_at).toEqual(createdPost.created_at);
  });

  it('should handle partial updates', async () => {
    // Create a blog post first
    const createResult = await db.insert(blogPostsTable)
      .values(testBlogPostInput)
      .returning()
      .execute();
    
    const createdPost = createResult[0];
    
    // Update with only some fields (in this case, only title is available)
    const result = await updateBlogPost({
      id: createdPost.id,
      title: 'Partially Updated Title'
    });

    expect(result.id).toEqual(createdPost.id);
    expect(result.title).toEqual('Partially Updated Title');
    expect(result.created_at).toEqual(createdPost.created_at);
  });

  it('should return existing record when no fields to update', async () => {
    // Create a blog post first
    const createResult = await db.insert(blogPostsTable)
      .values(testBlogPostInput)
      .returning()
      .execute();
    
    const createdPost = createResult[0];
    
    // Update with no fields (all undefined)
    const result = await updateBlogPost({
      id: createdPost.id
    });

    expect(result.id).toEqual(createdPost.id);
    expect(result.title).toEqual(createdPost.title);
    expect(result.created_at).toEqual(createdPost.created_at);
  });

  it('should throw error for non-existent blog post', async () => {
    await expect(updateBlogPost({
      id: 999,
      title: 'Updated Title'
    })).rejects.toThrow(/blog post with id 999 not found/i);
  });

  it('should throw error when trying to update non-existent blog post with no fields', async () => {
    await expect(updateBlogPost({
      id: 999
    })).rejects.toThrow(/blog post with id 999 not found/i);
  });
});
