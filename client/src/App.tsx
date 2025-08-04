
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Project, CreateProjectInput, BlogPost, CreateBlogPostInput } from '../../server/src/schema';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [projectForm, setProjectForm] = useState<CreateProjectInput>({
    title: '',
    description: '',
    link: ''
  });

  const [blogForm, setBlogForm] = useState<CreateBlogPostInput>({
    title: ''
  });

  const loadProjects = useCallback(async () => {
    try {
      const result = await trpc.getProjects.query();
      setProjects(result);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }, []);

  const loadBlogPosts = useCallback(async () => {
    try {
      const result = await trpc.getBlogPosts.query();
      setBlogPosts(result);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    loadBlogPosts();
  }, [loadProjects, loadBlogPosts]);

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createProject.mutate(projectForm);
      setProjects((prev: Project[]) => [...prev, response]);
      setProjectForm({ title: '', description: '', link: '' });
      setIsProjectDialogOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createBlogPost.mutate(blogForm);
      setBlogPosts((prev: BlogPost[]) => [response, ...prev]);
      setBlogForm({ title: '' });
      setIsBlogDialogOpen(false);
    } catch (error) {
      console.error('Failed to create blog post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">👨‍💻 Developer Portfolio</h1>
            <p className="text-lg text-gray-600">Building digital experiences, one project at a time</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Projects Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🚀 Projects</h2>
              <p className="text-gray-600">A showcase of my latest work and experiments</p>
            </div>
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  ✨ Add Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Project</DialogTitle>
                  <DialogDescription>
                    Share your latest creation with the world.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleProjectSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="project-title">Title</Label>
                      <Input
                        id="project-title"
                        value={projectForm.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setProjectForm((prev: CreateProjectInput) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="My Awesome Project"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="project-description">Description</Label>
                      <Textarea
                        id="project-description"
                        value={projectForm.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setProjectForm((prev: CreateProjectInput) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Describe what makes this project special..."
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="project-link">Link</Label>
                      <Input
                        id="project-link"
                        type="url"
                        value={projectForm.link}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setProjectForm((prev: CreateProjectInput) => ({ ...prev, link: e.target.value }))
                        }
                        placeholder="https://github.com/username/project"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                      {isLoading ? '🔄 Creating...' : '🚀 Create Project'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {projects.length === 0 ? (
            <Card className="text-center py-12 bg-white/60 backdrop-blur-sm border-dashed">
              <CardContent>
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-4">Start building your portfolio by adding your first project!</p>
                <Button 
                  onClick={() => setIsProjectDialogOpen(true)}
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  ✨ Add Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project: Project) => (
                <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border hover:border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 line-clamp-3">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                        {project.created_at.toLocaleDateString()}
                      </Badge>
                      <Button 
                        asChild 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1"
                        >
                          🔗 View
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <Separator className="mb-16 bg-gray-200" />

        {/* Blog Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">📝 Blog</h2>
              <p className="text-gray-600">Thoughts, insights, and learnings from my journey</p>
            </div>
            <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                  📝 New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Blog Post</DialogTitle>
                  <DialogDescription>
                    Share your thoughts and insights with the community.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBlogSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="blog-title">Title</Label>
                      <Input
                        id="blog-title"
                        value={blogForm.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setBlogForm((prev: CreateBlogPostInput) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="My thoughts on..."
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                      {isLoading ? '🔄 Publishing...' : '📝 Publish Post'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {blogPosts.length === 0 ? (
            <Card className="text-center py-12 bg-white/60 backdrop-blur-sm border-dashed">
              <CardContent>
                <div className="text-6xl mb-4">💭</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No blog posts yet</h3>
                <p className="text-gray-500 mb-4">Share your first thoughts and insights with the world!</p>
                <Button 
                  onClick={() => setIsBlogDialogOpen(true)}
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  📝 Write Your First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {blogPosts.map((post: BlogPost) => (
                <Card key={post.id} className="group hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm border hover:border-purple-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-gray-900 group-hover:text-purple-600 transition-colors">
                        {post.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                        📅 {post.created_at.toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-400">
            Built with ❤️ using React, tRPC, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
