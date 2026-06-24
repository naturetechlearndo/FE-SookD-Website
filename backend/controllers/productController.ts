import { Request, Response } from "express";
import * as productService from "../services/productService";

export async function getProducts(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const products = await productService.getProducts();

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch products"
        });
    }
}


export async function getProductById(
    req: Request,
    res: Response
) {
    try {
        const id = String(req.params.id);
        console.log("id",id);

        const product =
            await productService.getProductById(id);

        if (!product) {
            res.status(404).json({
                message: "Product not found"
            });
            return;
        }

        res.status(200).json(product);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get product"
        });
    }
}

