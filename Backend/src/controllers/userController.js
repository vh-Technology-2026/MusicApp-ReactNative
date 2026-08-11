const { sendSuccess, sendError } = require('../utils/responseHandler');

// Sample mock data for users
let mockUsers = [
  { id: 1, name: 'Nguyen Van A', email: 'vana@example.com', role: 'admin' },
  { id: 2, name: 'Tran Thi B', email: 'thib@example.com', role: 'user' }
];

const getUsers = (req, res) => {
  return sendSuccess(res, 'Fetched user list successfully', mockUsers);
};

const getUserById = (req, res) => {
  const { id } = req.params;
  const user = mockUsers.find((u) => u.id === parseInt(id, 10));

  if (!user) {
    return sendError(res, `User with ID ${id} not found`, 404);
  }

  return sendSuccess(res, 'User found', user);
};

const createUser = (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email) {
    return sendError(res, 'Name and email are required fields', 400);
  }

  const newUser = {
    id: mockUsers.length ? mockUsers[mockUsers.length - 1].id + 1 : 1,
    name,
    email,
    role: role || 'user'
  };

  mockUsers.push(newUser);
  return sendSuccess(res, 'User created successfully', newUser, 201);
};

module.exports = {
  getUsers,
  getUserById,
  createUser
};
