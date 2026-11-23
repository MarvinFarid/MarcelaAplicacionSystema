// =========================================================
// 1. CONFIGURACIÓN DE MESAS, MENÚ POR DEFECTO Y MEMORIA
// =========================================================

let cantidadMesasConfiguradas = parseInt(localStorage.getItem("TQP_cantidad_mesas")) || 10;
let listaMesas = [];


// Intentamos leer el menú guardado. Si no existe, cargamos tu lista original de hace 5 años
let menuProductos = JSON.parse(localStorage.getItem("TQP_menu_productos")) || [
    { id: "pollo3", nombre: "Tacos de pollo 3 unidades", precio: 5.00, categoria: "pollo" },
    { id: "pollo4", nombre: "Tacos de pollo 4 unidades", precio: 6.50, categoria: "pollo" },
    { id: "pollo5", nombre: "Tacos de pollo 5 unidades", precio: 8.00, categoria: "pollo" },
    { id: "tortap", nombre: "Torta de pollo", precio: 4.50, categoria: "pollo" },
    { id: "burritop", nombre: "Burrito de pollo", precio: 5.50, categoria: "pollo" },
    { id: "Np", nombre: "Nachos de pollo", precio: 6.00, categoria: "pollo" },
    { id: "Hp", nombre: "Huarache de pollo", precio: 5.00, categoria: "pollo" },
    { id: "Gp", nombre: "Gringa de pollo", precio: 5.50, categoria: "pollo" },
    { id: "Ap", nombre: "Alambre de pollo", precio: 6.50, categoria: "pollo" },
    { id: "Sp", nombre: "Sopes de pollo", precio: 4.00, categoria: "pollo" },
    { id: "tortafu", nombre: "Torta fuleada", precio: 7.00, categoria: "pollo" },
    { id: "tm3", nombre: "Taco mixto 3 unidades", precio: 6.00, categoria: "mixto" },
    { id: "tm4", nombre: "Taco mixto 4 unidades", precio: 7.50, categoria: "mixto" },
    { id: "tm5", nombre: "Taco mixto 5 unidades", precio: 9.00, categoria: "mixto" },
    { id: "bmx", nombre: "Burrito mixto", precio: 6.50, categoria: "mixto" },
    { id: "tormx", nombre: "Torta mixta", precio: 5.50, categoria: "mixto" },
    { id: "nmx", nombre: "Nacho mixto", precio: 7.00, categoria: "mixto" },
    { id: "hrmx", nombre: "Huarache mixto", font: "mixto", precio: 6.00, categoria: "mixto" },
    { id: "gmx", nombre: "Gringa mixta", precio: 6.50, categoria: "mixto" },
    { id: "almx", nombre: "Alambre mixto", precio: 7.50, categoria: "mixto" },
    { id: "smx", nombre: "Sopes mixtos", precio: 4.50, categoria: "mixto" }
];

function inicializarMesas() {
    listaMesas = [];
    for (let i = 1; i <= cantidadMesasConfiguradas; i++) {
        // Estructura dinámica: El pedido de cada mesa se adaptará al menú actual
        let pedidoInicial = {};
        menuProductos.forEach(p => { pedidoInicial[p.id] = 0; });

        listaMesas.push({
            id: i,
            estado: "libre",
            totalMesa: 0,
            pedido: pedidoInicial
        });
    }
}

// =========================================================
// 2. INTERFAZ VISUAL: DIBUJAR PANELES Y TABLAS
// =========================================================

