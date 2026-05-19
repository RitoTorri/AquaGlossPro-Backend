import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { template } from './mail.template';

@Injectable()
export class MailService {
  // Al ser global el ConfigModule, Nest te lo inyecta aquí sin problemas
  constructor(private configService: ConfigService) {}

  async sendMail(to: string, { names, lastnames, username, password }) {
    // Recuperas la URL usando el servicio
    const url = this.configService.get<string>('EMAIL_URL');

    console.log('Enviando a:', to);
    console.log('Desde la URL:', url);

    if (!url) {
      throw new Error('La variable EMAIL_URL no está definida en el .env');
    }

    const data = {
      to: [to],
      subject: 'Aqua Gloss Pro - Bienvenido',
      text: String(template(names, lastnames, username, password)),
    };
    console.log(data);

    try {
      const response = await fetch(url.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log(response);

      if (!response.ok) return 'Error en el servidor de correos';

      return 'Enviado correctamente';
    } catch (error) {
      console.error('Error de red:', error);
      return 'Fallo de conexión';
    }
  }
}
