const prisma = require("../utils/prisma");

const addToCart = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const productId = parseInt(req.body.productId);
    const quantity = parseInt(req.body.quantity)
    if (!userId || !productId || !quantity || quantity < 1) {
      if (!userId) {
        console.log("gowno");
      } else if (!productId) {
        console.log("sraka");
      } else {
        console.log("kasztan");
      }
      return res.status(400).json({
        status: "error",
        message: "user  id / product id / quantity>0 required",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: `Product with id: ${productId} not found`,
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: `User with ID ${userId} not found`,
      });
    }
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
          addedAt: new Date(),
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      message: "Product added to cart successfully",
      data: updatedCart,
    });
  } catch (err) {
    next(err);
  }
};

const getCart = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user ID",
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: {
            addedAt: "desc",
          },
        },
      },
    });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "Quantity cannot be lower than 1",
      });
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: parseInt(cartItemId) },
      data: {
        quantity,
        addedAt: new Date(),
      },
      include: { product: true },
    });

    res.status(200).json({
      status: "success",
      message: "Cart item updated successfully",
      data: updatedCartItem,
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;

    await prisma.cartItem.delete({
      where: { id: parseInt(cartItemId) },
    });

    res.status(200).json({
      status: "success",
      message: "Product removed ccessfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
};
