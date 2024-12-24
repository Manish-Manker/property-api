import Customer from '../models/customerModel.js';
import { validateCustomer } from '../utils/validation/customerValidation.js';

export const createCustomer = async (req, res) => {
    try {
        const customerData = req.body;
        const { error } = validateCustomer(customerData);
        if (error) {
            console.log(error);
            res.status(400).json({ status: 400, message: error, data: null });
            return;
        }
        const existingCustomer = await Customer.findOne({ mobileNo: customerData.mobileNo });
        
        if (existingCustomer) {
            console.log("Customer already exist");            
            res.status(400).json({ status: 400, message: 'Customer already exist', data: null });
            return;
        }

        const customer = new Customer({ ...customerData, createdBy: req.user._id });
        const result = await customer.save();
        if (result) {
            res.status(201).json({ status: 201, message: 'Customer created successfully', data: result });
        } else {
            console.log("Customer not created");
            res.status(400).json({ status: 400, message: 'Customer not created', data: null });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: 'Internal server error', data: null });
        return;
    }
}

export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({ createdBy: req.user._id }).select("-__v -updatedAt -createdAt");

        if (customers.length > 0 && customers !== []) {
            res.status(200).json({ status: 200, message: 'Customers found successfully', data: customers });
        } else {
            console.log("No Customers found");
            res.status(404).json({ status: 404, message: 'No Customers found', data: null });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: 'Internal server error', data: null });
        return;
    }
}

export const updateCustomer = async (req, res) => {
    try {
        const customerData = req.body;
        const userId = req.user._id;
        const customerId = req.params?.id;

        if (!customerId) {
            res.status(400).json({ status: 400, message: 'Customer id is required', data: null });
            return;
        }

        const { error } = validateCustomer(customerData);
        if (error) {
            console.log(error);
            res.status(400).json({ status: 400, message: error, data: null });
            return;
        }
        const existingCustomer = await Customer.find({  _id: { $ne: customerId },mobileNo: customerData.mobileNo });
        // console.log("->>",existingCustomer);

        if (existingCustomer.length > 0 && existingCustomer !== []) {
            console.log("Customer already exists");
            res.status(400).json({ status: 400, message: 'Customer already exists', data: null });
            return;
        }
        const customer = await Customer.findOneAndUpdate({ _id: customerId, createdBy: userId }, { ...customerData }, { new: true });

        if (customer) {
            res.status(200).json({ status: 200, message: 'Customer updated successfully', data: customer });
        } else {
            res.status(404).json({ status: 404, message: 'Customer not Found', data: null });
            return;
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: 'Internal server error', data: null });
        return;
    }
}

export const deleteCustomer = async (req, res) => {
    try {
        const userId = req.user?._id;
        const customerId = req.params?.id;

        if (!customerId) {
            res.status(400).json({ status: 400, message: 'Customer id is required', data: null });
            return;
        }

        const customer = await Customer.findOneAndDelete({ _id: customerId, createdBy: userId });
        if (customer) {
            res.status(200).json({ status: 200, message: 'Customer deleted successfully', data: customer });
        } else {
            res.status(404).json({ status: 404, message: 'Customer not deleted', data: null });
            return;
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: 'Internal server error', data: null });
        return;
    }
}