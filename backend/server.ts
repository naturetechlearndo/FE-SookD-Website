import dotenv from "dotenv";
dotenv.config();
// console.log("JWT =", process.env.JWT_SECRET);
import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes";
import activityRoutes from "./routes/activityRoutes";
import reviewRoutes from "./routes/reviewRoutes"
import orderRoutes from "./routes/orderRoutes"
import promotionRoutes from "./routes/promotionRoutes"
import authRoutes from "./routes/authRoutes";


const app = express();

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/activities",activityRoutes );
app.use("/api/reviews",reviewRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/promotions",promotionRoutes);
app.use("/api/auth",authRoutes);

const PORT = 3000;

// console.log(process.env.SPREADSHEET_ID);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});