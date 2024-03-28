import { drizzle } from "drizzle-orm/sqlite-proxy";
import Database, { QueryResult } from "tauri-plugin-sql-api";
import * as schema from "../db/schema";

/**
 * Represents the result of a SELECT query.
 */
export type SelectQueryResult = {
  [key: string]: any;
};

/**
 * Loads the sqlite database via the Tauri Proxy.
 */
export const sqlite = await Database.load("sqlite:sqlite.db");

/**
 * The drizzle database instance.
 */
export const db = drizzle<typeof schema>(
  async (sql, params, method) => {
    let rows: any = [];

    // If the query is a SELECT, use the select method
    if (isSelectQuery(sql)) {
      rows = await sqlite.select(sql, params).catch((e) => {
        console.error("SQL Error:", e);
        return [];
      });

      // returns: any[]
    } else {
      // Otherwise, use the execute method
      const result = (await sqlite.execute(sql, params).catch((e) => {
        console.error("SQL Error:", e);
        return [];
      })) as QueryResult;

      const target = sql?.match(/"([^"]*)"/g)?.[0].match(/([^"]*)/g)?.[0];
      console.log(target);
      rows = await sqlite
        .select(`SELECT * FROM documents WHERE id=?`, [result.lastInsertId])
        .catch((e) => {
          console.error("SQL Error:", e);
          return [];
        });
    }

    console.log(method === "all" ? rows : [rows[0]]);

    // If the method is "all", return all rows
    // Return the results
    return {
      rows: method === "all" ? rows : rows[0],
      // rowsAffected: update.rowsAffected,
      // lastInsertId: update.lastInsertId,
    };
  },
  // Pass the schema to the drizzle instance
  { schema: schema, logger: true },
);

/**
 * Checks if the given SQL query is a SELECT query.
 * @param sql The SQL query to check.
 * @returns True if the query is a SELECT query, false otherwise.
 */
function isSelectQuery(sql: string): boolean {
  const selectRegex = /^\s*SELECT\b/i;
  return selectRegex.test(sql);
}

/**
 * Checks if the given SQL query is a SELECT query.
 * @param sql The SQL query to check.
 * @returns True if the query is a SELECT query, false otherwise.
 */
function hasReturning(sql: string): boolean {
  const selectRegex = /^\s*RETURNING\b/i;
  return selectRegex.test(sql);
}
