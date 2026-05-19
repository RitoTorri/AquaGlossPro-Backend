export const template = (names, lastnames, username, password) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aqua Gloss Pro - Bienvenida</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 24px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.06); overflow: hidden; max-width: 600px;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); padding: 44px 30px 40px; text-align: center;">
                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto 20px;">
                                <tr>
                                    <!-- Posición de la gota sin cambios -->
                                    <td style="background-color: #ffffff; width: 80px; height: 80px; border-radius: 50%; text-align: center; vertical-align: middle; box-shadow: 0 4px 16px rgba(0,0,0,0.2);">
                                        <span style="font-size: 40px; line-height: 80px; display: inline-block;">💧</span>
                                    </td>
                                </tr>
                            </table>
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">Aqua Gloss Pro</h1>
                            <p style="color: #93c5fd; margin: 10px 0 0; font-size: 16px; font-weight: 400;">Te damos la bienvenida</p>
                        </td>
                    </tr>
                    
                    <!-- Contenido principal -->
                    <tr>
                        <td style="padding: 36px 32px 40px;">
                            <!-- Saludo -->
                            <h2 style="color: #0f172a; margin: 0 0 8px; font-size: 24px; font-weight: 600;">
                                Hola, ${names} ${lastnames}
                            </h2>
                            
                            <!-- Subtítulo profesional -->
                            <p style="color: #1e40af; margin: 0 0 28px; font-size: 16px; line-height: 1.5; font-weight: 500;">
                                Tu experiencia de lavado comienza aquí
                            </p>
                            
                            <p style="color: #334155; margin: 0 0 32px; font-size: 15px; line-height: 1.7;">
                                ¡Tu cuenta en Aqua Gloss Pro ha sido creada con éxito! Ahora puedes agendar tus lavados cuando quieras, acumular puntos por cada visita y recibir promociones exclusivas. Es la forma más rápida y cómoda de mantener tu auto impecable sin hacer filas.
                            </p>
                            
                            <!-- Credenciales -->
                            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px 24px 20px; margin-bottom: 32px;">
                                <h3 style="color: #0f172a; margin: 0 0 20px; font-size: 18px; font-weight: 600; text-align: center;">
                                    Tus datos de acceso
                                </h3>
                                
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <!-- Usuario -->
                                    <tr>
                                        <td style="padding: 14px 16px; margin-bottom: 12px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                                            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 4px;">Usuario</span>
                                            <span style="color: #0f172a; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace;">${username}</span>
                                        </td>
                                    </tr>
                                    
                                    <!-- Espacio -->
                                    <tr>
                                        <td style="height: 12px;"></td>
                                    </tr>
                                    
                                    <!-- Contraseña -->
                                    <tr>
                                        <td style="padding: 14px 16px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                                            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 4px;">Contraseña</span>
                                            <span style="color: #0f172a; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace;">${password}</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Botón de acceso -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%); color: #ffffff; text-decoration: none; padding: 14px 44px; border-radius: 8px; font-size: 16px; font-weight: 600; text-align: center; box-shadow: 0 4px 14px rgba(37,99,235,0.25);">
                                            Ir a mi cuenta
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f1f5f9; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #64748b; margin: 0 0 6px; font-size: 13px;">
                                &copy; 2026 Aqua Gloss Pro. Todos los derechos reservados.
                            </p>
                            <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                                Gestión inteligente para tu autolavado
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;