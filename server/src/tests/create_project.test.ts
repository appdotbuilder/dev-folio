
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { createProject } from '../handlers/create_project';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateProjectInput = {
  title: 'Test Project',
  description: 'A project for testing purposes',
  link: 'https://example.com'
};

describe('createProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a project', async () => {
    const result = await createProject(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Project');
    expect(result.description).toEqual(testInput.description);
    expect(result.link).toEqual('https://example.com');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save project to database', async () => {
    const result = await createProject(testInput);

    // Query using proper drizzle syntax
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].title).toEqual('Test Project');
    expect(projects[0].description).toEqual(testInput.description);
    expect(projects[0].link).toEqual('https://example.com');
    expect(projects[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple projects with unique IDs', async () => {
    const firstProject = await createProject(testInput);
    
    const secondInput: CreateProjectInput = {
      title: 'Second Project',
      description: 'Another test project',
      link: 'https://second-example.com'
    };
    
    const secondProject = await createProject(secondInput);

    expect(firstProject.id).not.toEqual(secondProject.id);
    expect(secondProject.title).toEqual('Second Project');
    expect(secondProject.description).toEqual('Another test project');
    expect(secondProject.link).toEqual('https://second-example.com');
  });
});
