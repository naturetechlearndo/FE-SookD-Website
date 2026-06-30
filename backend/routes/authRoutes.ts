import { Router } from "express";

import { login, register, getAllUsers, logout, updateUserInfo, updateUserPassword } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/users", getAllUsers);
router.post("/logout", logout);
router.put("/users/:userId", updateUserInfo);
router.put("/password/:userId", updateUserPassword);

export default router;