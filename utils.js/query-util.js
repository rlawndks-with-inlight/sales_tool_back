import pool from '../config/db.js';
import 'dotenv/config';
import when from 'when';

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
    let result = await conn.query(`UPDATE ${table} SET is_delete=1 WHERE ${where_list.join('AND')} `);
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
export const selectQuerySimple = async (table, id, pool_) => {
    let conn = pool_ || pool
    let result = await conn.query(`SELECT * FROM ${table} WHERE id=${id}`);
    return result;
}
export const getTableNameBySelectQuery = (sql) => {// select query 가지고 불러올 메인 table명 불러오기 select * from user as asd
    let sql_split_list = sql.split(' FROM ')[1].split(' ');
    let table = '';
    for (var i = 0; i < sql_split_list.length; i++) {
        if (sql_split_list[i]) {
            table = sql_split_list[i];
            break;
        }
    }
    return table;
}
export const getSelectQuery = async (sql_, columns, query, pool_) => {
    let conn = pool_ || pool
    const { page = 1, page_size = 100000, is_asc = false, order = 'id', s_dt, e_dt } = query;
    let sql = sql_;
    let table = getTableNameBySelectQuery(sql);

    sql += ` ${sql.includes('WHERE') ? 'AND' : 'WHERE'} ${table}.is_delete=0 `;
    if (s_dt) {
        sql += ` AND ${table}.created_at >= '${s_dt} 00:00:00' `;
    }
    if (e_dt) {
        sql += ` AND ${table}.created_at <= '${e_dt} 23:59:59' `;
    }
    let content_sql = sql.replaceAll(process.env.SELECT_COLUMN_SECRET, columns.join());
    content_sql += ` ORDER BY ${table}.${order} ${is_asc ? 'ASC' : 'DESC'} `;
    content_sql += ` LIMIT ${(page - 1) * page_size}, ${page_size} `;
    let total_sql = sql.replaceAll(process.env.SELECT_COLUMN_SECRET, 'COUNT(*) as total');

    let result_list = [];
    let sql_list = [
        { table: 'total', sql: total_sql },
        { table: 'content', sql: content_sql },
    ]

    for (var i = 0; i < sql_list.length; i++) {
        result_list.push((await conn.query(sql_list[i].sql)));
    }

    for (var i = 0; i < result_list.length; i++) {
        await result_list[i];
    }
    let result = (await when(result_list));

    let total = result[0];
    total = total[0][0]['total'];
    let content = result[1];
    content = content[0]
    return {
        page,
        page_size,
        total,
        content
    }
}