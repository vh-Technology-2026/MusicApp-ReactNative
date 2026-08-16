// ── User Routes Handler ────────────────────────────────────────────────────
import { UserController } from '../controllers/user.controller.js';

export async function handleUserRoutes(pathname, method, request, env) {
  if (pathname === '/api/users') {
    if (method === 'GET') return UserController.getAll(env);
    if (method === 'POST') return UserController.create(request, env);
  }

  return null; // Not matched
}
