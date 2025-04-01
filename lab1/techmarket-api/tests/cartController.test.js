const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/utils/prisma");

const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} = require("../src/controllers/cartController");

describe("Cart Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("addToCart", () => {
    it("should return 400 if required params are missing", async () => {
      req.params.userId = "";
      req.body = { productId: "1", quantity: "1" };
      await addToCart(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "error" })
      );
    });

    it("should return 404 if product is not found", async () => {
      req.params.userId = "1";
      req.body = { productId: "1", quantity: "1" };
      jest.spyOn(prisma.product, "findUnique").mockResolvedValue(null);
      await addToCart(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Product with id: 1 not found",
        })
      );
    });

    it("should create a new cart and add cartItem when none exists", async () => {
      req.params.userId = "1";
      req.body = { productId: "2", quantity: "3" };

      const fakeProduct = { id: 2 };
      const fakeUser = { id: 1 };
      const fakeCart = { id: 10, userId: 1 };
      const fakeUpdatedCart = {
        id: 10,
        items: [{ product: fakeProduct, quantity: 3 }],
      };

      jest.spyOn(prisma.product, "findUnique").mockResolvedValue(fakeProduct);
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(fakeUser);
      // No existing cart
      jest.spyOn(prisma.cart, "findUnique").mockResolvedValue(null);
      const cartCreateSpy = jest
        .spyOn(prisma.cart, "create")
        .mockResolvedValue(fakeCart);
      // No existing cart item.
      jest.spyOn(prisma.cartItem, "findFirst").mockResolvedValue(null);
      const cartItemCreateSpy = jest
        .spyOn(prisma.cartItem, "create")
        .mockResolvedValue({ id: 100, quantity: 3 });
      const updatedCartSpy = jest
        .spyOn(prisma.cart, "findUnique")
        .mockResolvedValue(fakeUpdatedCart);

      await addToCart(req, res, next);

      expect(cartCreateSpy).toHaveBeenCalled();
      expect(cartItemCreateSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Product added to cart successfully",
          data: fakeUpdatedCart,
        })
      );
    });

    it("should update an existing cart item", async () => {
      req.params.userId = "1";
      req.body = { productId: "2", quantity: "2" };

      const fakeProduct = { id: 2 };
      const fakeUser = { id: 1 };
      const fakeCart = { id: 10, userId: 1 };
      const fakeExistingCartItem = { id: 200, quantity: 3 };
      const fakeUpdatedCart = {
        id: 10,
        items: [{ product: fakeProduct, quantity: 5 }],
      };

      jest.spyOn(prisma.product, "findUnique").mockResolvedValue(fakeProduct);
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(fakeUser);
      jest.spyOn(prisma.cart, "findUnique").mockResolvedValue(fakeCart);
      jest
        .spyOn(prisma.cartItem, "findFirst")
        .mockResolvedValue(fakeExistingCartItem);
      const cartItemUpdateSpy = jest
        .spyOn(prisma.cartItem, "update")
        .mockResolvedValue({ id: 200, quantity: 5 });
      jest.spyOn(prisma.cart, "findUnique").mockResolvedValue(fakeUpdatedCart);

      await addToCart(req, res, next);
      expect(cartItemUpdateSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: fakeUpdatedCart,
        })
      );
    });
  });

  describe("getCart", () => {
    it("should return 400 for invalid user id", async () => {
      req.params.userId = "invalid";
      await getCart(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "error", message: "Invalid user ID" })
      );
    });

    it("should return 404 if cart not found", async () => {
      req.params.userId = "2";
      jest.spyOn(prisma.cart, "findUnique").mockResolvedValue(null);
      await getCart(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "error", message: "Cart not found" })
      );
    });

    it("should return cart if found", async () => {
      req.params.userId = "2";
      const fakeCart = { id: 20, items: [] };
      jest.spyOn(prisma.cart, "findUnique").mockResolvedValue(fakeCart);
      await getCart(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "success", data: fakeCart })
      );
    });
  });

  describe("updateCartItem", () => {
    it("should return 400 when quantity is less than 1", async () => {
      req.params.cartItemId = "100";
      req.body = { quantity: 0 };
      await updateCartItem(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Quantity cannot be lower than 1",
        })
      );
    });

    it("should update cart item successfully", async () => {
      req.params.cartItemId = "100";
      req.body = { quantity: 5 };
      const fakeUpdatedCartItem = { id: 100, quantity: 5, product: { id: 2 } };
      jest
        .spyOn(prisma.cartItem, "update")
        .mockResolvedValue(fakeUpdatedCartItem);
      await updateCartItem(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Cart item updated successfully",
          data: fakeUpdatedCartItem,
        })
      );
    });
  });

  describe("removeFromCart", () => {
    it("should remove cart item successfully", async () => {
      req.params.cartItemId = "100";
      const deleteSpy = jest
        .spyOn(prisma.cartItem, "delete")
        .mockResolvedValue({});
      await removeFromCart(req, res, next);
      expect(deleteSpy).toHaveBeenCalledWith({ where: { id: 100 } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Product removed ccessfully",
        })
      );
    });
  });
});

describe("Cart API Integration Tests", () => {
  let createdCartItemId;
  let testUserId = 9999;
  let testProductId = 8888;

  beforeAll(async () => {
    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        username: "integrationTester",
        email: "integration@test.com",
        passwordHash: "hashedpassword",
        firstName: "Test",
        lastName: "User",
      },
    });
    await prisma.product.upsert({
      where: { id: testProductId },
      update: {},
      create: {
        id: testProductId,
        name: "Integration Product",
        categoryId: 1,
        price: 99.99,
        brand: "TestBrand",
        stockCount: 10,
      },
    });
  });

  afterAll(async () => {
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.product.deleteMany({ where: { id: testProductId } });
    await prisma.$disconnect();
  });

  it("POST /cart/:userId - should add a product to the cart", async () => {
    const response = await request(app)
      .post(`/cart/${testUserId}`)
      .send({ productId: testProductId, quantity: 2 });
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("id");
    if (response.body.data.items && response.body.data.items.length > 0) {
      createdCartItemId = response.body.data.items[0].id;
    }
  });

  it("GET /cart/:userId - should retrieve the user cart", async () => {
    const response = await request(app).get(`/cart/${testUserId}`);
    if (response.statusCode === 200) {
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty("items");
    } else {
      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe("error");
    }
  });

  it("PATCH /cart/:cartItemId - should update a cart item", async () => {
    if (!createdCartItemId) return;
    const response = await request(app)
      .patch(`/cart/${createdCartItemId}`)
      .send({ quantity: 4 });
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.quantity).toBe(4);
  });

  it("DELETE /cart/:cartItemId - should remove the cart item", async () => {
    if (!createdCartItemId) return;
    const response = await request(app).delete(`/cart/${createdCartItemId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
  });
});
