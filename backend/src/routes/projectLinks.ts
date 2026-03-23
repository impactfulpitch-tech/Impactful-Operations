import { Router, Response } from 'express';
import { prisma } from '../server';
import { authMiddleware, AuthRequest } from './auth';

const router = Router();

// Get all links for a project
router.get('/:projectId/links', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const links = await prisma.projectLink.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(links);
  } catch (error) {
    console.error('Error fetching project links:', error);
    res.status(500).json({ error: 'Failed to fetch project links' });
  }
});

// Get ChatGPT links for a project
router.get('/:projectId/links/chatgpt', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const chatgptLinks = await prisma.projectLink.findMany({
      where: {
        projectId,
        category: 'chatgpt'
      }
    });

    res.json(chatgptLinks);
  } catch (error) {
    console.error('Error fetching ChatGPT links:', error);
    res.status(500).json({ error: 'Failed to fetch ChatGPT links' });
  }
});

// Create link
router.post('/:projectId/links', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { title, url, description, category } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const link = await prisma.projectLink.create({
      data: {
        projectId,
        title,
        url,
        description,
        category: category || 'documentation',
        addedBy: req.user?.email || 'system'
      }
    });

    res.status(201).json(link);
  } catch (error) {
    console.error('Error creating project link:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
});

// Update link
router.put('/:projectId/links/:linkId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, linkId } = req.params;
    const { title, url, description, category } = req.body;

    const link = await prisma.projectLink.update({
      where: { id: linkId },
      data: {
        ...(title && { title }),
        ...(url && { url }),
        ...(description !== undefined && { description }),
        ...(category && { category })
      }
    });

    res.json(link);
  } catch (error) {
    console.error('Error updating project link:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// Delete link
router.delete('/:projectId/links/:linkId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { linkId } = req.params;

    await prisma.projectLink.delete({
      where: { id: linkId }
    });

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting project link:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

export default router;
