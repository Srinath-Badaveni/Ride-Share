const Joi = require("joi")

module.exports.routeSchema = Joi.object({
    route: Joi.object({
        startLocation: Joi.string().required(),
        destinationLocation: Joi.string().required(),
        time: Joi.string().required(),
        date: Joi.date().required(),
        seats: Joi.number().required().min(1),
    }).required(),
})


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
})