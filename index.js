import express from "express";
import { config } from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import moment from 'moment-timezone';
import { ConnectDB } from "./src/connection/dbConnection.js";
import { rateLimit } from 'express-rate-limit';

import UserRouter from "./src/routes/user.js";
import PropertyRouter from "./src/routes/property.js";
import Customer from "./src/routes/customer.js";
import Milestone from "./src/routes/milestone.js";
import wallet from "./src/routes/wallet.js";
import Transaction from "./src/routes/transaction.js";

config();
const app = express();

//limiter for rate limiting
// const limiter = rateLimit({
//     windowMs: 1 * 60 * 1000,
//     limit: 250,
//     statusCode: 429,
//     handler: (req, res) => {
//         res.status(429).json({
//             status: 429,
//             message: 'Too many requests from this IP, please try again after some time',
//             data: null
//         });
//         return;
//     },
//     message: 'Too many requests from this IP, please try again after an some time',
//     standardHeaders: true,
//     legacyHeaders: false,
//     validate: false,
// });


// Connect to the database
ConnectDB().then((res) => {
    console.log(res);
}).catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
    return err;
});

// Middleware for security headers
app.use(helmet());
app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}));

// app.use(morgan("combined"));
// Custom morgan format that uses IST timezone
morgan.token('date', function () {
    return moment().tz('Asia/Kolkata').format('DD/MMM/YYYY:hh:mm:ss A ZZ');
});
app.use(morgan(':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));


// Middleware to parse JSON bodies
app.use(express.json());

// Apply the rate limiting middleware to all requests.
// app.use(limiter);

// Routes
app.use("/user", UserRouter);
app.use("/property", PropertyRouter);
app.use("/customer", Customer);
app.use("/milestone", Milestone);
app.use("/wallet", wallet);
app.use("/transaction", Transaction);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.log("globel error----------------");
    console.error('Error occurred:', err);
    res.status(err.status || 500).json({
        status: err.status || 500,
        message: err.message || 'Internal Server Error',
        details: err.details || 'An unexpected error occurred.'
    });
    return;
});

// Catch 404 errors for any undefined routes
app.use((req, res) => {
    res.status(404).json({
        status: 404,
        message: 'Route not found. Please check the URL and try again.',
        data: null
    });
    return;
});


// Start the server
const port = process.env.PORT || 8022;
app.listen(port, () => {
    console.log(`Server started at port ${port}`);
}).on("error", (err) => {
    console.error("Server failed to start:", err.message);
});