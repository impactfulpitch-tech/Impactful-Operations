import { Router, Response } from 'express';
import { prisma } from '../server';
import { authMiddleware, AuthRequest } from './auth';

const router = Router();

// Get all projects
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        projectLinks: true,
        milestones: true,
        tasks: true,
        invoices: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        projectLinks: true,
        milestones: true,
        tasks: true,
        invoices: true,
        reminders: true
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create project
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      clientName,
      startDate,
      endDate,
      timeline,
      description,
      status,
      budget
    } = req.body;

    if (!name || !clientName || !startDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate reminder date (15 days before end date)
    const end = new Date(endDate);
    const reminderDate = new Date(end.getTime() - 15 * 24 * 60 * 60 * 1000);

    const project = await prisma.project.create({
      data: {
        name,
        clientName,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        timeline,
        reminderDate: reminderDate.toISOString().split('T')[0],
        description,
        status: status || 'active',
        budget: budget ? parseInt(budget) : null
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      clientName,
      startDate,
      endDate,
      timeline,
      description,
      status,
      budget,
      contentLocked,
      financialLocked,
      paymentReminderSentAt5Days
    } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(clientName && { clientName }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(timeline && { timeline }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(budget !== undefined && { budget: budget ? parseInt(budget) : null }),
        ...(contentLocked !== undefined && { contentLocked }),
        ...(financialLocked !== undefined && { financialLocked }),
        ...(paymentReminderSentAt5Days !== undefined && { paymentReminderSentAt5Days })
      },
      include: { projectLinks: true, milestones: true }
    });

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
