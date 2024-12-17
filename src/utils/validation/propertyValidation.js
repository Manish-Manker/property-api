import joi from 'joi';

const propertySchema = joi.object({
    property_name: joi.string().trim().required().error(new Error('property name is required and can not be empty')),
    address: joi.string().trim().required().error(new Error('address is required and can not be empty')),
    latitude: joi.string().required().error(new Error('latitude is required and can not be empty')),
    longitude: joi.string().required().error(new Error('longitude is required and can not be empty')),
    size: joi.number().required().error(new Error('size is required and can not be empty')),
    typeof_size: joi.string().trim().required().error(new Error('type of size is required and can not be empty')),
    price: joi.number().required().error(new Error('price is required and can not be empty')),
    total: joi.number().required().error(new Error('total is required and can not be empty')),
    custumer_id: joi.string().optional().error(new Error('custumer id  can not be empty')),
});

export const validateProperty = (data) => {
    const { error } = propertySchema.validate(data, { abortEarly: false });
    if (error) {
        return { error: error.message };
    }
    return { error: null };
};

