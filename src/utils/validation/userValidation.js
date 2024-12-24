import joi from "joi";

const userSchema = joi.object({
    name: joi.string().trim().required().error(new Error("Name is required and Not Empty")),
    password: joi.string().trim().required().min(6).max(20).error(new Error("Password is required and Must be 6 to 20 characters")),
    mobileNo: joi.string().trim().required().min(10).max(10).error(new Error("Mobile Number is required and Must be 10 digits")),
});

const loginUserSchema = joi.object({
    password: joi.string().trim().required().min(6).max(20).error(new Error("Password is required and Must be 6 to 20 characters")),
    mobileNo: joi.string().trim().required().min(10).max(10).error(new Error("Mobile Number is required and Must be 10 digits")),
});

export const validateUser = (data) => {
    const { error } = userSchema.validate(data, { abortEarly: false });
    if (error) {
        return { error: error.message };
    }
    return { error: null };
};

export const validateLoginUser = (data) => {
    const { error } = loginUserSchema.validate(data, { abortEarly: false });
    if (error) {
        return { error: error.message };
    }
    return { error: null };
};

