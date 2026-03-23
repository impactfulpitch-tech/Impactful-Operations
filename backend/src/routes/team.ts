import { Router, Response } from 'express';
import { prisma } from '../server';
import { authMiddleware, AuthRequest } from './auth';

const router = Router();

// Get all team members
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { department } = req.query;

    const members = await prisma.teamMember.findMany({
      where: {
        ...(department && { department: department as string })
      },
      include: { tasks: { select: { id: true } } },
      orderBy: { name: 'asc' }
    });

    res.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Get single team member
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const member = await prisma.teamMember.findUnique({
      where: { id },
      include: { tasks: true }
    });

    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({ error: 'Failed to fetch team member' });
  }
});

// Create team member
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, role, department, avatar } = req.body;

    if (!name || !role || !department) {
      return res.status(400).json({ error: 'Name, role, and department are required' });
    }

    const member = await prisma.teamMember.create({
      data: {
        name,
        role,
        department,
        avatar,
        taskCount: 0
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// Update team member
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, department, avatar, taskCount } = req.body;

    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(department && { department }),
        ...(avatar !== undefined && { avatar }),
        ...(taskCount !== undefined && { taskCount })
      }
    });

    res.json(member);
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// Delete team member
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.teamMember.delete({
      where: { id }
    });

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

export default router;
