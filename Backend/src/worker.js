export default {
  async fetch(request, env, ctx) {
    globalThis.env = env;
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'content-type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }),
        { headers: corsHeaders }
      );
    }

    // Users endpoint - Query D1 Database
    if (url.pathname === '/api/users' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare('SELECT * FROM users').all();
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Fetched user list from D1 database successfully',
            data: results
          }),
          { headers: corsHeaders }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, message: err.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Create User endpoint
    if (url.pathname === '/api/users' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { name, email, role } = body || {};
        if (!name || !email) {
          return new Response(
            JSON.stringify({ success: false, message: 'Name and email are required fields' }),
            { status: 400, headers: corsHeaders }
          );
        }
        const userRole = role || 'user';
        const result = await env.DB
          .prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)')
          .bind(name, email, userRole)
          .run();

        return new Response(
          JSON.stringify({
            success: true,
            message: 'User created successfully in D1 database',
            data: { id: result.meta?.last_row_id, name, email, role: userRole }
          }),
          { status: 201, headers: corsHeaders }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, message: err.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Root endpoint
    return new Response(
      JSON.stringify({
        message: 'Welcome to Express Backend API on Cloudflare Workers 🚀',
        healthCheck: '/api/health',
        users: '/api/users'
      }),
      { headers: corsHeaders }
    );
  }
};
