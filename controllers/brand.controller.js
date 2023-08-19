'use strict';
import axios from "axios";
import pool from "../config/db.js";
import { checkIsManagerUrl } from "../utils.js/function.js";
import { deleteQuery, getSelectQuery, insertQuery, updateQuery } from "../utils.js/query-util.js";
import { checkDns, checkLevel, createHashedPassword, lowLevelException, response, settingFiles } from "../utils.js/util.js";
import 'dotenv/config';

const brandCtrl = {
    list: async (req, res, next) => {
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkDns(req.cookies.dns);
            const { } = req.query;
            let columns = [
                'brands.*',
            ]
            let sql = `SELECT ${process.env.SELECT_COLUMN_SECRET} FROM brands `;

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
            const { id } = req.params;
            let data = await pool.query(`SELECT * FROM brands WHERE id=${id}`)
            data = data[0][0];
            data['theme_css'] = JSON.parse(data?.theme_css ?? '{}');
            data['setting_obj'] = JSON.parse(data?.setting_obj ?? '{}');

            return response(req, res, 100, "success", data)
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    create: async (req, res, next) => { // 50레벨이상 관리자 url만
        let conn = await pool.getConnection();
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 50);
            console.log(decode_user)
            console.log(is_manager)
            if (!decode_user || !is_manager) {
                return lowLevelException(req, res);
            }
            const decode_dns = checkDns(req.cookies.dns);
            const {
                name, dns, og_description, company_name, business_num, pvcy_rep_name, ceo_name, addr, addr_detail, resident_num, phone_num, fax_num, note, theme_css = {}, setting_obj = {},
                user_name, user_pw
            } = req.body;
            let files = settingFiles(req.files);
            console.log(files);
            let obj = {
                name, dns, og_description, company_name, business_num, pvcy_rep_name, ceo_name, addr, addr_detail, resident_num, phone_num, fax_num, note, theme_css, setting_obj
            };
            obj['theme_css'] = JSON.stringify(obj.theme_css);
            obj['setting_obj'] = JSON.stringify(obj.setting_obj);
            obj = { ...obj, ...files };
            await conn.beginTransaction();


            let result = await insertQuery('brands', obj, conn);
            let user_obj = {
                user_name: user_name,
                user_pw: user_pw,
                name: name,
                nickname: name,
                level: 40,
                brand_id: result[0]?.insertId
            }
            let pw_data = await createHashedPassword(user_obj.user_pw);
            user_obj.user_pw = pw_data.hashedPassword;
            let user_salt = pw_data.salt;
            user_obj['user_salt'] = user_salt;
            let user_sign_up = await insertQuery('users', user_obj);

            await conn.commit();
            return response(req, res, 100, "success", {})
        } catch (err) {
            console.log(err)
            await conn.rollback();
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {
            conn.release()
        }
    },
    update: async (req, res, next) => { // 40레벨일시 자기 브랜드 수정, 50레벨일시 모든 브랜드 수정가능
        try {
            let is_manager = await checkIsManagerUrl(req);
            const decode_user = checkLevel(req.cookies.token, 0);
            const decode_dns = checkDns(req.cookies.dns);
            const {
                name, dns, og_description, company_name, business_num, pvcy_rep_name, ceo_name, addr, addr_detail, resident_num, phone_num, fax_num, note, theme_css = {}, setting_obj = {},
            } = req.body;
            const { id } = req.params;
            console.log(decode_user)
            console.log(decode_dns)
            if(!is_manager || (decode_user?.level < 50 && decode_user?.brand_id != id) || decode_user?.level < 40){
                return lowLevelException(req, res);
            }
            let files = settingFiles(req.files);

            let obj = {
                name, dns, og_description, company_name, business_num, pvcy_rep_name, ceo_name, addr, addr_detail, resident_num, phone_num, fax_num, note, theme_css, setting_obj
            };
            obj['theme_css'] = JSON.stringify(obj.theme_css);
            obj['setting_obj'] = JSON.stringify(obj.setting_obj);
            obj = { ...obj, ...files };
            console.log(obj);
            let result = await updateQuery('brands', obj, id);

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
            let result = await deleteQuery('brands', {
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

export default brandCtrl;
