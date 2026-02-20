import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express()
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
}))

app.use(express.json({
    limit : "16kb",
}))

app.use(express.urlencoded({
    extended : true, limit : "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

// Error handling middleware (must be last)
app.use(errorHandler)

export { app }