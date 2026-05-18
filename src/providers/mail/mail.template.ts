export const template = (names, lastnames, username, password) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aqua Gloss Pro - Bienvenida</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f9ff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 40px 30px; text-align: center;">
                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto 20px;">
                                <tr>
                                    <td style="background-color: #ffffff; width: 80px; height: 80px; border-radius: 50%; text-align: center; vertical-align: middle; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                        <span style="font-size: 40px; line-height: 80px; display: inline-block;">💧</span>
                                    </td>
                                </tr>
                            </table>
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">Aqua Gloss Pro</h1>
                            <p style="color: #e0f2fe; margin: 8px 0 0; font-size: 16px;">Bienvenido a bordo</p>
                        </td>
                    </tr>
                    
                    <!-- Contenido principal -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <!-- Saludo -->
                            <h2 style="color: #0c4a6e; margin: 0 0 10px; font-size: 24px; font-weight: 600;">
                                &#128075; Hola, ${names} ${lastnames}
                            </h2>
                            
                            <!-- Subtítulo -->
                            <p style="color: #0369a1; margin: 0 0 25px; font-size: 16px; line-height: 1.6; font-weight: 500;">
                                Transforma cada lavado en una experiencia brillante con Aqua Gloss Pro
                            </p>
                            
                            <p style="color: #475569; margin: 0 0 30px; font-size: 15px; line-height: 1.7;">
                                Tu cuenta ha sido creada exitosamente. Ahora formas parte del sistema de gestión de autolavados más eficiente y profesional del mercado. Optimiza tus operaciones, controla tus ingresos y haz crecer tu negocio con nosotros.
                            </p>
                            
                            <!-- Credenciales -->
                            <div style="background-color: #f0f9ff; border: 2px solid #bae6fd; border-radius: 10px; padding: 25px; margin-bottom: 30px;">
                                <h3 style="color: #0c4a6e; margin: 0 0 20px; font-size: 18px; font-weight: 600; text-align: center;">
                                    Credenciales de Acceso
                                </h3>
                                
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <!-- Usuario -->
                                    <tr>
                                        <td style="padding: 12px 15px; margin-bottom: 10px; background-color: #ffffff; border-radius: 8px;">
                                            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 5px;">Usuario</span>
                                            <span style="color: #0c4a6e; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace;">${username}</span>
                                        </td>
                                    </tr>
                                    
                                    <!-- Espacio -->
                                    <tr>
                                        <td style="height: 10px;"></td>
                                    </tr>
                                    
                                    <!-- Contraseña -->
                                    <tr>
                                        <td style="padding: 12px 15px; background-color: #ffffff; border-radius: 8px;">
                                            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 5px;">Contraseña</span>
                                            <span style="color: #0c4a6e; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace;">${password}</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Botón de acceso -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; text-align: center; box-shadow: 0 4px 12px rgba(14,165,233,0.3);">
                                            Iniciar Sesión
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; margin: 0 0 8px; font-size: 13px;">
                                &copy; 2024 Aqua Gloss Pro. Todos los derechos reservados.
                            </p>
                            <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                                Gesti&oacute;n inteligente para tu autolavado
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;