'use strict';
import { pool } from "../config/db.js";
import { checkIsManagerUrl } from "../utils.js/function.js";
import { checkLevel, makeUserToken, response } from "../utils.js/util.js";
import 'dotenv/config';

const uploadCtrl = {
    single: async (req, res, next) => {
        try {

            return response(req, res, 100, "success", {});
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
    muiltiple: async (req, res, next) => {
        try {
            
            return response(req, res, 100, "success", []);
        } catch (err) {
            console.log(err)
            return response(req, res, -200, "서버 에러 발생", false)
        } finally {

        }
    },
}

export default uploadCtrl;