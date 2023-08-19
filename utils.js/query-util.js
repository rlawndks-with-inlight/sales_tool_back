import pool from '../config/db.js';
import 'dotenv/config';

export const insertQuery = async (table, obj, pool_) => {
    let conn = pool_ || pool
    let keys = Object.keys(obj);
    if (keys.length == 0) {
        return false;
    }
    let question_list = keys.map(key => {
        return '?'
    });
    let values = keys.map(key => {
        return obj[key]
    });
    let result = await conn.query(`INSERT INTO ${table} (${keys.join()}) VALUES (${question_list.join()})`, values);
    return result;
}
export const insertQueryMultiRow = async (table, list, pool_) => {// 개발예정
    let conn = pool_ || pool
    let keys = Object.keys(obj);
    if (keys.length == 0) {
        return false;
    }
    let question_list = keys.map(item => {
        return '?'
    });
    let values = keys.map(key => {
        return obj[key]
    });
    let result = await conn.query(`INSERT INTO ${table} (${keys.join()}) VALUES (${question_list.join()})`, values);
    return result;
}
export const deleteQuery = async (table, where_obj, pool_) => {
    let conn = pool_ || pool
    let keys = Object.keys(where_obj);
    let where_list = [];
    for (var i = 0; i < keys.length; i++) {
        where_list.push(` ${keys[i]}=${where_obj[keys[i]]} `);
    }
    let result = await conn.query(`DELETE FROM ${table} WHERE ${where_list.join('AND')} `);
    return result;
}
export const updateQuery = async (table, obj, id, pool_) => {
    let conn = pool_ || pool
    let keys = Object.keys(obj);
    if (keys.length == 0) {
        return false;
    }
    let question_list = keys.map(key => {
        return `${key}=?`
    });
    let values = keys.map(key => {
        return obj[key]
    });
    let result = await conn.query(`UPDATE ${table} SET ${question_list.join()} WHERE id=${id}`, values);
    return result;
}
export const selectQuery = () => {

}
export const getSelectQuery = async (sql, columns, query, pool_) => {
    let conn = pool_ || pool
    const { page = 1, page_size = 100000, is_asc = false, order = 'id' } = query;
    let content_sql = sql.replaceAll(process.env.SELECT_COLUMN_SECRET, columns.join());
    content_sql += ` ORDER BY ${order} ${is_asc ? 'ASC' : 'DESC'} `;
    content_sql += ` LIMIT ${(page - 1) * page_size}, ${page_size} `;
    let total_sql = sql.replaceAll(process.env.SELECT_COLUMN_SECRET, 'COUNT(*) as total');
    let total = await conn.query(total_sql);
    total = total[0][0]['total'];
    let content = await conn.query(content_sql);
    content = content[0]
    return {
        page,
        page_size,
        total,
        content
    }
}