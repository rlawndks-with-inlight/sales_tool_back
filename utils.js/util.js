import crypto from 'crypto';
import util from 'util';
import pool from "../config/db.js";
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const randomBytesPromise = util.promisify(crypto.randomBytes);
const pbkdf2Promise = util.promisify(crypto.pbkdf2);

const createSalt = async () => {
    const buf = await randomBytesPromise(64);
    return buf.toString("base64");
};
export const createHashedPassword = async (password, salt_) => {
    let salt = salt_;
    if (!salt) {
        salt = await createSalt();
    }
    const key = await pbkdf2Promise(password, salt, 104906, 64, "sha512");
    const hashedPassword = key.toString("base64");
    return { hashedPassword, salt };
};
export const makeUserToken = (obj) => {
    let token = jwt.sign(obj,
        process.env.JWT_SECRET,
        {
            expiresIn: '180m',
            issuer: 'fori',
        });

    return token
}
export const checkLevel = (token, level) => { //유저 정보 뿌려주기
    try {
        if (token == undefined)
            return false

        //const decoded = jwt.decode(token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            //console.log(decoded)
            if (err) {
                console.log("token이 변조되었습니다." + err);
                return false
            }
            else return decoded;
        })
        const user_level = decoded.level
        if (level > user_level)
            return false
        else
            return decoded
    }
    catch (err) {
        console.log(err)
        return false
    }
}
export const checkDns = (token) => { //dns 정보 뿌려주기
    try {
        if (token == undefined)
            return false

        //const decoded = jwt.decode(token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            //console.log(decoded)
            if (err) {
                console.log("token이 변조되었습니다." + err);
                return false
            }
            else return decoded;
        })
        const user_level = decoded.level
        if (decoded?.id)
            return decoded
        else
            return false
    }
    catch (err) {
        console.log(err)
        return false
    }
}
const logRequestResponse = async (req, res, decode_user, decode_dns) => {//로그찍기
    let requestIp;
    try {
        requestIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || '0.0.0.0'
    } catch (err) {
        requestIp = '0.0.0.0'
    }
    let request = {
        url: req.originalUrl,
        headers: req.headers,
        query: req.query,
        params: req.params,
        body: req.body,
        method: req.method,
        file: req.file || req.files || null
    }
    if(request.url.includes('/logs')){
        return true;
    }
    request = JSON.stringify(request)
    let user_id = 0;
    if (decode_user && !isNaN(parseInt(decode_user?.id))) {
        user_id = decode_user?.id;
    } else {
        user_id = -1;
    }
    let brand_id = -1;
    if (decode_dns) {
        brand_id = decode_dns?.id;
    } else {
        brand_id = -1;
    }
    let result = await pool.query(
        "INSERT INTO logs (request, response_data, response_result, response_message, request_ip, user_id, brand_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [request, JSON.stringify(res?.data), res?.result, res?.message, requestIp, user_id, brand_id]
    )
}
export const response = async (req, res, code, message, data) => { //응답 포맷
    var resDict = {
        'result': code,
        'message': message,
        'data': data,
    }
    const decode_user = checkLevel(req.cookies.token, 0)
    const decode_dns = checkLevel(req.cookies.dns, 0)
    let save_log = await logRequestResponse(req, resDict, decode_user, decode_dns);

    res.send(resDict);
}
export const lowLevelException = (req, res) => {
    return response(req, res, -150, "권한이 없습니다.", false);
}
export const isItemBrandIdSameDnsId = (decode_dns, item) =>{
    return decode_dns?.id == item?.brand_id
}
export const settingFiles = (obj) => {
    let keys = Object.keys(obj);
    let result = {};
    for (var i = 0; i < keys.length; i++) {
        let file = obj[keys[i]][0];
        if (!file) {
            continue;
        }
        let is_multiple = false;

        if (obj[keys[i]].length > 1) {
            is_multiple = true;
        }
        if (is_multiple) {
            let files = obj[keys[i]];
            result[`${keys[i].split('_file')[0]}_imgs`] = files.map(item=>{
                return (process.env.NODE_ENV == 'development' ? process.env.BACK_URL_TEST : process.env.BACK_URL) + '/' + item.destination + item.filename;
            }).join(',')
            files = `[${files}]`;

        } else {
            file.destination = 'files/' + file.destination.split('files/')[1];
            result[`${keys[i].split('_file')[0]}_img`] = (process.env.NODE_ENV == 'development' ? process.env.BACK_URL_TEST : process.env.BACK_URL) + '/' + file.destination + file.filename;
        }
    }
    console.log(result)
    return result;
}
export const imageFieldList = [
    'logo_file',
    'dark_logo_file',
    'favicon_file',
    'og_file',
    'upload_file',
    'category_file',

].map(field => {
    return {
        name: field
    }
})