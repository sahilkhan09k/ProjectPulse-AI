import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { validateEnv } from "./utils/validateEnv.js";

dotenv.config({
    path : './.env'
})

validateEnv();

connectDB().then(() => {
    let port = process.env.PORT || 4000;

    app.on("error", (err) => {
        console.log("error !!", err)
    })
    app.listen(port, () => {
        console.log(`server is running on the port ${port}`)
    })
})
.catch((error) => {
    console.log(`MONGODB CONNECTION ERROR FAILED`, error);
})