export type UserType =
    | "individual"
    | "legal_entity";

export interface User {

    user_id: string;

    user_type: UserType;

    first_name: string;

    last_name: string;

    legal_entity_name: string;

    email: string;

    password: string;

    phone_number: string;

    business_registration_number: string;

    business_type: string;

    address: string;

    gender: string;

    birthdate: string;

}