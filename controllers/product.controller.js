'use strict';
import pool from "../config/db.js";
import { checkIsManagerUrl } from "../utils.js/function.js";
import { deleteQuery, getSelectQuery, insertQuery, updateQuery } from "../utils.js/query-util.js";
import { checkDns, checkLevel, response } from "../utils.js/util.js";
import 'dotenv/config';

const productCtrl = {
    list: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkDns(req.cookies.dns);
            const { } = req.query;

            let columns = [
                'products.*',
            ]
            let sql = `SELECT ${process.env.SELECT_COLUMN_SECRET} FROM products `;

            let data = await getSelectQuery(sql, columns, req.query);

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

            return response(req, res, 100, "success", {})
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
                brand_id, product_name, product_pw, name, nickname, parent_id, level, phone_num, profile_img, note
            } = req.body;
            let obj = {
                brand_id, product_name, product_pw, name, nickname, parent_id, level, phone_num, profile_img, note
            };
            let result = await insertQuery('products', obj);

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
                brand_id, product_name, product_pw, name, nickname, parent_id, level, phone_num, profile_img, note, id
            } = req.body;
            let obj = {
                brand_id, product_name, product_pw, name, nickname, parent_id, level, phone_num, profile_img, note
            };
            let result = await updateQuery('products', obj, id);
            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err)
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
            let result = await deleteQuery('products', {
                id
            })
            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {
            
        }
    },
};

export default productCtrl;
