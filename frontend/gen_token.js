import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

const token = jwt.sign(
    { userId: 'test', email: 'uditha@yopmail.com', role: 'player' },
    process.env.JWT_SECRET || "scc_academy_secure_jwt_secret_2025_key",
    { expiresIn: "1h" }
);

console.log(token);
