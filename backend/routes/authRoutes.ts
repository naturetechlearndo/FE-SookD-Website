import { Router } from "express";

import { login,register,getAllUsers,logout }from "../controllers/authController";

const router = Router();

router.post("/login",login);
router.post("/register", register);
router.get( "/users", getAllUsers);
router.post( "/logout", logout);

export default router;