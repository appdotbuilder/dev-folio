
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type Project } from '../schema';
import { desc } from 'drizzle-orm';

export const getProjects = async (): Promise<Project[]> => {
  try {
    const results = await db.select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
};
