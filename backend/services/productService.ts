import { Product } from "../models/Product";
import { getSheetData } from "./googleSheetService";
export async function getProducts(): Promise<Product[]> {
    const data = await getSheetData("products");

    return data.map((item: any) => ({
        id:item.product_id,
        name: item.product_name,
        price: Number(item.product_price),
        quantity: Number(item.product_quantity),
        origin: item.product_origin,
        note: item.product_note,
        image: item.product_image,
        preorderDate: item.product_preorderDate,
        remain: Number(item.product_remain),
        shipping_duration: item.product_shipping_duration,
        shipping_area: item.product_shipping_area
    }));
}

export async function getProductById(
    id: string
) {
    const products = await getProducts();

    return products.find(
        product => product.id === id
    );
}