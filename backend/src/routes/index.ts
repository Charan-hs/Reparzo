import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { healthRoutes } from './health.routes';
import { categoriesRoutes } from './categories.routes';
import { servicesRoutes } from './services.routes';
import { bookingsRoutes } from './bookings.routes';
import { mediaRoutes } from './media.routes';

export const apiRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

apiRouter.route('/health', healthRoutes);
apiRouter.route('/categories', categoriesRoutes);
apiRouter.route('/services', servicesRoutes);
apiRouter.route('/bookings', bookingsRoutes);
apiRouter.route('/media', mediaRoutes);
