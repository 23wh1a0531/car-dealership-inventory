import express from 'express';
import { authRouter } from './modules/auth/auth.router';
import { vehiclesRouter } from './modules/vehicles/vehicles.router';

const app = express();

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehiclesRouter);

export default app;
