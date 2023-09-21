'use strict';
import db, { pool } from "../config/db.js";
import { checkIsManagerUrl } from "../utils.js/function.js";
import { deleteQuery, getSelectQuery, insertQuery, selectQuerySimple, updateQuery } from "../utils.js/query-util.js";
import { checkDns, checkLevel, isItemBrandIdSameDnsId, lowLevelException, makeObjByList, response, settingFiles } from "../utils.js/util.js";
import 'dotenv/config';

const table_name = 'products';

const productCtrl = {
    list: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkDns(req.cookies.dns);
            const { category_id } = req.query;

            let columns = [
                `${table_name}.*`,
                `product_categories.name AS category_name`
            ]
            let sql = `SELECT ${process.env.SELECT_COLUMN_SECRET} FROM ${table_name} `;
            sql += ` LEFT JOIN product_categories ON ${table_name}.category_id=product_categories.id `;
            sql += ` WHERE ${table_name}.brand_id=${decode_dns?.id} `;
            if (category_id) sql += ` AND ${table_name}.category_id=${category_id} `;
            let data = await getSelectQuery(sql, columns, req.query);
            let item_id_list = [0];
            item_id_list = [...item_id_list, ...data.content.map(item => { return item.id })];
            let budget_data = await pool.query(`SELECT * FROM budget_products WHERE product_id IN (${item_id_list.join()}) AND user_id=${decode_user?.id ?? 0}`)
            budget_data = budget_data?.result;
            budget_data = makeObjByList('product_id', budget_data);
            for (var i = 0; i < data?.content.length; i++) {
                let budget_item = budget_data[`${data?.content[i]?.id}`] ?? []
                data.content[i]['budget'] = budget_item[0] ?? {}
            }
            return response(req, res, 100, "success", data);
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    get: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkDns(req.cookies.dns);
            const { id } = req.params;
            let data = await pool.query(`SELECT * FROM ${table_name} WHERE id=${id}`)
            data = data?.result[0];
            data['product_sub_imgs'] = JSON.parse(data?.product_sub_imgs ?? "[]");
            let budget_product = await pool.query(`SELECT * FROM budget_products WHERE user_id=${decode_user?.id ?? 0} AND product_id=${id}`);
            budget_product = budget_product?.result[0];
            data['budget'] = budget_product;
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
    create: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkDns(req.cookies.dns);
            const {
                brand_id, name, note, price, category_id, product_sub_imgs = [], sub_name, status,
            } = req.body;
            let files = settingFiles(req.files);
            let obj = {
                brand_id, name, note, price, category_id, product_sub_imgs, sub_name, status,
            };
            obj['product_sub_imgs'] = JSON.stringify(obj['product_sub_imgs']);

            let is_exist_category = await selectQuerySimple('product_categories', category_id);
            if (!(is_exist_category?.result.length > 0)) {
                return response(req, res, -100, "잘못된 상품 카테고리입니다.", {})
            }
            is_exist_category = is_exist_category?.result[0];

            if (is_exist_category?.brand_id != decode_dns?.id) {
                return response(req, res, -100, "잘못된 상품 카테고리입니다.", {})
            }
            obj = { ...obj, ...files };

            let result = await insertQuery(`${table_name}`, obj);
            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    update: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkDns(req.cookies.dns);
            const {
                brand_id, name, note, price, category_id, id, product_sub_imgs = [], sub_name, status,
            } = req.body;
            let files = settingFiles(req.files);
            let obj = {
                brand_id, name, note, price, category_id, product_sub_imgs, sub_name, status,
            };
            obj['product_sub_imgs'] = JSON.stringify(obj['product_sub_imgs']);
            let is_exist_category = await selectQuerySimple('product_categories', category_id);
            if (!(is_exist_category?.result.length > 0)) {
                return response(req, res, -100, "잘못된 상품 카테고리입니다.", {})
            }
            is_exist_category = is_exist_category?.result[0];

            if (is_exist_category?.brand_id != decode_dns?.id) {
                return response(req, res, -100, "잘못된 상품 카테고리입니다.", {})
            }
            obj = { ...obj, ...files };
            await db.beginTransaction();
            let result = await updateQuery(`${table_name}`, obj, id);
            let result2 = await pool.query(`UPDATE budget_products SET budget_price=? WHERE product_id=${id} AND budget_price < ?  `, [price, price]);
            await db.commit();
            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err);
            await db.rollback();
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    remove: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkDns(req.cookies.dns);
            const { id } = req.params;
            let result = await deleteQuery(`${table_name}`, {
                id
            })
            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    budget: async (req, res, next) => {
        try {
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkDns(req.cookies.dns);
            const {
                product_id,
                budget_price,
                user_id
            } = req.body;
            let data = await pool.query(`SELECT * FROM budget_products WHERE user_id=${user_id} AND product_id=${product_id} `)
            data = data?.result[0];
            if (data) {
                let result = await updateQuery(`budget_products`, {
                    budget_price
                }, data?.id);
            } else {
                let result = await insertQuery(`budget_products`, {
                    budget_price,
                    product_id,
                    user_id
                }, data?.id);
            }
            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
};

export default productCtrl;
