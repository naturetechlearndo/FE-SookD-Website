import { Request,Response } from "express";

import * as authService from "../services/authService";
import * as userService from "../services/userService";

export async function getAllUsers(
    req: Request,
    res: Response
) {

    try {

        const users =
            await userService.getUsers();

        res.json({

            success: true,

            users

        });

    }

    catch (err: any) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

}

export async function register(
    req: Request,
    res: Response
) {
    try {

        const user =
            await userService.createUser(
                req.body
            );

        res.status(201).json({
            success: true,
            user
        });

    } catch (err: any) {
        console.log("Controller",err);

        res.status(400).json({
            success: false,
            message: err.message
        });

    }
}

export async function login(

    req: Request,

    res: Response

) {

    try {

        const {

            email,

            password

        } = req.body;

        const result =
            await authService.login(

                email,

                password

            );

        res.json({

            success: true,

            ...result

        });

    }

    catch (err: any) {
        console.log("controller",err);

        res.status(401).json({

            success: false,

            message:
                err.message

        });

    }

}

export function logout(
    req: Request,
    res: Response
) {

    res.json({

        success: true,

        message: "Logout success"

    });

}
