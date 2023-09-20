'use strict';
import { pool } from "../config/db.js";
import { checkIsManagerUrl } from "../utils.js/function.js";
import { getMultipleQueryByWhen, getSelectQuery } from "../utils.js/query-util.js";
import { checkDns, checkLevel, homeItemsSetting, homeItemsWithCategoriesSetting, isItemBrandIdSameDnsId, lowLevelException, makeUserToken, response } from "../utils.js/util.js";
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
            let dns_data = await pool.query(`SELECT shop_obj FROM brands WHERE id=${decode_dns?.id}`);
            dns_data = dns_data?.result[0];
            dns_data['shop_obj'] = JSON.parse(dns_data?.shop_obj ?? '{}');
            let content_list = dns_data['shop_obj'];
            let sql_list = [];
            // sql_list.push({
            //     table:'post',
            //     sql: `SELECT * FROM posts `,
            // })
            sql_list.push({
                table: 'product',
                sql: `SELECT * FROM products WHERE brand_id=${decode_dns?.id} `,
            })
            let sql_data = await getMultipleQueryByWhen(sql_list);
            let posts = sql_data['post'] ?? [];
            let products = sql_data['product'] ?? [];
            for (var i = 0; i < content_list.length; i++) {
                if (content_list[i]?.type == 'items' && products.length > 0) {
                    content_list[i] = homeItemsSetting(content_list[i], products);
                }
                if (content_list[i]?.type == 'items-with-categories' && products.length > 0) {
                    content_list[i] = homeItemsWithCategoriesSetting(content_list[i], products);
                }
                if (content_list[i]?.type == 'post') {
                    content_list[i] = {
                        ...content_list[i],
                        posts: post_obj,
                        categories: themePostCategoryList,
                    };
                }
                if (content_list[i]?.type == 'item-reviews') {
                    let review_list = [...test_product_reviews];
                    for (var j = 0; j < review_list.length; j++) {
                        review_list[j].product = _.find(products, { id: review_list[j]?.product_id });
                    }
                    content_list[i] = {
                        ...content_list[i],
                        title: '상품후기',
                        sub_title: 'REVIEW',
                        list: [...review_list],
                    }
                }
            }
            return response(req, res, 100, "success", content_list);
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