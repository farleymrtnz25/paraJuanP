class UsuariosController {
    constructor() {
    }

    async consultarDetalle(req, res) {
        try {
            const admin = require('./firebaseAdmin');
            // Obtener el identificador desde query params o params de ruta
            let iden = req.query.iden || req.params.iden;
            
            if (!iden) {
                return res.status(400).json({ error: 'Identificador requerido' });
            }

            console.log("Consultando usuario con ID:", iden);
            const userDoc = await admin.firestore().collection('users').doc(iden).get();

            if (!userDoc.exists) {
                return res.status(404).json({ error: 'Usuario no encontrado: ' + iden });
            }

            // Obtener los datos del documento
            const userData = userDoc.data();
            console.log("Usuario encontrado:", userData);

            return res.status(200).json(userData);
        } catch (err) {
            console.error("Error al consultar usuario:", err);
            res.status(500).json({ error: err.message });
        }
    }

    async ingresar(req, res) {
        try {
            console.log('=== INICIO ingresar ===');
            console.log('req.body:', req.body);
            console.log('req.headers:', req.headers);
            
            const admin = require('./firebaseAdmin');
            
            const { dni, nombre, apellidos, email } = req.body;
            
            console.log('Datos extraídos:');
            console.log('dni:', dni, typeof dni);
            console.log('nombre:', nombre, typeof nombre);
            console.log('apellidos:', apellidos, typeof apellidos);
            console.log('email:', email, typeof email);
            
            // Validar datos requeridos
            if (!dni || !nombre || !apellidos || !email) {
                console.log('Validación fallida - campos faltantes');
                return res.status(400).json({ 
                    error: 'Todos los campos son requeridos: dni, nombre, apellidos, email',
                    received: { dni: !!dni, nombre: !!nombre, apellidos: !!apellidos, email: !!email }
                });
            }

            console.log("Datos recibidos:");
            console.log("Documento de identidad:", dni);
            console.log("Nombres con apellidos:", nombre + " " + apellidos);
            console.log("email:", email);

            // Crear el objeto usuario
            const userData = {
                dni: dni,
                nombre: nombre,
                apellidos: apellidos,
                email: email,
                fechaCreacion: new Date().toISOString()
            };

            console.log("Intentando guardar en Firebase:", userData);

            // Guardar en Firestore usando el DNI como ID del documento
            await admin.firestore().collection('users').doc(dni).set(userData);
            
            console.log("Usuario guardado exitosamente con ID:", dni);
            
            res.status(200).json({ 
                message: "Usuario agregado exitosamente",
                id: dni,
                data: userData
            });
            
        } catch (err) {
            console.error("Error al guardar usuario:", err);
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new UsuariosController();