'use strict';
import { pool } from "../config/db.js";
import { checkIsManagerUrl } from "../utils.js/function.js";
import { checkLevel, makeUserToken, response } from "../utils.js/util.js";
import 'dotenv/config';

const domainCtrl = {
    get: async (req, res, next) => {
        try {
            const { dns } = req.query;
            let columns = [
                'id',
                'name',
                'dns',
                'logo_img',
                'dark_logo_img',
                'favicon_img',
                'og_img',
                'og_description',
                'theme_css',
                'setting_obj',
                'is_main_dns',
            ]
            let brand = await pool.query(`SELECT ${columns.join()} FROM brands WHERE dns='${dns}'`);
            brand = brand?.result[0];
            brand['theme_css'] = JSON.parse(brand?.theme_css ?? '{}');
            brand['setting_obj'] = JSON.parse(brand?.setting_obj ?? '{}');
            const token = await makeUserToken(brand);
            res.cookie("dns", token, {
                httpOnly: true,
                maxAge: (60 * 60 * 1000) * 3,
                //sameSite: 'none', 
                //secure: true 
            });
            return response(req, res, 100, "success", brand);
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
}

export default domainCtrl;