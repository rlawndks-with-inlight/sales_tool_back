'use strict';
import { pool } from "../config/db.js";
import { checkIsManagerUrl } from "../utils.js/function.js";
import { getMultipleQueryByWhen, getSelectQuery } from "../utils.js/query-util.js";
import { checkDns, checkLevel, isItemBrandIdSameDnsId, lowLevelException, makeUserToken, response } from "../utils.js/util.js";
import 'dotenv/config';
import when from 'when';

const shopCtrl = {
    setting: async (req, res, next) => {
        try {
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkDns(req.cookies.dns);
            const { } = req.query;
            //products
            let product_columns = [
                `products.*`,
                `product_categories.name AS category_name`
            ]
            let product_sql = `SELECT ${product_columns.join()} FROM products `;
            product_sql += ` LEFT JOIN product_categories ON products.category_id=product_categories.id `;
            product_sql += ` WHERE products.brand_id=${decode_dns?.id} `;
            product_sql += ` AND products.is_delete=0 `
            //product categories
            let product_category_columns = [
                `product_categories.*`,
            ]
            let product_category_sql = `SELECT ${product_category_columns.join()} FROM product_categories `;
            product_category_sql += ` WHERE product_categories.brand_id=${decode_dns?.id} `;
            product_sql += ` AND product_categories.is_delete=0 `

            //when
            let sql_list = [
                { table: 'products', sql: product_sql },
                { table: 'product_categories', sql: product_category_sql },
            ]
            let data = await getMultipleQueryByWhen(sql_list);

            return response(req, res, 100, "success", data);
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    main: async (req, res, next) => {
        try {
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkDns(req.cookies.dns);
            return response(req, res, 100, "success", {});
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    items: async (req, res, next) => { //상품 리스트출력
        try {
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkDns(req.cookies.dns);
            return response(req, res, 100, "success", []);
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    item: async (req, res, next) => { //상품 단일 출력
        try {
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkDns(req.cookies.dns);
            const { id } = req.params;
            let data = await pool.query(`SELECT * FROM products WHERE id=${id}`)
            data = data?.result[0];
            if (!isItemBrandIdSameDnsId(decode_dns, data)) {
                return lowLevelException(req, res);
            }
            return response(req, res, 100, "success", data)
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },

}

export default shopCtrl;