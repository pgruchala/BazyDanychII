const Joi = require('joi')

const reviewSchema = Joi.object({
    productId: Joi.number().integer().positive().required(),
    userId: Joi.number().integer().positive().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title:Joi.string().min(3).max(64).required(),
    content:Joi.string().min(10).max(1000).required(),
    pros:Joi.array().items(Joi.string().min(1).max(100)).default([]),
    cons:Joi.array().items(Joi.string().min(1).max(100)).default([]),
    verifiedPurchase:Joi.boolean().default(false),
    helpfulCount:Joi.number().integer().min(0).default(0),
    createdAt:Joi.date().default(Date.now()),
    updatedAt: Joi.date().default(Date.now())
})

module.exports = {reviewSchema}