function guardar() {
    event.preventDefault();
    
    // Obtener valores y hacer debug
    const dni = document.getElementById("dni").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const email = document.getElementById("correo").value.trim();
    
    console.log("Datos del formulario:", { dni, nombre, apellidos, email });
    
    if (!dni || !nombre || !apellidos || !email) {
        alert("Todos los campos son requeridos");
        return;
    }
    
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const userData = {
        dni: dni,
        nombre: nombre,
        apellidos: apellidos,
        email: email
    };

    console.log("Datos a enviar:", userData);

    let requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(userData),
        redirect: "follow"
    };
    
    console.log("Enviando petición...");
    
    // URL corregida - agregar la ruta /usuarios al final
    fetch("parajuanp.netlify.app/.netlify/functions/usuarios", requestOptions)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((result) => {
            console.log("Usuario creado:", result);
            alert("Usuario guardado exitosamente!");
            // Limpiar el formulario después de guardar
            document.getElementById("adicionarEstudiante").reset();
            // Mostrar el resultado
            mostrarResultado(result);
        })
        .catch((error) => {
            console.error("Error al guardar:", error);
            alert("Error al guardar el usuario: " + error.message);
        });
}

function listar() {
    event.preventDefault();
    
    const ndoc = document.getElementById("numdoc").value.trim();
    
    if (!ndoc) {
        alert("Ingrese el número de documento");
        return;
    }
    
    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };
    
    // URL corregida con query parameter
    fetch(`parajuanp.netlify.app/?iden=${ndoc}`, requestOptions)
        .then((response) => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Usuario no encontrado");
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((result) => {
            console.log("Usuario encontrado:", result);
            mostrarResultado(result);
        })
        .catch((error) => {
            console.error("Error al buscar:", error);
            document.getElementById("rta").innerHTML = `<span style="color: red;">Error: ${error.message}</span>`;
        });
}

function mostrarResultado(data) {
    let salida = "<h3>Resultado:</h3>";
    
    if (typeof data === 'object' && data !== null) {
        for (const [clave, valor] of Object.entries(data)) {
            if (clave !== 'fechaCreacion') { // Omitir fecha de creación en la visualización
                salida += `<strong>${clave}:</strong> ${valor}<br>`;
            }
        }
    } else {
        salida += data;
    }
    
    document.getElementById("rta").innerHTML = salida;
}

// Función de utilidad para limpiar resultados
function limpiarResultados() {
    document.getElementById("rta").innerHTML = "Resultado:";
}