// Dibuja la lista de platillos editables en el panel de control
// Dibuja la lista de platillos editables en el panel de control (CON BOTÓN DE BORRAR)
function dibujarEditorMenu() {
    const contenedorMenu = document.getElementById("tabla-menu-config");
    if (!contenedorMenu) return;
    contenedorMenu.innerHTML = "";

    menuProductos.forEach((producto, index) => {
        const fila = document.createElement("div");
        fila.classList.add("fila-producto-config");

        // Creamos la fila incluyendo un botón rojo con una X para eliminar
        fila.innerHTML = `
            <span class="badge-cat">${producto.categoria}</span>
            <input type="text" class="input-nombre-config" value="${producto.nombre}" data-index="${index}">
            <input type="number" step="0.01" class="input-precio-config" value="${producto.precio}" data-index="${index}">
            <button type="button" class="btn-borrar-platillo" data-index="${index}" style="background-color: #e53e3e; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">❌</button>
        `;
        contenedorMenu.appendChild(fila);
    });

    // Conectamos la acción de borrar a todos los botones X recién creados
    const botonesBorrar = document.querySelectorAll(".btn-borrar-platillo");
    botonesBorrar.forEach(boton => {
        boton.onclick = function() {
            const indexABorrar = this.getAttribute("data-index");
            const producto = menuProductos[indexABorrar];

            // Le preguntamos al dueño si está seguro para evitar accidentes
            if (confirm("¿Estás seguro de que deseas eliminar '" + producto.nombre + "' del menú?")) {
                // Eliminamos el producto del Array usando splice
                menuProductos.splice(indexABorrar, 1);
                
                // Redibujamos inmediatamente la lista para que el dueño vea el cambio
                dibujarEditorMenu();
            }
        };
    });
}
let mesaSeleccionada = null; 

function dibujarMesasEnPantalla() {
    const contenedor = document.getElementById("contenedor-mesas-grid");
    if (!contenedor) return; 
    contenedor.innerHTML = "";

    listaMesas.forEach(mesa => {
        const divMesa = document.createElement("div");
        divMesa.classList.add("tarjeta-mesa");
        divMesa.classList.add(mesa.estado === "libre" ? "mesa-libre" : "mesa-ocupada");
        
        // Mantener el borde dorado si ya estaba seleccionada
        if (mesaSeleccionada == mesa.id) {
            divMesa.classList.add("mesa-activa");
        }

        divMesa.innerHTML = `
            Mesa ${mesa.id}
            <span class="subtexto-mesa">${mesa.estado.toUpperCase()}</span>
        `;

        divMesa.onclick = function() {
            // 1. Quitar el borde dorado a cualquier otra mesa
            const todasLasMesas = document.querySelectorAll('.tarjeta-mesa');
            todasLasMesas.forEach(m => m.classList.remove('mesa-activa'));

            // 2. Guardar cuál mesa se seleccionó y ponerle el borde dorado
            mesaSeleccionada = mesa.id;
            divMesa.classList.add("mesa-activa");

            // 3. HACER APARECER LOS BOTONES (Corregido con tu ID exacto de tu HTML)
            const btnGuardar = document.getElementById('btn-guardar-pedido');
            const btnCobrar = document.getElementById('btn-cobrar-mesa');
            if (btnGuardar) btnGuardar.style.display = 'inline-block';
            if (btnCobrar) btnCobrar.style.display = 'inline-block';

            // 4. Dibujar el formulario con los platillos del menú
            generarFormularioPedido(mesa.id);
        };

        contenedor.appendChild(divMesa);
    });
}



// =========================================================
// 3. PROCESAR GUARDADO DE CAMBIOS
// =========================================================

function procesarGuardadoConfiguracion() {
    // 1. Guardar Mesas si el dueño escribió algo
    const inputMesas = document.getElementById("input-mesas");
    if (inputMesas && inputMesas.value > 0) {
        cantidadMesasConfiguradas = parseInt(inputMesas.value);
        localStorage.setItem("TQP_cantidad_mesas", cantidadMesasConfiguradas);
        inputMesas.value = "";
    }

    // 2. Leer las filas de la tabla para capturar cambios en nombres o precios
    const nombresInputs = document.querySelectorAll(".input-nombre-config");
    const preciosInputs = document.querySelectorAll(".input-precio-config");

    nombresInputs.forEach(input => {
        const idx = input.getAttribute("data-index");
        menuProductos[idx].nombre = input.value;
    });

    preciosInputs.forEach(input => {
        const idx = input.getAttribute("data-index");
        menuProductos[idx].precio = parseFloat(input.value) || 0;
    });

    // Guardar el menú modificado permanentemente
    localStorage.setItem("TQP_menu_productos", JSON.stringify(menuProductos));
    
    // Reiniciar y redibujar todo con los nuevos datos
    inicializarMesas();
    dibujarMesasEnPantalla();
    dibujarEditorMenu();
    alert("¡Configuración guardada! Mesas y Menú actualizados para hoy.");
}

