const Users = require('../model/users.model');
const Carts = require('../model/carts.model');

// Get all users (hide passwords)
function getAllUsers(req, res) {
  const safeUsers = Users.map(user => {
    const { password, ...safeUser } = user;
    return safeUser;
  });
  res.json(safeUsers);
}

// Get a user by ID (hide password)
function getUserById(req, res) {
  const id = Number(req.params.id);
  const user = Users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Remove password from response
  const { password, ...safeUser } = user;
  res.json(safeUser);
}

// Add a new user (Signup) - IMPROVED ID GENERATION
function addUser(req, res) {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  // Check if user already exists
  const existingUser = Users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  // Generate proper ID (find max ID + 1)
  const maxId = Users.length > 0 ? Math.max(...Users.map(u => u.id)) : 0;

  const newUser = {
    id: maxId + 1,
    username,
    email,
    password, // In production, hash this with bcrypt!
    cart: [], // Initialize empty cart
    favorites: [] // Initialize empty favorites
  };

  Users.push(newUser);
  
  // Return user without password
  const { password: pwd, ...safeUser } = newUser;
  res.status(201).json({ message: 'User created successfully', user: safeUser });
}

// Delete a user by ID
function deleteUser(req, res) {
  const id = Number(req.params.id);
  const index = Users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const deletedUser = Users.splice(index, 1)[0];

  // Also delete cart for this user
  const cartIndex = Carts.findIndex(c => c.userId === id);
  if (cartIndex !== -1) {
    Carts.splice(cartIndex, 1);
  }

  // Remove password from response
  const { password, ...safeUser } = deletedUser;
  res.status(200).json({ message: 'User deleted successfully', deletedUser: safeUser });
}

// Update user (protect password field)
function updateUser(req, res) {
  const id = Number(req.params.id);
  const index = Users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Don't allow updating ID
  const { id: bodyId, ...updateData } = req.body;
  
  Users[index] = { ...Users[index], ...updateData };
  
  // Return user without password
  const { password, ...safeUser } = Users[index];
  res.status(200).json(safeUser);
}

// Login user - IMPROVED SECURITY
function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = Users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Return success WITHOUT password
  res.json({
    message: 'Login successful',
    id: user.id,         
    username: user.username,
    email: user.email
  });
}

function signupUser(req, res) {
  return addUser(req, res);
}

// Get cart for a user by user ID - SIMPLIFIED
function getCart(req, res) {
  const userId = Number(req.params.id);
  
  const user = Users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Use user's cart as primary source
  res.json({
    userId: userId,
    items: user.cart || []
  });
}

// Update cart for a user by user ID - SIMPLIFIED
function updateCart(req, res) {
  const userId = Number(req.params.id);
  const { items } = req.body;

  const userIndex = Users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array' });
  }

  // Update user's cart (primary storage)
  Users[userIndex].cart = items;

  // Also sync to Carts array for backward compatibility
  let cart = Carts.find(c => c.userId === userId);
  if (!cart) {
    cart = { userId, items };
    Carts.push(cart);
  } else {
    cart.items = items;
  }

  console.log(`Cart updated for user ${userId}:`, items);
  res.json({ 
    message: 'Cart updated successfully', 
    userId: userId,
    items: items
  });
}

// Get favorites for a user by user ID
function getFavorites(req, res) {
  const userId = Number(req.params.id);
  
  const user = Users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ 
    userId: userId,
    favorites: user.favorites || [] 
  });
}

// Update favorites for a user by user ID
function updateFavorites(req, res) {
  const userId = Number(req.params.id);
  const { favorites } = req.body;

  const userIndex = Users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!Array.isArray(favorites)) {
    return res.status(400).json({ error: 'Favorites must be an array' });
  }

  // Update user's favorites
  Users[userIndex].favorites = favorites;

  console.log(`Favorites updated for user ${userId}:`, favorites);
  res.json({ 
    message: 'Favorites updated successfully', 
    userId: userId,
    favorites: favorites 
  });
}

module.exports = {
  getAllUsers,
  getUserById,
  addUser,
  deleteUser,
  updateUser,
  getCart,
  updateCart,
  getFavorites,    
  updateFavorites,
  loginUser,
  signupUser       
};