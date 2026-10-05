import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { healthRoutes } from './health.routes';
import { categoriesRoutes } from './categories.routes';
import { subcategoriesRoutes } from './subcategories.routes';
import { servicesRoutes } from './services.routes';
import { bookingsRoutes } from './bookings.routes';
import { mediaRoutes } from './media.routes';
import { serviceHubsRoutes } from './serviceHubs.routes';
import { usersRoutes } from './users.routes';
import { userAddressesRoutes } from './userAddresses.routes';
import { systemRoutes } from './system.routes';

export const apiRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

apiRouter.route('/health', healthRoutes);
apiRouter.route('/categories', categoriesRoutes);
apiRouter.route('/subcategories', subcategoriesRoutes);
apiRouter.route('/services', servicesRoutes);
apiRouter.route('/bookings', bookingsRoutes);
apiRouter.route('/media', mediaRoutes);
apiRouter.route('/service-hubs', serviceHubsRoutes);
apiRouter.route('/users', usersRoutes);
apiRouter.route('/user-addresses', userAddressesRoutes);
apiRouter.route('/system', systemRoutes);
