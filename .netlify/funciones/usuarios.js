const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
    try {
        console.log('Inicializando Firebase Admin...');
        
        // Verificar variables de entorno
        if (!process.env.FIREBASE_PROJECT_ID) {
            throw new Error('FIREBASE_PROJECT_ID no configurado');
        }
        if (!process.env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('FIREBASE_CLIENT_EMAIL no configurado');
        }
        if (!process.env.FIREBASE_PRIVATE_KEY) {
            throw new Error('FIREBASE_PRIVATE_KEY no configurado');
        }

        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            })
        });
        
        console.log('Firebase Admin inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar Firebase:', error.message);
    }
}

exports.handler = async (event, context) => {
    // Headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    console.log('=== NUEVA PETICIÓN ===');
    console.log('Method:', event.httpMethod);
    console.log('Path:', event.path);
    console.log('Headers:', event.headers);
    console.log('Body (raw):', event.body);

    // Manejar preflight OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    try {
        // Ruta de prueba
        if (event.httpMethod === 'GET' && event.path.includes('/test')) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: 'Función de prueba funcionando',
                    timestamp: new Date().toISOString(),
                    env_vars: {
                        firebase_project: !!process.env.FIREBASE_PROJECT_ID,
                        firebase_email: !!process.env.FIREBASE_CLIENT_EMAIL,
                        firebase_key: !!process.env.FIREBASE_PRIVATE_KEY
                    }
                })
            };
        }

        // GET - Consultar usuario
        if (event.httpMethod === 'GET') {
            const queryParams = event.queryStringParameters || {};
            const iden = queryParams.iden;

            console.log('Consultando usuario con ID:', iden);

            if (!iden) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Parámetro iden requerido' })
                };
            }

            const userDoc = await admin.firestore().collection('users').doc(iden).get();

            if (!userDoc.exists) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Usuario no encontrado: ' + iden })
                };
            }

            const userData = userDoc.data();
            console.log('Usuario encontrado:', userData);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(userData)
            };
        }

        // POST - Crear usuario
        if (event.httpMethod === 'POST') {
            console.log('=== CREANDO USUARIO ===');
            
            let body;
            try {
                body = JSON.parse(event.body || '{}');
                console.log('Body parseado:', body);
            } catch (parseError) {
                console.error('Error al parsear JSON:', parseError);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ 
                        error: 'JSON inválido',
                        received: event.body
                    })
                };
            }

            const { dni, nombre, apellidos, email } = body;

            console.log('Datos extraídos:');
            console.log('- dni:', dni, typeof dni);
            console.log('- nombre:', nombre, typeof nombre);
            console.log('- apellidos:', apellidos, typeof apellidos);
            console.log('- email:', email, typeof email);

            // Validar campos requeridos
            if (!dni || !nombre || !apellidos || !email) {
                console.log('Validación fallida');
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: 'Todos los campos son requeridos: dni, nombre, apellidos, email',
                        received: { dni: !!dni, nombre: !!nombre, apellidos: !!apellidos, email: !!email },
                        values: { dni, nombre, apellidos, email }
                    })
                };
            }

            // Crear objeto usuario
            const userData = {
                dni: dni.toString(),
                nombre: nombre.toString(),
                apellidos: apellidos.toString(),
                email: email.toString(),
                fechaCreacion: new Date().toISOString()
            };

            console.log('Guardando en Firebase:', userData);

            // Guardar en Firestore
            await admin.firestore().collection('users').doc(dni.toString()).set(userData);

            console.log('Usuario guardado exitosamente');

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    message: 'Usuario creado exitosamente',
                    id: dni,
                    data: userData
                })
            };
        }

        // Método no permitido
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método no permitido: ' + event.httpMethod })
        };

    } catch (error) {
        console.error('Error en la función:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message,
                stack: error.stack
            })
        };
    }
};