
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { getBlogPosts } from '../handlers/get_blog_posts';

describe('getBlogPosts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no blog posts exist', async () => {
    const result = await getBlogPosts();
    expect(result).toEqual([]);
  });

  it('should return all blog posts ordered by creation date (newest first)', async () => {
    // Create test blog posts
    const blogPost1 = await db.insert(blogPostsTable)
      .values({
        title: 'First Blog Post'
      })
      .returning()
      .execute();

    // Add small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const blogPost2 = await db.insert(blogPostsTable)
      .values({
        title: 'Second Blog Post'
      })
      .returning()
      .execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(2);
    
    // Verify fields are present
    expect(result[0].id).toBeDefined();
    expect(result[0].title).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    
    // Verify ordering (newest first)
    expect(result[0].title).toEqual('Second Blog Post');
    expect(result[1].title).toEqual('First Blog Post');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should return blog posts with correct data types', async () => {
    await db.insert(blogPostsTable)
      .values({
        title: 'Test Blog Post'
      })
      .execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(1);
    expect(typeof result[0].id).toBe('number');
    expect(typeof result[0].title).toBe('string');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].title).toEqual('Test Blog Post');
  });
});
