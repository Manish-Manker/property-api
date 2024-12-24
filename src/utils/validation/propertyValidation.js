import joi from 'joi';

const propertySchema = joi.object({
    property_name: joi.string().trim().required().error(new Error('Property name is required and can not be empty')),
    address: joi.string().trim().required().error(new Error('Address is required and can not be empty')),
    latitude: joi.string().required().error(new Error('latitude is required and can not be empty')),
    longitude: joi.string().required().error(new Error('longitude is required and can not be empty')),
    size: joi.number().required().error(new Error('Size is required and can not be empty')),
    typeof_size: joi.string().trim().required().error(new Error('Type of size is required and can not be empty')),
    price: joi.number().required().error(new Error('Price is required and can not be empty')),
    total: joi.number().required().error(new Error('Total is required and can not be empty')),
    custumer_id: joi.string().required().error(new Error('Custumer id  can not be empty')),
    status: joi.string().valid('added', 'sold', 'deal_runing', 'purchase').trim().required().error(new Error("Status is required and it should be added or sold or deal_done or purchase"))
});

const statusSchema = joi.object({
    status: joi.string().valid('added', 'sold', 'deal_runing', 'purchase').trim().required().error(new Error("Status is required and it should be added or sold or deal_done or purchase"))
});

export const validateProperty = (data) => {
    const { error } = propertySchema.validate(data, { abortEarly: false });
    if (error) {
        return { error: error.message };
    }
    return { error: null };
};

export const validateStatus = (data) => {
    const { error } = statusSchema.validate(data, { abortEarly: false });
    if (error) {
        return { error: error.message };
    }
    return { error: null };
};
