const express = require('express');
const UserRouter = express.Router();
const UsersController = require('../controller/users.controller');

UserRouter.post('/signup', UsersController.signupUser);
UserRouter.post('/login', UsersController.loginUser);


UserRouter.get('/', UsersController.getAllUsers);
UserRouter.get('/:id', UsersController.getUserById);
UserRouter.post('/', UsersController.addUser);
UserRouter.delete('/:id', UsersController.deleteUser);
UserRouter.put('/:id', UsersController.updateUser);

UserRouter.get('/:id/cart', UsersController.getCart);
UserRouter.post('/:id/cart', UsersController.updateCart);


UserRouter.get('/:id/favorites', UsersController.getFavorites);
UserRouter.post('/:id/favorites', UsersController.updateFavorites);

module.exports = UserRouter;
