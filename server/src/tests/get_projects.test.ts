
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { getProjects } from '../handlers/get_projects';

// Test data for creating projects
const testProject1: CreateProjectInput = {
  title: 'First Project',
  description: 'Description for the first project',
  link: 'https://example.com/project1'
};

const testProject2: CreateProjectInput = {
  title: 'Second Project',
  description: 'Description for the second project',
  link: 'https://example.com/project2'
};

describe('getProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no projects exist', async () => {
    const result = await getProjects();
    expect(result).toEqual([]);
  });

  it('should return all projects ordered by creation date', async () => {
    // Create test projects with a small delay to ensure different timestamps
    await db.insert(projectsTable)
      .values({
        title: testProject1.title,
        description: testProject1.description,
        link: testProject1.link
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(projectsTable)
      .values({
        title: testProject2.title,
        description: testProject2.description,
        link: testProject2.link
      })
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(2);
    
    // Verify projects are ordered by creation date (newest first)
    expect(result[0].title).toEqual('Second Project');
    expect(result[1].title).toEqual('First Project');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should return projects with all required fields', async () => {
    await db.insert(projectsTable)
      .values({
        title: testProject1.title,
        description: testProject1.description,
        link: testProject1.link
      })
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    const project = result[0];
    
    expect(project.id).toBeDefined();
    expect(typeof project.id).toBe('number');
    expect(project.title).toEqual('First Project');
    expect(project.description).toEqual('Description for the first project');
    expect(project.link).toEqual('https://example.com/project1');
    expect(project.created_at).toBeInstanceOf(Date);
  });

  it('should handle multiple projects correctly', async () => {
    // Create multiple projects
    const projects = [
      { title: 'Project A', description: 'Description A', link: 'https://a.com' },
      { title: 'Project B', description: 'Description B', link: 'https://b.com' },
      { title: 'Project C', description: 'Description C', link: 'https://c.com' }
    ];

    for (const project of projects) {
      await db.insert(projectsTable)
        .values(project)
        .execute();
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 5));
    }

    const result = await getProjects();

    expect(result).toHaveLength(3);
    
    // Verify all projects are returned
    const titles = result.map(p => p.title);
    expect(titles).toContain('Project A');
    expect(titles).toContain('Project B');
    expect(titles).toContain('Project C');
    
    // Verify ordering (newest first)
    expect(result[0].title).toEqual('Project C');
    expect(result[2].title).toEqual('Project A');
  });
});
