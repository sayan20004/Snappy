import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory (config is in backend/src/config, so ../../ goes to backend/)
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Verify critical env vars
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing from .env file');
}
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing from .env file');
}
