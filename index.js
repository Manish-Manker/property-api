import express from "express";
import { config } from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { ConnectDB } from "./src/connection/dbConnection.js";

import UserRouter from "./src/routes/user.js";
import PropertyRouter from "./src/routes/property.js";
import Customer from "./src/routes/customer.js";
import Milestone from "./src/routes/milestone.js";

config();

// Connect to the database
ConnectDB().then((res) => {
    console.log(res);
}).catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
    return err;
})

const app = express();

// Middleware for security headers
app.use(helmet());
app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}));


app.use(morgan("combined"));

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use("/user", UserRouter);
app.use("/property", PropertyRouter);
app.use("/customer", Customer);
app.use("/milestone", Milestone);


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
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server started at port ${port}`);
}).on("error", (err) => {
    console.error("Server failed to start:", err.message);
});
