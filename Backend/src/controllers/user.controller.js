// User Controller — D1 Database Operations
import { jsonResponse, errorResponse } from '../utils/http.js';

export const UserController = {
  // GET /api/users
  async getAll(env) {
    try {
      const { results } = await env.DB.prepare('SELECT * FROM users').all();
      return jsonResponse({ success: true, data: results });
    } catch (err) {
      return errorResponse(err.message, 500);
    }
  },

  // POST /api/users
  async create(request, env) {
    try {
      const { name, email, role } = (await request.json()) || {};
      if (!name || !email) return errorResponse('Name and email are required');
      const userRole = role || 'user';

      const result = await env.DB
        .prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)')
        .bind(name, email, userRole)
        .run();

      return jsonResponse(
        {
          success: true,
          data: { id: result.meta?.last_row_id, name, email, role: userRole },
        },
        201
      );
    } catch (err) {
      return errorResponse(err.message, 500);
    }
  },
};
