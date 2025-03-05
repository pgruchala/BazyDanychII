const {getData,getDataById,deleteData,updateData,addData} = require('../controllers/productController')

function fetchData(app) {
    app.get("/products", async (req, res) => {
      try {
        const data = getData()
        res.status(200).json(data)
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
}
function fetchDataById(app) {
  app.get("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id)
      const product = getDataById(id)
      
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${id} not found` })
      }
      
      res.status(200).json(product)
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

function createData(app) {
  app.post("/products", async (req, res) => {
    try {
      const newProduct = req.body
      
      if (!newProduct.name || !newProduct.price || !newProduct.category) {
        return res.status(400).json({ message: 'Name, price, and category are required fields' });
      }

      const products = getData()
      const maxId = Math.max(...products.map(product => product.id), 0)
      
      newProduct.id = maxId + 1
      newProduct.createdAt = new Date().toISOString()
      newProduct.isAvailable = newProduct.isAvailable !== undefined ? newProduct.isAvailable : true
      newProduct.stockCount = newProduct.stockCount || 0
      
      addData(newProduct)
      
      res.status(201).json(newProduct)
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

function updateDataById(app) {
  app.put("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedData = req.body;
      
      const product = getDataById(id);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${id} not found` });
      }

      const success = updateData(id, updatedData);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to update product" });
      }
      
      const updatedProduct = getDataById(id);
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

function deleteDataById(app) {
  app.delete("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id)
      
      const product = getDataById(id)
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${id} not found` })
      }
      
      deleteData(id)
      
      res.status(200).json({ message: `Product with ID ${id} deleted successfully` })
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = {fetchData, fetchDataById,createData,updateDataById,deleteDataById}