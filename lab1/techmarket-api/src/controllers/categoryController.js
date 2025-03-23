const prisma = require("../utils/prisma");

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const formattedCategories = categories.map((category) => ({
      ...category,
      productCount: category._count.products,
      _count: undefined,
    }));

    res.status(200).json({
      status: "success",
      count: categories.length,
      data: formattedCategories,
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryByName = async (req, res, next) => {
  try {
    const { name } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      include: {
        products: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: `Kategoria ${name} nie została znaleziona`,
      });
    }

    res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Nazwa kategorii jest wymagana",
      });
    }
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        status: "error",
        message: `Kategoria ${name} już istnieje`,
      });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        description: description || "",
      },
    });

    res.status(201).json({
      status: "success",
      message: "Kategoria została utworzona pomyślnie",
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);
    const { name, description } = req.body;

    if (isNaN(categoryId)) {
      return res.status(400).json({
        status: "error",
        message: "ID kategorii musi być liczbą",
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return res.status(404).json({
        status: "error",
        message: `Kategoria o ID ${categoryId} nie została znaleziona`,
      });
    }
    if (name && name !== existingCategory.name) {
      const nameExists = await prisma.category.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
          id: { not: categoryId },
        },
      });

      if (nameExists) {
        return res.status(400).json({
          status: "error",
          message: `Kategoria o nazwie ${name} już istnieje`,
        });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Kategoria została pomyślnie zaktualizowana",
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

const removeCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        status: "error",
        message: "ID kategorii musi być liczbą",
      });
    }
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        status: "error",
        message: `Kategoria o ID ${categoryId} nie istnieje`,
      });
    }

    if (existingCategory._count.products > 0) {
      // sprawdza czy kategoria zawiera produkty
      return res.status(400).json({
        status: "error",
        message: `Nie można usunąć kategorii ponieważ zawiera ${existingCategory._count.products} produktów`,
      });
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    res.status(200).json({
      status: "success",
      message: `Kategoria o ID ${categoryId} została pomyślnie usunięta`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryByName,
  updateCategory,
  removeCategory,
  createCategory,
};
