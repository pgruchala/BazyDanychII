

function getUsers(app, db) {
    app.get("/api/users", async (req, res) => {
      try {
        const users = await db.collection("users").find({}).toArray();
        res.json(users);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }