const prisma = require("../utils/prisma");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    res.status(200).json({
      status: "success",
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        reviews: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: `Użytkownik ${username} nie został znaleziony`,
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Nazwa użytkownika, email i hasło są wymagane",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Użytkownik o tej nazwie lub adresie email już istnieje",
      });
    }

    const salt = 10;
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName: firstName || "",
        lastName: lastName || "",
      },
    });

    res.status(201).json({
      status: "success",
      message: "Użytkownik został utworzony pomyślnie",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { email, firstName, lastName, password } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        status: "error",
        message: "ID użytkownika musi być liczbą",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: `Użytkownik o ID ${userId} nie został znaleziony`,
      });
    }

    const updateData = {};

    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    if (password !== undefined) {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.status(200).json({
      status: "success",
      message: "Użytkownik został pomyślnie zaktualizowany",
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    });
  } catch (error) {
    next(error);
  }
};

const removeUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({
        status: "error",
        message: "ID użytkownika musi być liczbą",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: `Użytkownik o ID ${userId} nie istnieje`,
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      status: "success",
      message: `Użytkownik o ID ${userId} został pomyślnie usunięty`,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getAllUsers,
  getUserByUsername,
  createUser,
  updateUser,
  removeUser,
};
