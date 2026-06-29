import { User } from "../models/User";
import { generateNextId } from "../utils/idGenerator";

import { getSheetData } from "./googleSheetService";
import bcrypt from "bcrypt";

export async function getUsers(): Promise<User[]> {

    const data = await getSheetData("users");

    return data.map((item: any) => ({

        user_id:
            item.user_id,

        user_type:
            item.user_type,

        first_name:
            item.first_name,

        last_name:
            item.last_name,

        legal_entity_name:
            item.legal_entity_name,

        email:
            item.email,

        password:
            item.password,

        phone_number:
            item.phone_number,

        business_registration_number:
            item.business_registration_number,

        business_type:
            item.business_type,

        address:
            item.address,

        gender:
            item.gender,

        birthdate:
            item.birthdate

    }));

}


export async function createUser(
    userData: Omit<User, "user_id">
): Promise<User> {

    // อ่านผู้ใช้ทั้งหมด
    const users = await getUsers();

    // ตรวจสอบ email ซ้ำ
    const exist = users.find(
        u => u.email === userData.email
    );

    if (exist) {
        throw new Error("Email นี้ถูกใช้งานแล้ว");
    }

    // สร้าง User ID
    const userId = generateNextId(
        users.map(u => u.user_id),
        "USR"
    );

    // เข้ารหัส Password
    const hash = await bcrypt.hash(
        userData.password,
        10
    );

    // สร้างข้อมูลผู้ใช้
    const newUser: User = {
        user_id: userId,
        ...userData,
        password: hash
    };

    // บันทึกลง Google Apps Script
    const response = await fetch(
        process.env.GAS_URL!,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "createUser",
                data: newUser
            })
        }
    );

    const result = await response.json();

    if (!result.success) {
        console.log("userService",result);
        throw new Error("ไม่สามารถสร้างผู้ใช้ได้");
    }

    return newUser;
}