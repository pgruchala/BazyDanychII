const { ObjectId } = require('mongodb');
const { getDb } = require('../../mongo');
const prisma = require('../utils/prisma');

// Helper function to get date range
function getDateRange(days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return { startDate, endDate };
}

// Get review statistics by rating
const getReviewStatsByRating = async (req, res, next) => {
  try {
    const { productId } = req.query;
    
    if (!productId) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID is required'
      });
    }

    const parsedProductId = parseInt(productId);
    const db = getDb();
    
    // First check if product exists
    const productExists = await prisma.product.findUnique({
      where: { id: parsedProductId }
    });
    
    if (!productExists) {
      return res.status(404).json({
        status: 'error',
        message: `Product with ID ${productId} not found`
      });
    }
    
    // Get pre-calculated stats if available
    const preCalculatedStats = await db.collection('productRatingStats').findOne(
      { productId: parsedProductId }
    );
    
    if (preCalculatedStats) {
      // Calculate percentage distribution
      const total = preCalculatedStats.totalReviews;
      const percentageDistribution = {};
      
      for (const [rating, count] of Object.entries(preCalculatedStats.ratingDistribution)) {
        percentageDistribution[rating] = total > 0 ? (count / total) * 100 : 0;
      }
      
      return res.status(200).json({
        status: 'success',
        data: {
          productId: parsedProductId,
          totalReviews: preCalculatedStats.totalReviews,
          averageRating: preCalculatedStats.averageRating,
          ratingDistribution: preCalculatedStats.ratingDistribution,
          percentageDistribution,
          lastUpdated: preCalculatedStats.updatedAt
        }
      });
    }
    
    // If no pre-calculated stats, calculate on-the-fly
    const aggregationPipeline = [
      { $match: { productId: parsedProductId } },
      { $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];
    
    const ratingCounts = await db.collection('reviews').aggregate(aggregationPipeline).toArray();
    
    // Calculate total and distribution
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    let totalReviews = 0;
    let totalRatingSum = 0;
    
    ratingCounts.forEach(item => {
      ratingDistribution[item._id] = item.count;
      totalReviews += item.count;
      totalRatingSum += item._id * item.count;
    });
    
    const averageRating = totalReviews > 0 ? totalRatingSum / totalReviews : 0;
    
    // Calculate percentage distribution
    const percentageDistribution = {};
    for (const [rating, count] of Object.entries(ratingDistribution)) {
      percentageDistribution[rating] = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        productId: parsedProductId,
        totalReviews,
        averageRating,
        ratingDistribution,
        percentageDistribution
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// Get review trends over time
const getReviewTrends = async (req, res, next) => {
  try {
    const { productId, days = 30 } = req.query;
    const parsedDays = parseInt(days);
    
    if (!productId) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID is required'
      });
    }
    
    const parsedProductId = parseInt(productId);
    const { startDate, endDate } = getDateRange(parsedDays);
    
    const db = getDb();
    
    const aggregationPipeline = [
      { 
        $match: { 
          productId: parsedProductId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { 
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          count: 1,
          averageRating: 1
        }
      },
      { $sort: { date: 1 } }
    ];
    
    const reviewTrends = await db.collection('reviews').aggregate(aggregationPipeline).toArray();
    
    // Fill in missing dates
    const trendResults = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Find if we have data for this date
      const dayData = reviewTrends.find(item => 
        item.date.toISOString().split('T')[0] === dateStr
      );
      
      trendResults.push({
        date: dateStr,
        count: dayData ? dayData.count : 0,
        averageRating: dayData ? parseFloat(dayData.averageRating.toFixed(2)) : null
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        productId: parsedProductId,
        period: `${parsedDays} days`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        trends: trendResults
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// Get product view statistics
const getViewStats = async (req, res, next) => {
  try {
    const { productId, days = 30 } = req.query;
    
    if (!productId) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID is required'
      });
    }
    
    const parsedProductId = parseInt(productId);
    const parsedDays = parseInt(days);
    const { startDate, endDate } = getDateRange(parsedDays);
    
    const db = getDb();
    
    // Perform multiple aggregations
    const totalViewsPipeline = [
      {
        $match: {
          productId: parsedProductId,
          viewDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $count: 'totalViews'
      }
    ];
    
    const uniqueUsersPipeline = [
      {
        $match: {
          productId: parsedProductId,
          viewDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$userId'
        }
      },
      {
        $count: 'uniqueUsers'
      }
    ];
    
    const avgDurationPipeline = [
      {
        $match: {
          productId: parsedProductId,
          viewDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: '$duration' }
        }
      }
    ];
    
    const sourcesPipeline = [
      {
        $match: {
          productId: parsedProductId,
          viewDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          source: '$_id',
          count: 1
        }
      }
    ];
    
    // Execute aggregations
    const [totalViewsResult, uniqueUsersResult, avgDurationResult, sourcesResult] = await Promise.all([
      db.collection('productViews').aggregate(totalViewsPipeline).toArray(),
      db.collection('productViews').aggregate(uniqueUsersPipeline).toArray(),
      db.collection('productViews').aggregate(avgDurationPipeline).toArray(),
      db.collection('productViews').aggregate(sourcesPipeline).toArray()
    ]);
    
    // Extract results
    const totalViews = totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;
    const uniqueUsers = uniqueUsersResult.length > 0 ? uniqueUsersResult[0].uniqueUsers : 0;
    const avgDuration = avgDurationResult.length > 0 ? avgDurationResult[0].averageDuration : 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        productId: parsedProductId,
        period: `${parsedDays} days`,
        totalViews,
        uniqueUsers,
        averageDuration: parseFloat(avgDuration.toFixed(2)),
        sources: sourcesResult,
        conversionRate: totalViews > 0 ? parseFloat(((uniqueUsers / totalViews) * 100).toFixed(2)) : 0
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// Get view trends over time
const getViewTrends = async (req, res, next) => {
  try {
    const { productId, days = 30, groupBy = 'day' } = req.query;
    
    if (!productId) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID is required'
      });
    }
    
    const parsedProductId = parseInt(productId);
    const parsedDays = parseInt(days);
    const { startDate, endDate } = getDateRange(parsedDays);
    
    const db = getDb();
    
    // Define grouping based on parameter
    let groupingExpression;
    
    switch (groupBy) {
      case 'hour':
        groupingExpression = {
          year: { $year: '$viewDate' },
          month: { $month: '$viewDate' },
          day: { $dayOfMonth: '$viewDate' },
          hour: { $hour: '$viewDate' }
        };
        break;
      case 'week':
        groupingExpression = {
          year: { $year: '$viewDate' },
          week: { $week: '$viewDate' }
        };
        break;
      case 'month':
        groupingExpression = {
          year: { $year: '$viewDate' },
          month: { $month: '$viewDate' }
        };
        break;
      case 'day':
      default:
        groupingExpression = {
          year: { $year: '$viewDate' },
          month: { $month: '$viewDate' },
          day: { $dayOfMonth: '$viewDate' }
        };
    }
    
    const aggregationPipeline = [
      {
        $match: {
          productId: parsedProductId,
          viewDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupingExpression,
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          averageDuration: { $avg: '$duration' }
        }
      },
      {
        $project: {
          _id: 0,
          timeGroup: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          averageDuration: 1
        }
      },
      { $sort: { 'timeGroup.year': 1, 'timeGroup.month': 1, 'timeGroup.day': 1 } }
    ];
    
    const viewTrends = await db.collection('productViews').aggregate(aggregationPipeline).toArray();
    
    // Format the results based on grouping
    const formattedTrends = viewTrends.map(item => {
      let dateLabel;
      
      if (groupBy === 'hour') {
        dateLabel = `${item.timeGroup.year}-${item.timeGroup.month.toString().padStart(2, '0')}-${item.timeGroup.day.toString().padStart(2, '0')} ${item.timeGroup.hour.toString().padStart(2, '0')}:00`;
      } else if (groupBy === 'week') {
        const firstDayOfWeek = new Date(item.timeGroup.year, 0, 1);
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() + (item.timeGroup.week * 7));
        dateLabel = `Week ${item.timeGroup.week}, ${item.timeGroup.year}`;
      } else if (groupBy === 'month') {
        dateLabel = `${item.timeGroup.year}-${item.timeGroup.month.toString().padStart(2, '0')}`;
      } else {
        dateLabel = `${item.timeGroup.year}-${item.timeGroup.month.toString().padStart(2, '0')}-${item.timeGroup.day.toString().padStart(2, '0')}`;
      }
      
      return {
        timeGroup: dateLabel,
        views: item.count,
        uniqueUsers: item.uniqueUsers,
        averageDuration: parseFloat(item.averageDuration.toFixed(2))
      };
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        productId: parsedProductId,
        period: `${parsedDays} days`,
        groupBy,
        trends: formattedTrends
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// Get product recommendations based on user browsing history and similarity
const getRecommendations = async (req, res, next) => {
  try {
    const { userId, limit = 5 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    const parsedUserId = parseInt(userId);
    const parsedLimit = parseInt(limit);
    const { startDate } = getDateRange(30); // Look at last 30 days
    
    const db = getDb();
    
    // Step 1: Get user's recently viewed products
    const userViewedProductsPipeline = [
      {
        $match: {
          userId: parsedUserId,
          viewDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$productId',
          lastViewed: { $max: '$viewDate' },
          viewCount: { $sum: 1 }
        }
      },
      { $sort: { lastViewed: -1 } },
      { $limit: 10 } // Get top 10 recently viewed products
    ];
    
    const userViewedProducts = await db.collection('productViews').aggregate(userViewedProductsPipeline).toArray();
    const userViewedProductIds = userViewedProducts.map(p => p._id);
    
    // If user has no viewing history, use most popular products
    if (userViewedProductIds.length === 0) {
      const popularProductsPipeline = [
        {
          $match: {
            viewDate: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$productId',
            viewCount: { $sum: 1 }
          }
        },
        { $sort: { viewCount: -1 } },
        { $limit: parsedLimit }
      ];
      
      const popularProducts = await db.collection('productViews').aggregate(popularProductsPipeline).toArray();
      
      // Fetch product details
      const productIds = popularProducts.map(p => p._id);
      const productDetails = await prisma.product.findMany({
        where: {
          id: { in: productIds }
        }
      });
      
      return res.status(200).json({
        status: 'success',
        recommendationType: 'popular',
        data: {
          recommendations: productDetails.map(p => ({
            ...p,
            recommendationReason: 'Popular product'
          }))
        }
      });
    }
    
    // Step 2: Find similar users based on viewing patterns
    const similarUsersPipeline = [
      {
        $match: {
          userId: { $ne: parsedUserId },
          productId: { $in: userViewedProductIds }
        }
      },
      {
        $group: {
          _id: '$userId',
          commonProducts: { $addToSet: '$productId' },
          commonCount: { $sum: 1 }
        }
      },
      {
        $match: {
          commonCount: { $gte: 2 } // Users must have at least 2 products in common
        }
      },
      {
        $project: {
          _id: 1,
          userId: '$_id',
          commonCount: 1,
          similarity: { $divide: ['$commonCount', { $size: userViewedProductIds }] }
        }
      },
      { $sort: { similarity: -1 } },
      { $limit: 20 } // Top 20 similar users
    ];
    
    const similarUsers = await db.collection('productViews').aggregate(similarUsersPipeline).toArray();
    const similarUserIds = similarUsers.map(u => u.userId);
    
    // If no similar users found, use products from same categories
    if (similarUserIds.length === 0) {
      // Get categories of products user viewed
      const viewedProducts = await prisma.product.findMany({
        where: {
          id: { in: userViewedProductIds }
        },
        select: {
          id: true,
          categoryId: true
        }
      });
      
      const categoryIds = [...new Set(viewedProducts.map(p => p.categoryId))];
      
      // Get products from same categories
      const similarCategoryProducts = await prisma.product.findMany({
        where: {
          categoryId: { in: categoryIds },
          id: { notIn: userViewedProductIds }
        },
        take: parsedLimit
      });
      
      return res.status(200).json({
        status: 'success',
        recommendationType: 'category',
        data: {
          recommendations: similarCategoryProducts.map(p => ({
            ...p,
            recommendationReason: 'Based on categories you\'ve viewed'
          }))
        }
      });
    }
    
    // Step 3: Get products viewed by similar users that the current user hasn't seen
    const recommendedProductsPipeline = [
      {
        $match: {
          userId: { $in: similarUserIds },
          productId: { $nin: userViewedProductIds }
        }
      },
      {
        $group: {
          _id: '$productId',
          userCount: { $addToSet: '$userId' },
          viewCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 1,
          productId: '$_id',
          userCount: { $size: '$userCount' },
          viewCount: 1,
          score: { $multiply: [{ $size: '$userCount' }, '$viewCount'] }
        }
      },
      { $sort: { score: -1 } },
      { $limit: parsedLimit }
    ];
    
    const recommendedProducts = await db.collection('productViews').aggregate(recommendedProductsPipeline).toArray();
    
    // Get product details from primary database
    const productIds = recommendedProducts.map(p => p.productId);
    const productDetails = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      }
    });
    
    // Map products with their recommendation score
    const recommendations = productDetails.map(product => {
      const recommendation = recommendedProducts.find(r => r.productId === product.id);
      return {
        ...product,
        recommendationScore: recommendation.score,
        viewedByUsers: recommendation.userCount,
        recommendationReason: 'Based on similar users\' interests'
      };
    });
    
    res.status(200).json({
      status: 'success',
      recommendationType: 'collaborative',
      data: {
        recommendations
      }
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviewStatsByRating,
  getReviewTrends,
  getViewStats,
  getViewTrends,
  getRecommendations
};