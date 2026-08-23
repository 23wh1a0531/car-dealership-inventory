import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import {
  listVehicles,
  searchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} from './vehicles.service';

export const vehiclesRouter = Router();

vehiclesRouter.get('/', authenticate, async (_req, res: Response) => {
  const vehicles = await listVehicles();
  res.json({ data: vehicles, message: 'OK' });
});

vehiclesRouter.get('/search', authenticate, async (req: AuthRequest, res: Response) => {
  const { make, model, category, minPrice, maxPrice } = req.query as Record<string, string>;
  const vehicles = await searchVehicles({
    make,
    model,
    category,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });
  res.json({ data: vehicles, message: 'OK' });
});

vehiclesRouter.post('/', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const vehicle = await createVehicle(req.body);
    res.status(201).json({ data: vehicle, message: 'Vehicle created' });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Validation error' });
  }
});

vehiclesRouter.put('/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const vehicle = await updateVehicle(Number(req.params.id), req.body);
    res.json({ data: vehicle, message: 'Vehicle updated' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    if (msg === 'Vehicle not found') return void res.status(404).json({ error: msg });
    res.status(400).json({ error: msg });
  }
});

vehiclesRouter.delete('/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await deleteVehicle(Number(req.params.id));
    res.json({ data: null, message: 'Vehicle deleted' });
  } catch (err: unknown) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'Not found' });
  }
});

vehiclesRouter.post('/:id/purchase', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vehicle = await purchaseVehicle(Number(req.params.id));
    res.json({ data: vehicle, message: 'Purchase successful' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    if (msg === 'Vehicle not found') return void res.status(404).json({ error: msg });
    res.status(409).json({ error: msg });
  }
});

vehiclesRouter.post('/:id/restock', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const vehicle = await restockVehicle(Number(req.params.id), req.body.amount);
    res.json({ data: vehicle, message: 'Restock successful' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    if (msg === 'Vehicle not found') return void res.status(404).json({ error: msg });
    res.status(400).json({ error: msg });
  }
});
