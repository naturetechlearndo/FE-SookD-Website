import { Router } from "express";

import { login, register, getAllUsers,
    logout, getLoginUser, updateUserInfo,
    updateUserPassword, forgotPassword, resetPasswordHandler } from "../controllers/authController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/users", getAllUsers);
router.post("/logout", logout);
router.put("/users/:userId", updateUserInfo);
router.put("/password/:userId", updateUserPassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordHandler);
router.get( "/me", verifyToken,getLoginUser); //ใช้เช็คว่าที่loginตอนนี้เป็นใคร

export default router;