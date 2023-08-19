import express from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
//import db from "./config/Database.js";
import ProductRoute from "./routes/ProductRoute.js";

const app = express();

// try {
//   await db.authenticate();
//   console.log("Database Connected...");
//   //await Users.sync(); // menggenerate
// } catch (error) {
//   console.error(error);
// }

app.use(cors());
app.use(express.json());
app.use(FileUpload());
app.use(express.static("public"));
app.use(ProductRoute);
app.listen(5000, () => console.log("Server running..."));
