
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput, type UpdateProjectInput } from '../schema';
import { updateProject } from '../handlers/update_project';
import { eq } from 'drizzle-orm';

// Test data
const testProject: CreateProjectInput = {
  title: 'Original Title',
  description: 'Original description',
  link: 'https://original.com'
};

const createTestProject = async () => {
  const result = await db.insert(projectsTable)
    .values(testProject)
    .returning()
    .execute();
  return result[0];
};

describe('updateProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update project title only', async () => {
    const project = await createTestProject();
    
    const updateInput: UpdateProjectInput = {
      id: project.id,
      title: 'Updated Title'
    };

    const result = await updateProject(updateInput);

    expect(result.id).toEqual(project.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.description).toEqual('Original description');
    expect(result.link).toEqual('https://original.com');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update project description only', async () => {
    const project = await createTestProject();
    
    const updateInput: UpdateProjectInput = {
      id: project.id,
      description: 'Updated description'
    };

    const result = await updateProject(updateInput);

    expect(result.id).toEqual(project.id);
    expect(result.title).toEqual('Original Title');
    expect(result.description).toEqual('Updated description');
    expect(result.link).toEqual('https://original.com');
  });

  it('should update project link only', async () => {
    const project = await createTestProject();
    
    const updateInput: UpdateProjectInput = {
      id: project.id,
      link: 'https://updated.com'
    };

    const result = await updateProject(updateInput);

    expect(result.id).toEqual(project.id);
    expect(result.title).toEqual('Original Title');
    expect(result.description).toEqual('Original description');
    expect(result.link).toEqual('https://updated.com');
  });

  it('should update multiple fields', async () => {
    const project = await createTestProject();
    
    const updateInput: UpdateProjectInput = {
      id: project.id,
      title: 'New Title',
      description: 'New description',
      link: 'https://new.com'
    };

    const result = await updateProject(updateInput);

    expect(result.id).toEqual(project.id);
    expect(result.title).toEqual('New Title');
    expect(result.description).toEqual('New description');
    expect(result.link).toEqual('https://new.com');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated project to database', async () => {
    const project = await createTestProject();
    
    const updateInput: UpdateProjectInput = {
      id: project.id,
      title: 'Database Update Test'
    };

    const result = await updateProject(updateInput);

    // Verify in database
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].title).toEqual('Database Update Test');
    expect(projects[0].description).toEqual('Original description');
    expect(projects[0].link).toEqual('https://original.com');
  });

  it('should throw error for non-existent project', async () => {
    const updateInput: UpdateProjectInput = {
      id: 999,
      title: 'This should fail'
    };

    await expect(updateProject(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should preserve created_at timestamp', async () => {
    const project = await createTestProject();
    const originalCreatedAt = project.created_at;
    
    const updateInput: UpdateProjectInput = {
      id: project.id,
      title: 'Timestamp Test'
    };

    const result = await updateProject(updateInput);

    expect(result.created_at).toEqual(originalCreatedAt);
  });
});
