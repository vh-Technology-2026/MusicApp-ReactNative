const { sendSuccess, sendError } = require('../utils/responseHandler');

// Sample mock data for users
let mockUsers = [
  { id: 1, name: 'Nguyen Van A', email: 'vana@example.com', role: 'admin' },
  { id: 2, name: 'Tran Thi B', email: 'thib@example.com', role: 'user' }
];

const getUsers = async (req, res) => {
  try {
    const db = req.env?.DB;
    if (db) {
      const { results } = await db.prepare('SELECT * FROM users').all();
      return sendSuccess(res, 'Fetched user list from D1 database successfully', results);
    }
    return sendSuccess(res, 'Fetched user list successfully (mock)', mockUsers);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.env?.DB;
    if (db) {
      const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
      if (!user) {
        return sendError(res, `User with ID ${id} not found`, 404);
      }
      return sendSuccess(res, 'User found in D1 database', user);
    }
    const user = mockUsers.find((u) => u.id === parseInt(id, 10));
    if (!user) {
      return sendError(res, `User with ID ${id} not found`, 404);
    }
    return sendSuccess(res, 'User found', user);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email) {
      return sendError(res, 'Name and email are required fields', 400);
    }

    const db = req.env?.DB;
    if (db) {
      const userRole = role || 'user';
      const result = await db
        .prepare('INSERT INTO users (name, email, role) VALUES (?, ?, ?)')
        .bind(name, email, userRole)
        .run();

      const newUser = {
        id: result.meta?.last_row_id,
        name,
        email,
        role: userRole
      };
      return sendSuccess(res, 'User created successfully in D1 database', newUser, 201);
    }

    const newUser = {
      id: mockUsers.length ? mockUsers[mockUsers.length - 1].id + 1 : 1,
      name,
      email,
      role: role || 'user'
    };
    mockUsers.push(newUser);
    return sendSuccess(res, 'User created successfully (mock)', newUser, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser
};
