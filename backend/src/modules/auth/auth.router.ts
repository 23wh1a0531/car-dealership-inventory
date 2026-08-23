import { Router, Request, Response } from 'express';
import { registerUser, loginUser } from './auth.service';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await registerUser(email, password);
    res.status(201).json({ data: user, message: 'User registered' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    if (message === 'Email already in use') return void res.status(409).json({ error: message });
    res.status(400).json({ error: message });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await loginUser(email, password);
    res.status(200).json({ data: result, message: 'Login successful' });
  } catch {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
