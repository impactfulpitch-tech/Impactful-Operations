import { Router, Response } from 'express';
import { prisma } from '../server';
import { authMiddleware, AuthRequest } from './auth';

const router = Router();

// Get all activity logs
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, userId, limit = 100 } = req.query;

    const logs = await prisma.activityLog.findMany({
      where: {
        ...(category && { category: category as string }),
        ...(userId && { userId: userId as string })
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string) || 100
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Get activity log by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const log = await prisma.activityLog.findUnique({
      where: { id }
    });

    if (!log) {
      return res.status(404).json({ error: 'Activity log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// Create activity log
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { action, description, category, metadata } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    const log = await prisma.activityLog.create({
      data: {
        action,
        description,
        userId: req.user?.id,
        userName: req.user?.email,
        category,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating activity log:', error);
    res.status(500).json({ error: 'Failed to create activity log' });
  }
});

// Clear old activity logs (admin only)
router.delete('/clear/old', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Delete logs older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo
        }
      }
    });

    res.json({ 
      message: `Deleted ${result.count} old activity logs`,
      count: result.count
    });
  } catch (error) {
    console.error('Error clearing activity logs:', error);
    res.status(500).json({ error: 'Failed to clear activity logs' });
  }
});

export default router;
