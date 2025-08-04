
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteProject = async (input: DeleteInput): Promise<{ success: boolean }> => {
  try {
    // Delete the project by ID
    const result = await db.delete(projectsTable)
      .where(eq(projectsTable.id, input.id))
      .execute();

    // Return success status
    return { success: true };
  } catch (error) {
    console.error('Project deletion failed:', error);
    throw error;
  }
};
