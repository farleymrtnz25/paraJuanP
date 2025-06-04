const express = require("express");
const router = express.Router();
const usuariosmodel = require("../modelo/usuariosmodelo.js");
 
router.post("/usuarios", usuariosmodel.ingresar); // Ruta para Netlify Functions
router.get("/usuarios/:iden", usuariosmodel.consultarDetalle); // Ruta para Netlify Functions

module.exports = router;