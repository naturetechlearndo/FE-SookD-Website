import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { getUsers } from "./userService";

export async function login(

    email: string,
    password: string

) {

    const users =
        await getUsers();

    // หา email

    const user =
        users.find(

            u =>
                u.email === email

        );

    if (!user) {

        throw new Error(
            "Email ไม่ถูกต้อง"
        );

    }

    // เช็ครหัสผ่าน

    const match =
        await bcrypt.compare(

            password,

            user.password

        );

    if (!match) {

        throw new Error(
            "Password ไม่ถูกต้อง"
        );

    }


    // สร้าง JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
}

    const token =
        jwt.sign(

            {

                user_id:
                    user.user_id,

                user_type:
                    user.user_type

            },

            JWT_SECRET,

            {

                expiresIn: "7d"

            }

        );

    return {

        token,

        user

    };

}