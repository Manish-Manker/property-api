import joi from 'joi';

const milestoneSchema = joi.object({
    amount: joi.number().integer().min(1).required().error(new Error("Amount is required and not empty and minimum of 1 Rs.")),
    dueDate: joi.string().required().error(new Error('Due date is required and not empty')),
    status: joi.string().valid('paid', 'unpaid').required().error(new Error('Status is required and it should be paid or unpaid')),
    propertyId: joi.string().required().error(new Error('Property id is required and not empty')),
    remark: joi.string().allow('').required().error(new Error('Remark should be string')),
});

export const validateMilestone = (data) => {
    const { error } = milestoneSchema.validate(data, { abortEarly: false });
    if (error) {
        return { error: error.message };
    }
    return { error: null };
}