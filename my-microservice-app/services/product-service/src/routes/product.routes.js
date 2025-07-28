// services/product-service/src/routes/product.routes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');

// Create a new Product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).send(product);
  } catch (err) {
    res.status(500).send({ message: err.message || "Some error occurred while creating the Product." });
  }
});

// Retrieve all Products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).send(products);
  } catch (err) {
    res.status(500).send({ message: err.message || "Some error occurred while retrieving products." });
  }
});

// Retrieve a single Product with id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).send({ message: `Product with id=${req.params.id} not found.` });
    }
    res.status(200).send(product);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving Product with id=" + req.params.id });
  }
});

// Update a Product with id
router.put('/:id', async (req, res) => {
  try {
    const [num] = await Product.update(req.body, {
      where: { id: req.params.id }
    });
    if (num == 1) {
      res.status(200).send({ message: "Product was updated successfully." });
    } else {
      res.status(404).send({ message: `Cannot update Product with id=${req.params.id}. Maybe Product was not found or req.body is empty!` });
    }
  } catch (err) {
    res.status(500).send({ message: "Error updating Product with id=" + req.params.id });
  }
});

// Delete a Product with id
router.delete('/:id', async (req, res) => {
  try {
    const num = await Product.destroy({
      where: { id: req.params.id }
    });
    if (num == 1) {
      res.status(200).send({ message: "Product was deleted successfully!" });
    } else {
      res.status(404).send({ message: `Cannot delete Product with id=${req.params.id}. Maybe Product was not found!` });
    }
  } catch (err) {
    res.status(500).send({ message: "Could not delete Product with id=" + req.params.id });
  }
});

module.exports = router;