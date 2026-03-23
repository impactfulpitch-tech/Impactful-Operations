import { Router, Response } from 'express';
import { prisma } from '../server';
import { authMiddleware, AuthRequest } from './auth';

const router = Router();

// Get all client sheets
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const clients = await prisma.clientSheet.findMany({
      where: {
        ...(status && { status: status as string })
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(clients);
  } catch (error) {
    console.error('Error fetching client sheets:', error);
    res.status(500).json({ error: 'Failed to fetch client sheets' });
  }
});

// Get single client sheet
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const client = await prisma.clientSheet.findUnique({
      where: { id }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client sheet not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error fetching client sheet:', error);
    res.status(500).json({ error: 'Failed to fetch client sheet' });
  }
});

// Create client sheet
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      clientName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      companyName,
      industry,
      websiteUrl,
      notes,
      status
    } = req.body;

    if (!clientName) {
      return res.status(400).json({ error: 'Client name is required' });
    }

    const client = await prisma.clientSheet.create({
      data: {
        clientName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        companyName,
        industry,
        websiteUrl,
        notes,
        status: status || 'active'
      }
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client sheet:', error);
    res.status(500).json({ error: 'Failed to create client sheet' });
  }
});

// Update client sheet
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      clientName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      companyName,
      industry,
      websiteUrl,
      notes,
      status
    } = req.body;

    const client = await prisma.clientSheet.update({
      where: { id },
      data: {
        ...(clientName && { clientName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode !== undefined && { zipCode }),
        ...(country !== undefined && { country }),
        ...(companyName !== undefined && { companyName }),
        ...(industry !== undefined && { industry }),
        ...(websiteUrl !== undefined && { websiteUrl }),
        ...(notes !== undefined && { notes }),
        ...(status && { status })
      }
    });

    res.json(client);
  } catch (error) {
    console.error('Error updating client sheet:', error);
    res.status(500).json({ error: 'Failed to update client sheet' });
  }
});

// Delete client sheet
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.clientSheet.delete({
      where: { id }
    });

    res.json({ message: 'Client sheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting client sheet:', error);
    res.status(500).json({ error: 'Failed to delete client sheet' });
  }
});

export default router;
