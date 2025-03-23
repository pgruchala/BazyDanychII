const prisma = require("../utils/prisma");

const getAllProducts = async (req, res, next) => {
  try {
    const { available, sort } = req.query;
    const where = {};
    if (available) {
      where.isAvailable = available === "true";
    }
    const orderBy = {};
    if (sort) {
      orderBy.price = sort === "asc" ? "asc" : "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const products = await prisma.product.findMany({ where, orderBy });

    res.status(200).json({
      status: "success",
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    if (isNaN(id)) {
      return res.status(400).json({
        status: "error",
        message: "ID produktu musi być liczbą",
      });
    }

    const product = await prisma.product.findUnique({ where: { id: id } });

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: `Produkt o ID ${id} nie został znaleziony`,
      });
    }

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      description,
      price,
      brand,
      stockCount,
      isAvailable,
      imageUrl,
    } = req.body;

    let categoryRecord = await prisma.category.findFirst({
      where: { name: category },
    });

    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          name: category,
          description: `Category for ${category} products`,
        },
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        categoryId: categoryRecord.id,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        brand,
        stockCount: stockCount !== undefined ? parseInt(stockCount) : 0,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        imageUrl,
      },
    });
    res.status(201).json({
      status: "success",
      message: "Produkt został utworzony pomyślnie",
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const {
      name,
      category,
      description,
      price,
      brand,
      stockCount,
      isAvailable,
      imageUrl,
    } = req.body;

    if (isNaN(productId)) {
      return res.status(400).json({
        status: "error",
        message: "ID produktu musi być liczbą",
      });
    }
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: `Produkt o ID ${productId} nie został znaleziony`,
      });
    }
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name !== undefined ? name : undefined,
        category: category !== undefined ? category : undefined,
        description: description !== undefined ? description : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        brand: brand !== undefined ? brand : undefined,
        stockCount: stockCount !== undefined ? parseInt(stockCount) : undefined,
        isAvailable: isAvailable !== undefined ? isAvailable : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Produkt został pomyślnie zaktualizowany",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({
        status: "error",
        message: "ID produktu musi być liczbą",
      });
    }
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: `Produkt o id ${productId} nie istnieje`,
      });
    }
    await prisma.product.delete({
      where: { id: productId },
    });
    res.status(200).json({
      status: "success",
      message: `Produkt o ID ${productId} został pomyślnie usunięty`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
