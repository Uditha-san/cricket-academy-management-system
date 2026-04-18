import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "test",
    synchronize: true, // Only for development! Unsafe for production.
    logging: false,
    entities: ["src/entities/**/*.ts"],
    subscribers: [],
    migrations: [],
    // Connection pool: allows parallel queries to run concurrently
    poolSize: 10,
    connectTimeout: 10000,
    extra: {
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
    }
});
