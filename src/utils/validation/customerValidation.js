import joi from "joi";

const customerValidation = joi.object({
    name: joi.string().trim().required().error(new Error("Name is required and not empty")),
    address: joi.string().trim().required().error(new Error("Address is required and not empty")),
    mobileNo: joi.string().trim().required().min(10).max(10).error(new Error("Mobile number is required and not empty and must be 10 digits")),
});

export const validateCustomer = (data) => {
    const { error } = customerValidation.validate(data, { abortEarly: false });
    if (error) {
        return { error: error.message };
    }
    return { error: null };
};