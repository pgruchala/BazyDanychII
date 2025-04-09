const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// Review analytics endpoints
router.get("/reviews/stats", analyticsController.getReviewStatsByRating);
router.get("/reviews/trends", analyticsController.getReviewTrends);

// View analytics endpoints
router.get("/views/stats", analyticsController.getViewStats);
router.get("/views/trends", analyticsController.getViewTrends);

// Recommendation endpoint
router.get("/recommendations", analyticsController.getRecommendations);

module.exports = router;
