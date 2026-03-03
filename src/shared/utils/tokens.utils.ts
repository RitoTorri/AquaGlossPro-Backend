import * as jwt from 'jsonwebtoken';

export const generateToken = (payload: object, jwtSecret: string, expiresIn): string => {
    return jwt.sign(payload, jwtSecret, { expiresIn: expiresIn });
};

// Convertimos verify en una Promesa real para usar await
export const verifyToken = (token: string, jwtSecret: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
};

// Nueva función: Solo lee el token sin importar si expiró
export const decodeToken = (token: string): any => {
    return jwt.decode(token);
};