// =========================================================
// 4. ARRANQUE DEL SISTEMA
// =========================================================
window.addEventListener("DOMContentLoaded", function() {
    
    // Conectar botón guardar
    const btnGuardar = document.getElementById("btn-guardar-config");
    if (btnGuardar) { btnGuardar.onclick = procesarGuardadoConfiguracion; }

    // Conectar botón agregar bebida / extra
    const btnAgregar = document.getElementById("btn-agregar-article") || document.getElementById("btn-agregar-articulo");
    if (btnAgregar) {
        btnAgregar.onclick = function() {
            const nombreBebida = prompt("Nombre de la nueva bebida o platillo:");
            if (!nombreBebida) return;
            const precioBebida = parseFloat(prompt("Precio:", "1.50")) || 0;
            
            // Generamos un ID único basado en el tiempo
            const nuevoId = "extra_" + Date.now();
            
            menuProductos.push({
                id: nuevoId,
                nombre: nombreBebida,
                precio: precioBebida,
                categoria: "bebida" // Se asigna automáticamente a la nueva categoría
            });

            dibujarEditorMenu(); // Redibuja la tabla para que el dueño la vea de inmediato
        };
    }

    // Encendido inicial
    inicializarMesas();
    dibujarMesasEnPantalla();
    dibujarEditorMenu();
});
function generarFormularioPedido(numeroMesa) {
    const contenedorFormulario = document.getElementById('contenedor-formulario-pedido');
    if (!contenedorFormulario) return;

    const tituloPedido = document.getElementById('titulo-mesa-activa');
    if (tituloPedido) {
        tituloPedido.innerText = `📌 Pedido para Mesa ${numeroMesa}`;
        const parrafoInstruccion = tituloPedido.nextElementSibling;
        if (parrafoInstruccion && parrafoInstruccion.tagName === "P") {
            parrafoInstruccion.style.display = 'none';
        }
    }

    const menuActual = JSON.parse(localStorage.getItem('TQP_menu_productos')) || menuProductos || [];

    if (menuActual.length === 0) {
        contenedorFormulario.innerHTML = '<p style="color: red; padding: 10px; font-weight: bold;">Primero debes agregar platillos en el Módulo de Gestión de Menú.</p>';
        return;
    }

    // Recuperamos las cantidades guardadas previamente para ESTA mesa, si no existen iniciamos en 0
    const cantidadesGuardadas = pedidosPorMesa[numeroMesa] || new Array(menuActual.length).fill(0);

    let htmlFormulario = '<form id="form-cantidades" style="display: flex; flex-direction: column; gap: 10px;">';
    
    menuActual.forEach((platillo, index) => {
        // Usamos la cantidad guardada en lugar de dejarlo fijo en 0
        const cantidadActual = cantidadesGuardadas[index] || 0;

        htmlFormulario += `
            <div class="fila-formulario-pedido" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #edf2f7;">
                <label style="display: flex; flex-direction: column; font-family: Arial, sans-serif;">
                    <span style="font-weight: bold; color: #2d3748;">${platillo.nombre}</span>
                    <span style="font-size: 0.85em; color: #718096;">$${platillo.precio.toFixed(2)}</span>
                </label>
                <input type="number" id="cant-${index}" data-nombre="${platillo.nombre}" min="0" value="${cantidadActual}" style="width: 65px; text-align: center; padding: 6px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 1rem;">
            </div>
        `;
    });

    htmlFormulario += '</form>';
    contenedorFormulario.innerHTML = htmlFormulario;
}

