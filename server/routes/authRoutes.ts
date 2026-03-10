import express from "express"
import { signup, login, registerAdmin } from "../controllers/authController"

const router = express.Router()

router.post("/signup",signup)

router.post("/login",login)

router.post("/register-admin",registerAdmin)

export default router