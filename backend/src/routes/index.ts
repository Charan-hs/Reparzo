import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { healthRoutes } from './health.routes';
import { servicesRoutes } from './services.routes';
import { bookingsRoutes } from './bookings.routes';

export const apiRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

apiRouter.route('/health', healthRoutes);
apiRouter.route('/services', servicesRoutes);
apiRouter.route('/bookings', bookingsRoutes);
