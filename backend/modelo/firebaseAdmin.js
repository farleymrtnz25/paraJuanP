
const admin = require('firebase-admin');

// Verificar que las variables de entorno estén configuradas
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('Variables de entorno de Firebase no configuradas');
    throw new Error('Firebase configuration missing');
}

if (!admin.apps.length) {
    try {
        // Limpiar la clave privada (remover caracteres de escape innecesarios)
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
            databaseURL: "https://mi-licorera-default-rtdb.firebaseio.com"
        });
        
        console.log('Firebase Admin inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar Firebase Admin:', error);
        throw error;
    }
}

module.exports = admin;