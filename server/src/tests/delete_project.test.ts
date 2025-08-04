
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { deleteProject } from '../handlers/delete_project';
import { eq } from 'drizzle-orm';

const testInput: DeleteInput = {
  id: 1
};

describe('deleteProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing project', async () => {
    // Create a test project first
    const insertResult = await db.insert(projectsTable)
      .values({
        title: 'Test Project',
        description: 'A project for testing deletion',
        link: 'https://example.com'
      })
      .returning()
      .execute();

    const projectId = insertResult[0].id;

    // Delete the project
    const result = await deleteProject({ id: projectId });

    // Verify success response
    expect(result.success).toBe(true);

    // Verify project was actually deleted from database
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();

    expect(projects).toHaveLength(0);
  });

  it('should return success even when project does not exist', async () => {
    // Try to delete a non-existent project
    const result = await deleteProject({ id: 999 });

    // Should still return success
    expect(result.success).toBe(true);
  });

  it('should not affect other projects when deleting', async () => {
    // Create two test projects
    const project1 = await db.insert(projectsTable)
      .values({
        title: 'Project 1',
        description: 'First test project',
        link: 'https://example1.com'
      })
      .returning()
      .execute();

    const project2 = await db.insert(projectsTable)
      .values({
        title: 'Project 2',
        description: 'Second test project',
        link: 'https://example2.com'
      })
      .returning()
      .execute();

    // Delete first project
    const result = await deleteProject({ id: project1[0].id });

    expect(result.success).toBe(true);

    // Verify first project is deleted
    const deletedProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, project1[0].id))
      .execute();

    expect(deletedProject).toHaveLength(0);

    // Verify second project still exists
    const remainingProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, project2[0].id))
      .execute();

    expect(remainingProject).toHaveLength(1);
    expect(remainingProject[0].title).toEqual('Project 2');
  });
});
