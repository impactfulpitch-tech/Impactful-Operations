import { Router, Response } from 'express';
import { prisma } from '../server';
import { authMiddleware, AuthRequest } from './auth';

const router = Router();

// Get all invoices
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, status } = req.query;

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(projectId && { projectId: projectId as string }),
        ...(status && { status: status as string })
      },
      include: { 
        project: { select: { name: true } },
        reminders: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get single invoice
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { 
        project: true,
        reminders: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create invoice
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const {
      invoiceNumber,
      projectId,
      milestoneId,
      amount,
      currency,
      description,
      issueDate,
      dueDate,
      clientName,
      notes,
      paymentMethod
    } = req.body;

    if (!invoiceNumber || !projectId || !amount || !issueDate || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        projectId,
        milestoneId,
        amount,
        currency: currency || 'INR',
        description,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        clientName: clientName || 'Client',
        notes,
        paymentMethod,
        status: 'draft'
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      invoiceNumber,
      amount,
      currency,
      description,
      issueDate,
      dueDate,
      status,
      clientName,
      notes,
      paymentMethod,
      paidDate
    } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(invoiceNumber && { invoiceNumber }),
        ...(amount && { amount }),
        ...(currency && { currency }),
        ...(description !== undefined && { description }),
        ...(issueDate && { issueDate: new Date(issueDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(status && { status }),
        ...(clientName && { clientName }),
        ...(notes !== undefined && { notes }),
        ...(paymentMethod && { paymentMethod }),
        ...(paidDate && { paidDate: new Date(paidDate) })
      }
    });

    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Delete invoice
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.invoice.delete({
      where: { id }
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;
