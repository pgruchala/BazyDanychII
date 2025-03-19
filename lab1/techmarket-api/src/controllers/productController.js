const Products = require("../models/productModel");

const getAllProducts = async (req, res) => {
  try {
    const products = await Products.getAll(req);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const product = await Products.getById(id);
    if (!product) {
      return res
        .status(404)
        .json({ message: `Product with ID ${id} not found` });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProduct = async (req, res) => {
  const newProduct = req.body;
  try {
    const createdProduct = await Products.create(newProduct);
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  const id = parseInt(req.params.id);
  const updatedData = req.body;
  try {
    const updatedProduct = await Products.update(id, updatedData);
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: `Product with ID ${id} not found` });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const success = await Products.delete(id);
    if (!success) {
      return res
        .status(404)
        .json({ message: `Product with ID ${id} not found` });
    }
    res
      .status(200)
      .json({ message: `Product with ID ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
