import { generateToken, verifyToken } from './jwtUtils.js';

const EXTENSION_KEY = process.env.EXTENSION_KEY;

export function apiKeyAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!apiKey || apiKey !== EXTENSION_KEY || !verifyToken(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
}

export function generateExtensionToken() {
    return generateToken({ apiKey: EXTENSION_KEY });
}
