// Music Metadata Controller — D1 Database Operations
import { jsonResponse, errorResponse } from '../utils/http.js';

export const MusicController = {
  // GET /api/music — lấy danh sách tất cả track
  async getAll(env) {
    try {
      const { results } = await env.DB
        .prepare('SELECT * FROM music ORDER BY created_at DESC')
        .all();
      return jsonResponse({ success: true, data: results });
    } catch (err) {
      return errorResponse(err.message, 500);
    }
  },

  // GET /api/music/:id — lấy chi tiết 1 track
  async getById(id, env) {
    try {
      const track = await env.DB
        .prepare('SELECT * FROM music WHERE id = ?')
        .bind(id)
        .first();
      if (!track) return errorResponse('Track not found', 404);
      return jsonResponse({ success: true, data: track });
    } catch (err) {
      return errorResponse(err.message, 500);
    }
  },

  // POST /api/music — tạo mới track metadata
  async create(request, env) {
    try {
      const { title, description, artist, video_key, thumbnail_key } =
        (await request.json()) || {};

      if (!title || !artist || !video_key) {
        return errorResponse('title, artist, and video_key are required');
      }

      const result = await env.DB
        .prepare(
          `INSERT INTO music (title, description, artist, video_key, thumbnail_key)
           VALUES (?, ?, ?, ?, ?)`
        )
        .bind(title, description || '', artist, video_key, thumbnail_key || '')
        .run();

      const track = await env.DB
        .prepare('SELECT * FROM music WHERE id = ?')
        .bind(result.meta?.last_row_id)
        .first();

      return jsonResponse({ success: true, data: track }, 201);
    } catch (err) {
      return errorResponse(err.message, 500);
    }
  },

  // DELETE /api/music/:id — xóa track & dọn file trong R2
  async delete(id, env) {
    try {
      const track = await env.DB
        .prepare('SELECT * FROM music WHERE id = ?')
        .bind(id)
        .first();
      if (!track) return errorResponse('Track not found', 404);

      if (env.MUSIC_BUCKET) {
        if (track.video_key) await env.MUSIC_BUCKET.delete(track.video_key);
        if (track.thumbnail_key) await env.MUSIC_BUCKET.delete(track.thumbnail_key);
      }

      await env.DB.prepare('DELETE FROM music WHERE id = ?').bind(id).run();
      return jsonResponse({ success: true, message: 'Track and files deleted successfully' });
    } catch (err) {
      return errorResponse(err.message, 500);
    }
  },
};
