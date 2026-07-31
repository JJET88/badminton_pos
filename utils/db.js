import mysql from "mysql2/promise";

// Use mysql.createPool() with dynamic environment variables and safe local fallbacks
export const mysqlPool = mysql.createPool({
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || process.env.DB_PASS || "",
	database: process.env.DB_NAME || "badminton_pos",
	port: Number(process.env.DB_PORT || 3306),
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
	ssl: process.env.DB_SSL === "true" ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
});