// Variable global para almacenar las cantidades por mesa (ej: { 1:, 2: [1, 0, 0] })
let pedidosPorMesa = JSON.parse(localStorage.getItem('TQP_pedidos_mesas')) || {};
function guardarPedidoMesaActual() {
    if (!mesaSeleccionada) {
        alert("Por favor, selecciona una mesa primero.");
        return;
    }

    const menuActual = JSON.parse(localStorage.getItem('TQP_menu_productos')) || menuProductos || [];
    let cantidadesAnotadas = [];

    // Recorremos los inputs numéricos del formulario y guardamos sus valores
    menuActual.forEach((_, index) => {
        const inputCant = document.getElementById(`cant-${index}`);
        const cantidad = inputCant ? parseInt(inputCant.value) || 0 : 0;
        cantidadesAnotadas.push(cantidad);
    });

    // Guardamos el arreglo de cantidades en el objeto global usando el ID de la mesa
    pedidosPorMesa[mesaSeleccionada] = cantidadesAnotadas;

    // Actualizamos el estado de la mesa a 'ocupada' si hay algún producto mayor a 0
    const tieneConsumo = cantidadesAnotadas.some(cant => cant > 0);
    const mesaEnLista = listaMesas.find(m => m.id == mesaSeleccionada);
    
    if (mesaEnLista) {
        mesaEnLista.estado = tieneConsumo ? "ocupada" : "libre";
        // Guardamos el estado de las mesas en tu localStorage de mesas (asumiendo que usas esta llave)
        localStorage.setItem("TQP_lista_mesas", JSON.stringify(listaMesas));
    }

    // Guardamos permanentemente los pedidos en el LocalStorage
    localStorage.setItem('TQP_pedidos_mesas', JSON.stringify(pedidosPorMesa));

    // Redibujamos las mesas para que cambien de color (verde/rojo) según su nuevo estado
    dibujarMesasEnPantalla();

    alert(`¡Pedido guardado con éxito en la Mesa ${mesaSeleccionada}!`);
}
document.addEventListener("DOMContentLoaded", () => {
    const btnGuardarPedido = document.getElementById('btn-guardar-pedido');
    if (btnGuardarPedido) {
        btnGuardarPedido.onclick = guardarPedidoMesaActual;
    }
    const btnCobrarMesa = document.getElementById('btn-cobrar-mesa');
    if (btnCobrarMesa) {
        btnCobrarMesa.onclick = cobrarMesaActual;
    }
});
// --- FUNCION PARA COBRAR Y CERRAR LA MESA ---
function cobrarMesaActual() {
    if (!mesaSeleccionada) {
        alert("Por favor, selecciona una mesa primero.");
        return;
    }

    const menuActual = JSON.parse(localStorage.getItem('TQP_menu_productos')) || menuProductos || [];
    const cantidadesGuardadas = pedidosPorMesa[mesaSeleccionada];

    // Si la mesa no tiene un pedido guardado o todo está en 0
    if (!cantidadesGuardadas || !cantidadesGuardadas.some(cant => cant > 0)) {
        alert("Esta mesa no tiene consumos registrados para cobrar.");
        return;
    }

    // 1. CALCULAMOS EL TOTAL DE LA CUENTA
    let totalCuenta = 0;
    menuActual.forEach((platillo, index) => {
        const cantidad = cantidadesGuardadas[index] || 0;
        totalCuenta += cantidad * platillo.precio;
    });

    // Confirmación del cobro con el dueño/cajero
    const confirmar = confirm(`Mesa ${mesaSeleccionada}\n\nTotal a cobrar: $${totalCuenta.toFixed(2)}\n\n¿Deseas procesar el pago y cerrar la mesa?`);
    
    if (!confirmar) return; // Si cancela, no hace nada

    // 2. PASO FINAL: MOVER LA INFORMACIÓN AL INVENTARIO
    // Aquí es donde el pedido viaja a tus fórmulas originales.
    // Como tu función pesoscarne() lee directamente los consumos, la llamamos aquí:
    if (typeof pesoscarne === "function") {
        pesoscarne(); // Ejecuta tus cálculos de onzas y libras de 2021
    }

    // 3. LIMPIAR LA MESA (Volver a dejarla libre y vacía)
    delete pedidosPorMesa[mesaSeleccionada]; // Borramos sus consumos
    localStorage.setItem('TQP_pedidos_mesas', JSON.stringify(pedidosPorMesa));

    // Cambiamos el estado de la mesa en tu lista global a 'libre'
    const mesaEnLista = listaMesas.find(m => m.id == mesaSeleccionada);
    if (mesaEnLista) {
        mesaEnLista.estado = "libre";
        localStorage.setItem("TQP_lista_mesas", JSON.stringify(listaMesas));
    }

    // 4. REFRESCAR LA PANTALLA
    dibujarMesasEnPantalla(); // La mesa volverá a ser verde (LIBRE)
    generarFormularioPedido(mesaSeleccionada); // El formulario se vaciará

    alert(`¡Mesa ${mesaSeleccionada} cobrada con éxito! Total: $${totalCuenta.toFixed(2)}. La mesa ahora está disponible.`);
}



