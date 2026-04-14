import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port:     Number(process.env.DB_PORT),
  max:      10,          // nombre max de connexions
  idleTimeoutMillis: 30000,  // fermeture après 30 s d’inactivité
});

export const query = (text, params) => pool.query(text, params);