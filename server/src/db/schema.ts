
import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  link: text('link').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const blogPostsTable = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types for the table schemas
export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;
export type BlogPost = typeof blogPostsTable.$inferSelect;
export type NewBlogPost = typeof blogPostsTable.$inferInsert;

// Important: Export all tables for proper query building
export const tables = { 
  projects: projectsTable, 
  blogPosts: blogPostsTable 
};
