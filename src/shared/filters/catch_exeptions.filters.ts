import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { HttpException } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(HttpException)
export class GeneralExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        // Generamos el contexto de la petición
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()

        const status = exception.getStatus()
        const exceptionResponse : any = exception.getResponse()

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message:
                exceptionResponse['message'] ||
                exceptionResponse['error'] ||
                exceptionResponse['statusCode'],
        })
    }
}