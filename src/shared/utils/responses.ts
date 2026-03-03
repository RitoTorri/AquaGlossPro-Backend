import { Response } from 'express';

const responseSuccessful = (res : Response, status : number, message?: string, data?: any) => {
    return res.status(status).json({
        statusCode: status,
        message: message,
        data: data
    });
}

const responsefailed = (res : Response, status : number, message: string) => {
    return res.status(status).json({
        statusCode: status,
        message: message,
    });
}

export default { responseSuccessful, responsefailed };