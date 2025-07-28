// user-api/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

// Create a new User
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).send(user);
  } catch (err) {
    res.status(500).send({ message: err.message || "Some error occurred while creating the User." });
  }
});

// Retrieve all Users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: err.message || "Some error occurred while retrieving users." });
  }
});

// Retrieve a single User with id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).send({ message: `User with id=${req.params.id} not found.` });
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving User with id=" + req.params.id });
  }
});

// Update a User with id
router.put('/:id', async (req, res) => {
  try {
    const [num] = await User.update(req.body, {
      where: { id: req.params.id }
    });
    if (num == 1) {
      res.status(200).send({ message: "User was updated successfully." });
    } else {
      res.status(404).send({ message: `Cannot update User with id=${req.params.id}. Maybe User was not found or req.body is empty!` });
    }
  } catch (err) {
    res.status(500).send({ message: "Error updating User with id=" + req.params.id });
  }
});

// Delete a User with id
router.delete('/:id', async (req, res) => {
  try {
    const num = await User.destroy({
      where: { id: req.params.id }
    });
    if (num == 1) {
      res.status(200).send({ message: "User was deleted successfully!" });
    } else {
      res.status(404).send({ message: `Cannot delete User with id=${req.params.id}. Maybe User was not found!` });
    }
  } catch (err) {
    res.status(500).send({ message: "Could not delete User with id=" + req.params.id });
  }
});

module.exports = router;