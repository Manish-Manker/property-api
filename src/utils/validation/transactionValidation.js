import joi from "joi";

const transactionValidation = joi.object({
    transaction_type: joi.string().valid("addBalance", "subtractBalance", "purchase", "sell").required().error(new Error("Transaction type is required and must be addBalance, subtractBalance, purchase, sell")),
    amount: joi.number().integer().min(1).required().error(new Error("Amount is required and not empty and minimum of 1 Rs.")),
    propertyId: joi.string().optional(),
    remark: joi.string().optional().allow(""),
});

export const validateTransaction = (data) => {
    const { error } = transactionValidation.validate(data, { abortEarly: false });
    if (error) {
        return { error: error.message };
    }
    return { error: null };
};