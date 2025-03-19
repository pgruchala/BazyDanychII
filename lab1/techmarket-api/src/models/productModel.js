const pool = require("../config/db");

const Products = {
  getAll: async (req) => {
    let sqlQuery = "SELECT * FROM products";
    const params = [];

    const { available, sort } = req.query;

    if (available) {
      params.push(available === "true");
      sqlQuery += ` WHERE isavailable = $${params.length}`;
    }

    if (sort) {
      sqlQuery += ` ORDER BY price ${sort === "asc" ? "ASC" : "DESC"}`;
    }

    const { rows } = await pool.query(sqlQuery, params);
    return rows;
  },
  getById: async (id) => {
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    return rows[0];
  },
  create: async (product) => {
    const { rows } = await pool.query(
      "INSERT INTO products (name, category, description, price, brand) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, category, description, price, brand, stockcount, isavailable, createdat",
      [
        product.name,
        product.category,
        product.description,
        product.price,
        product.brand,
      ]
    );
    return rows[0];
  },
  update: async (id, product) => {
    const existingProduct = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );
    if (existingProduct.rows.length === 0) return null;
    const updatedData = {
      ...existingProduct.rows[0],
      ...product,
    };
    const { rows } = await pool.query(
      "UPDATE products SET name = $1, category = $2, description = $3, price = $4, stockcount = $5, brand = $6, isAvailable = $7 WHERE id = $8 RETURNING *",
      [
        updatedData.name,
        updatedData.category,
        updatedData.description,
        updatedData.price,
        updatedData.stockcount,
        updatedData.brand,
        updatedData.isavailable,
        id,
      ]
    );
    return rows[0];
  },
  delete: async (id) => {
    const { rows } = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );
    return rows[0];
  },
};

module.exports = Products;
