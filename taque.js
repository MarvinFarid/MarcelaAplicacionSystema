// =========================================================
// 1. CONFIGURACIÓN DE MESAS, MENÚ POR DEFECTO Y MEMORIA
// =========================================================

const CODIGO_ACTIVACION = 'MILAGRITO_26';

function inicializarActivacion() {
    const app = document.getElementById('app-shell');
    const pantallaActivacion = document.getElementById('activation-screen');

    if (localStorage.getItem('app_activada') === 'true') {
        pantallaActivacion.hidden = true;
        app.hidden = false;
        return;
    }

    app.hidden = true;
    pantallaActivacion.hidden = false;
    document.getElementById('activation-code').focus();
}

function validarCodigoActivacion(event) {
    event.preventDefault();

    const input = document.getElementById('activation-code');
    const error = document.getElementById('activation-error');
    if (input.value.trim() !== CODIGO_ACTIVACION) {
        error.textContent = 'Código incorrecto. Verifica e inténtalo de nuevo.';
        input.value = '';
        input.focus();
        return;
    }

    localStorage.setItem('app_activada', 'true');
    error.textContent = '';
    document.getElementById('activation-screen').hidden = true;
    document.getElementById('app-shell').hidden = false;
}

window.addEventListener('DOMContentLoaded', inicializarActivacion);

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
    const estadoMesaParaLlevar = listaMesas.find(m => m.id === "LLEVAR")?.estado || "libre";
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

    listaMesas.push({
        id: "LLEVAR",
        nombre: "🛍️ Para Llevar",
        estado: estadoMesaParaLlevar
    });
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
        const esParaLlevar = mesa.id === "LLEVAR";
        divMesa.classList.add("tarjeta-mesa");
        divMesa.classList.add(mesa.estado === "libre" ? "mesa-libre" : "mesa-ocupada");
        if (esParaLlevar) {
            divMesa.style.border = "3px solid #805ad5";
            divMesa.style.backgroundColor = "#553c9a";
        }
        
        // Mantener el borde dorado si ya estaba seleccionada
        if (mesaSeleccionada == mesa.id) {
            divMesa.classList.add("mesa-activa");
        }

        divMesa.innerHTML = `
            ${esParaLlevar ? mesa.nombre : `Mesa ${mesa.id}`}
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
            const btnLiberar = document.getElementById('btn-liberar-mesa-mesero');
            const rolDispositivo = localStorage.getItem('TQP_device_mode') || 'abierto';
            if (btnGuardar) btnGuardar.style.display = 'inline-block';
            if (rolDispositivo === 'mesero') {
                if (btnCobrar) btnCobrar.style.display = 'none';
                if (btnLiberar) btnLiberar.style.display = 'inline-block';
            } else {
                if (btnCobrar) btnCobrar.style.display = 'inline-block';
                if (btnLiberar) btnLiberar.style.display = 'none';
            }

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
    localStorage.setItem("TQP_lista_mesas", JSON.stringify(listaMesas));
    dibujarMesasEnPantalla();
    dibujarEditorMenu();
    alert("¡Configuración guardada! Mesas y Menú actualizados para hoy.");
}
// =========================================================
// 4. ARRANQUE DEL SISTEMA Y MEMORIA DE PROPINAS
// =========================================================
let pedidosPorMesa = JSON.parse(localStorage.getItem('TQP_pedidos_mesas')) || {};
let propinasPorMesa = JSON.parse(localStorage.getItem('TQP_propinas_mesas')) || {};

window.addEventListener("DOMContentLoaded", function() {
    
    // Conectar botón guardar configuración
    const btnGuardar = document.getElementById("btn-guardar-config");
    if (btnGuardar) { btnGuardar.onclick = procesarGuardadoConfiguracion; }

    // Conectar botón agregar bebida / extra
    const btnAgregar = document.getElementById("btn-agregar-article") || document.getElementById("btn-agregar-articulo");
    if (btnAgregar) {
        btnAgregar.onclick = function() {
            const nombreBebida = prompt("Nombre de la nueva bebida o platillo:");
            if (!nombreBebida) return;
            const precioBebida = parseFloat(prompt("Precio:", "1.50")) || 0;
            
            const nuevoId = "extra_" + Date.now();
            menuProductos.push({
                id: nuevoId,
                nombre: nombreBebida,
                precio: precioBebida,
                categoria: "bebida"
            });

            dibujarEditorMenu();
        };
    }

    // Conectar botones de pedido y cobro
    const btnGuardarPedido = document.getElementById('btn-guardar-pedido');
    if (btnGuardarPedido) { btnGuardarPedido.onclick = guardarPedidoMesaActual; }

    const btnCobrarMesa = document.getElementById('btn-cobrar-mesa');
    if (btnCobrarMesa) { btnCobrarMesa.onclick = cobrarMesaActual; }

    // Encendido inicial y restauración de mesas ocupadas guardadas
    inicializarMesas();
    const mesasGuardadas = JSON.parse(localStorage.getItem("TQP_lista_mesas"));
    if (Array.isArray(mesasGuardadas)) {
        const mesaParaLlevarGuardada = mesasGuardadas.find(m => m.id === "LLEVAR");
        const mesasFisicasGuardadas = mesasGuardadas.filter(m => m.id !== "LLEVAR");
        if (mesasFisicasGuardadas.length === cantidadMesasConfiguradas) {
            listaMesas = mesasFisicasGuardadas;
        }
        listaMesas = listaMesas.filter(m => m.id !== "LLEVAR");
        listaMesas.push({
            id: "LLEVAR",
            nombre: "🛍️ Para Llevar",
            estado: mesaParaLlevarGuardada?.estado || "libre"
        });
    }

    dibujarMesasEnPantalla();
    dibujarEditorMenu();
    inicializarModuloEmpleados();
    inicializarControlAcceso(); // <--- AGREGA ESTA LÍNEA AQUÍ
    inicializarModuloGastos();
});

// =========================================================
// 5. FORMULARIO DE PEDIDOS, PROPINAS Y COBRO
// =========================================================
function generarFormularioPedido(numeroMesa) {
    const contenedorFormulario = document.getElementById('contenedor-formulario-pedido');
    const bloquePropinas = document.getElementById('bloque-propinas-mesa');
    if (!contenedorFormulario) return;

    const tituloPedido = document.getElementById('titulo-mesa-activa');
    if (tituloPedido) {
        tituloPedido.innerText = numeroMesa === "LLEVAR"
            ? "🛍️ Orden Para Llevar"
            : `📌 Pedido para Mesa ${numeroMesa}`;
        const parrafoInstruccion = tituloPedido.nextElementSibling;
        if (parrafoInstruccion && parrafoInstruccion.tagName === "P") {
            parrafoInstruccion.style.display = 'none';
        }
    }

    const menuActual = JSON.parse(localStorage.getItem('TQP_menu_productos')) || menuProductos || [];

    if (menuActual.length === 0) {
        contenedorFormulario.innerHTML = '<p style="color: red; padding: 10px; font-weight: bold;">Primero debes agregar platillos en el Módulo de Gestión de Menú.</p>';
        if (bloquePropinas) bloquePropinas.style.display = 'none';
        return;
    }

    const cantidadesGuardadas = pedidosPorMesa[numeroMesa] || new Array(menuActual.length).fill(0);

   // let htmlFormulario = '<div id="form-cantidades" style="display: flex; flex-direction: column; gap: 10px;">';
   let htmlFormulario = "";

    
    menuActual.forEach((platillo, index) => {
        const cantidadActual = cantidadesGuardadas[index] || 0;

        htmlFormulario += `
            <div class="item-pedido-fila" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #edf2f7;">
                <label style="display: flex; flex-direction: column; font-family: Arial, sans-serif;">
                    <span style="font-weight: bold; color: #2d3748;">${platillo.nombre}</span>
                    <span style="font-size: 0.85em; color: #718096;">$${platillo.precio.toFixed(2)}</span>
                </label>
                <input type="number" id="cant-${index}" data-nombre="${platillo.nombre}" min="0" value="${cantidadActual}" oninput="actualizarResumenCuenta()" style="width: 65px; text-align: center; padding: 6px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 1rem;">
            </div>
        `;
    });

    htmlFormulario += '</div>';
    contenedorFormulario.innerHTML = htmlFormulario;

    // Mostrar y restaurar la configuración de propina de esta mesa
    if (bloquePropinas) {
        bloquePropinas.style.display = 'block';
        const propinaGuardada = propinasPorMesa[numeroMesa] || { tipo: "sin", montoPersonalizado: 0 };
        const tipoPropinaInicial = numeroMesa === "LLEVAR" && !propinasPorMesa[numeroMesa]
            ? "sin"
            : propinaGuardada.tipo;
        
        const radios = document.querySelectorAll('input[name="tipo-propina"]');
        radios.forEach(r => { r.checked = (r.value === tipoPropinaInicial); });

        const inputPers = document.getElementById('input-propina-personalizada');
        if (inputPers) {
            inputPers.value = propinaGuardada.montoPersonalizado > 0 ? propinaGuardada.montoPersonalizado : "";
        }
    }

    actualizarResumenCuenta();
}

// Calcula en tiempo real el consumo + propina + total final
function actualizarResumenCuenta() {
    const menuActual = JSON.parse(localStorage.getItem('TQP_menu_productos')) || menuProductos || [];
    let subtotal = 0;

    menuActual.forEach((platillo, index) => {
        const inputCant = document.getElementById(`cant-${index}`);
        const cantidad = inputCant ? parseInt(inputCant.value) || 0 : 0;
        subtotal += cantidad * platillo.precio;
    });

    const radioSeleccionado = document.querySelector('input[name="tipo-propina"]:checked');
    const tipoPropina = radioSeleccionado ? radioSeleccionado.value : "sin";
    const inputPers = document.getElementById('input-propina-personalizada');

    let montoPropina = 0;

    if (tipoPropina === "5") {
        montoPropina = subtotal * 0.05;
        if (inputPers) inputPers.disabled = true;
    } else if (tipoPropina === "personalizada") {
        if (inputPers) {
            inputPers.disabled = false;
            montoPropina = parseFloat(inputPers.value) || 0;
        }
    } else {
        montoPropina = 0;
        if (inputPers) inputPers.disabled = true;
    }

    const totalFinal = subtotal + montoPropina;

    const elSub = document.getElementById('resumen-subtotal');
    const elTip = document.getElementById('resumen-tip');
    const elTot = document.getElementById('resumen-total-final');

    if (elSub) elSub.innerText = `$${subtotal.toFixed(2)}`;
    if (elTip) elTip.innerText = `$${montoPropina.toFixed(2)}`;
    if (elTot) elTot.innerText = `$${totalFinal.toFixed(2)}`;

    return { subtotal, montoPropina, totalFinal, tipoPropina };
}

function guardarPedidoMesaActual() {
    if (!mesaSeleccionada) {
        alert("Por favor, selecciona una mesa primero.");
        return;
    }

    const menuActual = JSON.parse(localStorage.getItem('TQP_menu_productos')) || menuProductos || [];
    let cantidadesAnotadas = [];

    menuActual.forEach((_, index) => {
        const inputCant = document.getElementById(`cant-${index}`);
        const cantidad = inputCant ? parseInt(inputCant.value) || 0 : 0;
        cantidadesAnotadas.push(cantidad);
    });

    pedidosPorMesa[mesaSeleccionada] = cantidadesAnotadas;

    // Guardar también la propina seleccionada para esta mesa
    const resumen = actualizarResumenCuenta();
    const inputPers = document.getElementById('input-propina-personalizada');
    propinasPorMesa[mesaSeleccionada] = {
        tipo: resumen.tipoPropina,
        montoPersonalizado: inputPers ? parseFloat(inputPers.value) || 0 : 0
    };

    const tieneConsumo = cantidadesAnotadas.some(cant => cant > 0);
    const mesaEnLista = listaMesas.find(m => m.id == mesaSeleccionada);
    
    if (mesaEnLista) {
        mesaEnLista.estado = tieneConsumo ? "ocupada" : "libre";
        localStorage.setItem("TQP_lista_mesas", JSON.stringify(listaMesas));
    }

    localStorage.setItem('TQP_pedidos_mesas', JSON.stringify(pedidosPorMesa));
    localStorage.setItem('TQP_propinas_mesas', JSON.stringify(propinasPorMesa));

    dibujarMesasEnPantalla();

    alert(`¡Pedido guardado con éxito en la Mesa ${mesaSeleccionada}!\nTotal actual (con propina): $${resumen.totalFinal.toFixed(2)}`);
}

function liberarMesaSinCobrar() {
    if (!mesaSeleccionada) {
        alert("Por favor, selecciona una mesa primero.");
        return;
    }

    const mesaId = mesaSeleccionada;
    if (!confirm(`¿Liberar la Mesa ${mesaId} sin cobrar? Se eliminarán el pedido y la propina asociados.`)) return;

    delete pedidosPorMesa[mesaId];
    delete propinasPorMesa[mesaId];

    const mesaEnLista = listaMesas.find(m => m.id == mesaId);
    if (mesaEnLista) mesaEnLista.estado = "libre";

    localStorage.setItem('TQP_pedidos_mesas', JSON.stringify(pedidosPorMesa));
    localStorage.setItem('TQP_propinas_mesas', JSON.stringify(propinasPorMesa));
    localStorage.setItem('TQP_lista_mesas', JSON.stringify(listaMesas));

    dibujarMesasEnPantalla();
    generarFormularioPedido(mesaId);
}

// --- FUNCIÓN PARA COBRAR Y CERRAR LA MESA ---
function cobrarMesaActual() {
    if (!mesaSeleccionada) {
        alert("Por favor, selecciona una mesa primero.");
        return;
    }

    const resumen = actualizarResumenCuenta();

    if (resumen.subtotal <= 0) {
        alert("Esta mesa no tiene consumos registrados para cobrar.");
        return;
    }

    // 1. Obtener método de pago del consumo y de la propina
    const radioPago = document.querySelector('input[name="metodo-pago"]:checked');
    const metodoPago = radioPago ? radioPago.value : "Cash";

    const radioPropina = document.querySelector('input[name="metodo-propina"]:checked');
    const seleccionPropina = radioPropina ? radioPropina.value : "Igual";
    const metodoPropina = (seleccionPropina === "Igual") ? metodoPago : seleccionPropina;

    const textoTipDetalle = (resumen.montoPropina > 0)
        ? `Propina (${metodoPropina}): $${resumen.montoPropina.toFixed(2)}`
        : `Propina: $0.00`;
    const nombreMesa = mesaSeleccionada === "LLEVAR"
        ? "🛍️ Para Llevar"
        : `Mesa ${mesaSeleccionada}`;

    const confirmar = confirm(
        `${nombreMesa}\n\n` +
        `Consumo (${metodoPago}): $${resumen.subtotal.toFixed(2)}\n` +
        `${textoTipDetalle}\n` +
        `---------------------------\n` +
        `TOTAL A COBRAR: $${resumen.totalFinal.toFixed(2)}\n\n` +
        `¿Deseas procesar el pago y cerrar la mesa?`
    );
    
    if (!confirmar) return;

    if (typeof pesoscarne === "function") {
        pesoscarne();
    }

    // 2. Guardar registro con ambos métodos diferenciados
    const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    historialVentasDia.push({
        hora: horaActual,
        mesa: mesaSeleccionada,
        metodoPago: metodoPago,
        metodoPropina: metodoPropina,
        consumo: resumen.subtotal,
        propina: resumen.montoPropina,
        total: resumen.totalFinal
    });
    localStorage.setItem('TQP_historial_dia', JSON.stringify(historialVentasDia));

    // 3. Limpiar consumos y propina de la mesa
    delete pedidosPorMesa[mesaSeleccionada];
    delete propinasPorMesa[mesaSeleccionada];
    localStorage.setItem('TQP_pedidos_mesas', JSON.stringify(pedidosPorMesa));
    localStorage.setItem('TQP_propinas_mesas', JSON.stringify(propinasPorMesa));

    // Reiniciar selectores de pago por defecto
    const radioCash = document.querySelector('input[name="metodo-pago"][value="Cash"]');
    if (radioCash) radioCash.checked = true;
    const radioTipIgual = document.querySelector('input[name="metodo-propina"][value="Igual"]');
    if (radioTipIgual) radioTipIgual.checked = true;

    const mesaEnLista = listaMesas.find(m => m.id == mesaSeleccionada);
    if (mesaEnLista) {
        mesaEnLista.estado = "libre";
        localStorage.setItem("TQP_lista_mesas", JSON.stringify(listaMesas));
    }

    dibujarMesasEnPantalla();
    generarFormularioPedido(mesaSeleccionada);
    dibujarResumenDia();

    alert(`¡${nombreMesa} cobrada!\nConsumo: ${metodoPago} | Propina: ${metodoPropina}\nTotal: $${resumen.totalFinal.toFixed(2)}`);
}
// 6. RESUMEN DEL DÍA Y MÉTODOS DE PAGO
// =========================================================
let historialVentasDia = JSON.parse(localStorage.getItem('TQP_historial_dia')) || [];

// ==========================================
// MÓDULO DE SALIDAS DE EFECTIVO (GASTOS)
// ==========================================
let catalogoGastosFijos = JSON.parse(localStorage.getItem("TQP_catalogo_gastos_fijos")) || ["Hielo", "Tortillas", "Gas"];
let catalogoGastosImprevistos = JSON.parse(localStorage.getItem("TQP_catalogo_gastos_imprevistos")) || ["Compra urgente", "Cambio / Sencillo", "Insumo faltante"];
let gastosCajaDia = JSON.parse(localStorage.getItem("TQP_gastos_dia")) || [];

function dibujarResumenDia() {
    const tbody = document.getElementById('tabla-historial-dia');
    if (!tbody) return;

    let sumaCash = 0;
    let sumaTarjeta = 0;
    let sumaTransferencia = 0;
    let sumaPropinas = 0;
    let sumaGeneral = 0;

    tbody.innerHTML = "";

    if (historialVentasDia.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding: 12px; text-align: center; color: #718096;">Aún no hay mesas cobradas hoy.</td></tr>`;
    } else {
        [...historialVentasDia].reverse().forEach(venta => {
            const pagoConsumo = venta.metodoPago || "Cash";
            const pagoPropina = venta.metodoPropina || pagoConsumo;

            if (pagoConsumo === "Cash") sumaCash += venta.consumo;
            if (pagoConsumo === "Tarjeta") sumaTarjeta += venta.consumo;
            if (pagoConsumo === "Transferencia") sumaTransferencia += venta.consumo;

            if (pagoPropina === "Cash") sumaCash += venta.propina;
            if (pagoPropina === "Tarjeta") sumaTarjeta += venta.propina;
            if (pagoPropina === "Transferencia") sumaTransferencia += venta.propina;

            sumaPropinas += venta.propina;
            sumaGeneral += venta.total;

          const detallePago = (venta.propina > 0)
            ? `${pagoConsumo} <br><small style="color:#2b6cb0; font-weight:600;">Tip: ${pagoPropina}</small>`
           : pagoConsumo;


            const fila = document.createElement("tr");
            fila.style.borderBottom = "1px solid #edf2f7";
            const nombreMesa = venta.mesa === "LLEVAR"
                ? "🛍️ Para Llevar"
                : `Mesa ${venta.mesa}`;
            fila.innerHTML = `
                <td style="padding: 8px;">${venta.hora}</td>
                <td style="padding: 8px;"><strong>${nombreMesa}</strong></td>
                <td style="padding: 8px;">${detallePago}</td>
                <td style="padding: 8px;">$${venta.consumo.toFixed(2)}</td>
                <td style="padding: 8px;">$${venta.propina.toFixed(2)}</td>
                <td style="padding: 8px;"><strong>$${venta.total.toFixed(2)}</strong></td>
            `;
            tbody.appendChild(fila);
        });
    }

    // Calcular total de salidas de efectivo (gastos) del día
    const sumaGastosCash = gastosCajaDia.reduce((acc, g) => acc + g.monto, 0);
    const cashNetoGaveta = sumaCash - sumaGastosCash;

    document.getElementById('total-dia-cash').innerText = `$${sumaCash.toFixed(2)}`;
    
    const elGastos = document.getElementById('total-dia-gastos');
    if (elGastos) elGastos.innerText = `-$${sumaGastosCash.toFixed(2)}`;

    const elCashNeto = document.getElementById('total-dia-cash-neto');
    if (elCashNeto) {
        elCashNeto.innerText = `$${cashNetoGaveta.toFixed(2)}`;
        elCashNeto.style.color = cashNetoGaveta < 0 ? "#c53030" : "#1c4532";
    }

    document.getElementById('total-dia-tarjeta').innerText = `$${sumaTarjeta.toFixed(2)}`;
    document.getElementById('total-dia-transferencia').innerText = `$${sumaTransferencia.toFixed(2)}`;
    document.getElementById('total-dia-propinas').innerText = `$${sumaPropinas.toFixed(2)}`;
    document.getElementById('total-dia-general').innerText = `$${sumaGeneral.toFixed(2)}`;
}

// =========================================================
// 7. MÓDULO DE CONSUMO DE EMPLEADOS (PESTAÑA 2)
// =========================================================
let listaEmpleados = JSON.parse(localStorage.getItem('TQP_lista_empleados')) || [];
let historialEmpleados = JSON.parse(localStorage.getItem('TQP_historial_empleados')) || [];

function cambiarPestana(pestana) {
    const vistaMesas = document.getElementById('vista-mesas-caja');
    const vistaEmpleados = document.getElementById('vista-consumo-empleados');
    const vistaCierres = document.getElementById('vista-historial-cierres');

    const btnMesas = document.getElementById('tab-btn-mesas');
    const btnEmpleados = document.getElementById('tab-btn-empleados');
    const btnCierres = document.getElementById('tab-btn-cierres');

    // 1. Ocultar todas las vistas y poner todos los botones en estado inactivo (#4a5568)
    if (vistaMesas) vistaMesas.style.display = 'none';
    if (vistaEmpleados) vistaEmpleados.style.display = 'none';
    if (vistaCierres) vistaCierres.style.display = 'none';

    [btnMesas, btnEmpleados, btnCierres].forEach(btn => {
        if (btn) {
            btn.style.backgroundColor = '#4a5568';
            btn.style.color = 'white';
        }
    });

    // 2. Activar únicamente la pestaña seleccionada
    if (pestana === 'empleados') {
        if (vistaEmpleados) vistaEmpleados.style.display = 'block';
        if (btnEmpleados) {
            btnEmpleados.style.backgroundColor = '#ecc94b';
            btnEmpleados.style.color = '#744210';
        }
        actualizarSelectEmpleados();
        dibujarMenuEmpleados();
        dibujarReporteEmpleados();
    } else if (pestana === 'cierres') {
        if (vistaCierres) vistaCierres.style.display = 'block';
        if (btnCierres) {
            btnCierres.style.backgroundColor = '#ecc94b';
            btnCierres.style.color = '#744210';
        }
        if (typeof dibujarHistorialCierres === 'function') {
            dibujarHistorialCierres();
        }
    } else {
        if (vistaMesas) vistaMesas.style.display = 'block';
        if (btnMesas) {
            btnMesas.style.backgroundColor = '#ecc94b';
            btnMesas.style.color = '#744210';
        }
    }
}


function actualizarSelectEmpleados() {
    const select = document.getElementById('select-empleado-activo');
    if (!select) return;

    const valorPrevio = select.value;
    select.innerHTML = '<option value="">-- Elige un empleado --</option>';

    listaEmpleados.forEach((emp, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = `${emp.nombre} (${emp.descuento}% desc.)`;
        select.appendChild(option);
    });

    if (valorPrevio !== "") select.value = valorPrevio;
}

function dibujarMenuEmpleados() {
    const contenedor = document.getElementById('contenedor-menu-empleados');
    if (!contenedor) return;

    const menuActual = JSON.parse(localStorage.getItem('TQP_menu_productos')) || menuProductos || [];
    let html = "";

    menuActual.forEach((platillo, index) => {
        html += `
            <div class="item-pedido-fila">
                <label style="display: flex; flex-direction: column;">
                    <span style="font-weight: bold; color: #2d3748;">${platillo.nombre}</span>
                    <span style="font-size: 0.85em; color: #718096;">$${platillo.precio.toFixed(2)}</span>
                </label>
                <input type="number" id="emp-cant-${index}" min="0" value="0" oninput="actualizarCalculoEmpleado()">
            </div>
        `;
    });

    contenedor.innerHTML = html;
    actualizarCalculoEmpleado();
}

function actualizarCalculoEmpleado() {
    const menuActual = JSON.parse(localStorage.getItem('TQP_menu_productos')) || menuProductos || [];
    let subtotalNormal = 0;

    menuActual.forEach((platillo, index) => {
        const input = document.getElementById(`emp-cant-${index}`);
        const cant = input ? parseInt(input.value) || 0 : 0;
        subtotalNormal += cant * platillo.precio;
    });

    const select = document.getElementById('select-empleado-activo');
    const empIndex = select ? select.value : "";
    const porcentajeDescuento = (empIndex !== "" && listaEmpleados[empIndex])
        ? listaEmpleados[empIndex].descuento
        : 0;

    const montoDescuento = subtotalNormal * (porcentajeDescuento / 100);
    const totalADescontar = subtotalNormal - montoDescuento;

    document.getElementById('emp-subtotal-normal').innerText = `$${subtotalNormal.toFixed(2)}`;
    document.getElementById('emp-pct-label').innerText = porcentajeDescuento;
    document.getElementById('emp-monto-descuento').innerText = `-$${montoDescuento.toFixed(2)}`;
    document.getElementById('emp-total-descontar').innerText = `$${totalADescontar.toFixed(2)}`;

    return { subtotalNormal, porcentajeDescuento, montoDescuento, totalADescontar };
}

function registrarConsumoEmpleado() {
    const select = document.getElementById('select-empleado-activo');
    if (!select || select.value === "") {
        alert("Por favor, selecciona un empleado de la lista.");
        return;
    }

    const empleado = listaEmpleados[select.value];
    const menuActual = JSON.parse(localStorage.getItem('TQP_menu_productos')) || menuProductos || [];
    const calculo = actualizarCalculoEmpleado();

    if (calculo.subtotalNormal <= 0) {
        alert("Anota al menos un platillo consumido.");
        return;
    }

    // Recopilar qué platillos salieron y armar lista detallada
    let platillosConsumidos = [];
    let resumenTextoPlatillos = [];

    menuActual.forEach((platillo, index) => {
        const input = document.getElementById(`emp-cant-${index}`);
        const cant = input ? parseInt(input.value) || 0 : 0;
        if (cant > 0) {
            platillosConsumidos.push({ id: platillo.id, nombre: platillo.nombre, cantidad: cant });
            resumenTextoPlatillos.push(`${cant}x ${platillo.nombre}`);
        }
    });

    // Construir la reseña automática + observación manual
    const notaManual = document.getElementById('nota-consumo-empleado').value.trim();
    const resenaCompleta = `[CONSUMO EMPLEADO - ${empleado.descuento}% DESC]` + (notaManual ? ` ${notaManual}` : " Sin observación extra");

    const fechaHora = new Date().toLocaleDateString([], { month: '2-digit', day: '2-digit' }) + " " +
                      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    historialEmpleados.push({
        fechaHora: fechaHora,
        empleado: empleado.nombre,
        descuentoPct: empleado.descuento,
        platillos: platillosConsumidos,
        detalleTexto: resumenTextoPlatillos.join(", "),
        resena: resenaCompleta,
        valorNormal: calculo.subtotalNormal,
        montoDescontar: calculo.totalADescontar
    });

    localStorage.setItem('TQP_historial_empleados', JSON.stringify(historialEmpleados));

    // Limpiar formulario de empleado
    document.getElementById('nota-consumo-empleado').value = "";
    dibujarMenuEmpleados();
    dibujarReporteEmpleados();

    alert(
        `✅ Consumo registrado para ${empleado.nombre}\n` +
        `Platillos: ${resumenTextoPlatillos.join(", ")}\n` +
        `Reseña: ${resenaCompleta}\n` +
        `Monto a descontar a fin de mes: $${calculo.totalADescontar.toFixed(2)}\n\n` +
        `(Nota: No se sumó dinero a la caja del día)`
    );
}

function dibujarReporteEmpleados() {
    const contenedorSaldos = document.getElementById('resumen-saldos-empleados');
    const tbody = document.getElementById('tabla-historial-empleados');
    if (!contenedorSaldos || !tbody) return;

    // 1. Calcular acumulado por cada empleado
    let saldosPorNombre = {};
    listaEmpleados.forEach(emp => { saldosPorNombre[emp.nombre] = 0; });

    historialEmpleados.forEach(reg => {
        if (saldosPorNombre[reg.empleado] === undefined) saldosPorNombre[reg.empleado] = 0;
        saldosPorNombre[reg.empleado] += reg.montoDescontar;
    });

    //contenedorSaldos.innerHTML = "";
 //   Object.keys(saldosPorNombre).forEach(nombre => {
   //     const tarjeta = document.createElement('div');
   //     tarjeta.style.cssText = "background: #ebf8ff; border: 1px solid #90cdf4; padding: 12px; border-radius: 6px;";
    //    tarjeta.innerHTML = `
    //        <div style="font-size: 0.9rem; color: #2b6cb0; font-weight: bold;">🧑‍🍳 ${nombre}</div>
    //        <div style="font-size: 0.8rem; color: #4a5568;">Acumulado a descontar:</div>
     //       <strong style="font-size: 1.3rem; color: #2c5282;">$${saldosPorNombre[nombre].toFixed(2)}</strong>
     //   `;
     //   contenedorSaldos.appendChild(tarjeta);
   // });
       contenedorSaldos.innerHTML = "";
    Object.keys(saldosPorNombre).forEach(nombre => {
        // Verificamos si el empleado sigue activo en listaEmpleados
        const sigueActivo = listaEmpleados.some(emp => emp.nombre === nombre);
        
        const tarjeta = document.createElement('div');
        tarjeta.style.cssText = "position: relative; background: #ebf8ff; border: 1px solid #90cdf4; padding: 12px; border-radius: 6px;";
        
        // Solo mostramos el botón de eliminar si el empleado está en la lista activa
        const botonEliminarHTML = sigueActivo 
            ? `<button onclick="eliminarEmpleado('${nombre.replace(/'/g, "\\'")}')" 
                       title="Eliminar empleado"
                       style="position: absolute; top: 8px; right: 8px; background: #feb2b2; color: #9b2c2c; border: none; border-radius: 4px; width: 24px; height: 24px; cursor: pointer; font-weight: bold; line-height: 1;">
                   ✕
               </button>`
            : `<span style="position: absolute; top: 8px; right: 8px; font-size: 0.7rem; background: #cbd5e0; color: #2d3748; padding: 2px 6px; border-radius: 4px;">Inactivo</span>`;

        tarjeta.innerHTML = `
            ${botonEliminarHTML}
            <div style="font-size: 0.9rem; color: #2b6cb0; font-weight: bold; padding-right: 25px;">🧑‍🍳 ${nombre}</div>
            <div style="font-size: 0.8rem; color: #4a5568;">Acumulado a descontar:</div>
            <strong style="font-size: 1.3rem; color: #2c5282;">$${saldosPorNombre[nombre].toFixed(2)}</strong>
        `;
        contenedorSaldos.appendChild(tarjeta);
    });

    dibujarAcumuladosEmpleadosImportados();

    // 2. Dibujar tabla de historial con reseñas
    tbody.innerHTML = "";
    if (historialEmpleados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding: 12px; text-align: center; color: #718096;">No hay consumos de empleados registrados en este mes.</td></tr>`;
    } else {
        [...historialEmpleados].reverse().forEach(reg => {
            const fila = document.createElement('tr');
            fila.style.borderBottom = "1px solid #edf2f7";
            fila.innerHTML = `
                <td style="padding: 8px;">${reg.fechaHora}</td>
                <td style="padding: 8px;"><strong>${reg.empleado}</strong></td>
                <td style="padding: 8px;">${reg.detalleTexto}</td>
                <td style="padding: 8px; color: #744210; background-color: #fffff0;">${reg.resena}</td>
                <td style="padding: 8px;">$${reg.valorNormal.toFixed(2)}</td>
                <td style="padding: 8px;"><strong>$${reg.montoDescontar.toFixed(2)}</strong></td>
            `;
            tbody.appendChild(fila);
        });
    }
}

function dibujarAcumuladosEmpleadosImportados() {
    const contenedor = document.getElementById('resumen-acumulados-empleados-importados');
    if (!contenedor) return;

    contenedor.innerHTML = "";
    const cierres = JSON.parse(localStorage.getItem('TQP_cierres_historicos')) || [];
    const corteRecibido = cierres
        .filter(c => (c.esImportado || (typeof c.fecha === 'string' && c.fecha.endsWith(' (Importado)'))) &&
            (c.incluyeAcumuladosEmpleados === true ||
                (Array.isArray(c.acumuladosEmpleados) && c.acumuladosEmpleados.length > 0)))
        .sort((a, b) => (Number(b.idCorteOrigen || b.id) || 0) - (Number(a.idCorteOrigen || a.id) || 0))[0];

    if (!corteRecibido || corteRecibido.acumuladosEmpleados.length === 0) {
        contenedor.style.display = 'none';
        return;
    }

    contenedor.style.display = 'block';
    const tarjeta = document.createElement('div');
    tarjeta.style.cssText = "background:#f0fff4; border:1px solid #9ae6b4; padding:12px; border-radius:6px; margin-bottom:18px;";

    const titulo = document.createElement('h4');
    titulo.style.margin = '0 0 6px';
    titulo.textContent = '📥 Acumulado recibido del cajero (último corte importado)';
    tarjeta.appendChild(titulo);

    const fecha = document.createElement('p');
    fecha.style.cssText = 'margin:0 0 10px; color:#4a5568; font-size:0.85rem;';
    fecha.textContent = corteRecibido.fecha;
    tarjeta.appendChild(fecha);

    const tabla = document.createElement('table');
    tabla.style.cssText = 'width:100%; border-collapse:collapse; text-align:left; font-size:0.9rem;';
    tabla.innerHTML = '<thead><tr style="background:#edf2f7;"><th style="padding:8px;">Empleado</th><th style="padding:8px; text-align:right;">Acumulado</th></tr></thead>';
    const cuerpo = document.createElement('tbody');

    corteRecibido.acumuladosEmpleados.forEach(reg => {
        const fila = document.createElement('tr');
        fila.style.borderBottom = '1px solid #edf2f7';

        const celdaEmpleado = document.createElement('td');
        celdaEmpleado.style.padding = '8px';
        celdaEmpleado.textContent = reg.empleado || '-';

        const celdaMonto = document.createElement('td');
        celdaMonto.style.cssText = 'padding:8px; text-align:right; font-weight:bold;';
        celdaMonto.textContent = `$${Number(reg.monto || 0).toFixed(2)}`;

        fila.appendChild(celdaEmpleado);
        fila.appendChild(celdaMonto);
        cuerpo.appendChild(fila);
    });

    tabla.appendChild(cuerpo);
    tarjeta.appendChild(tabla);
    contenedor.appendChild(tarjeta);
}

function inicializarModuloEmpleados() {
    const btnAgregarEmp = document.getElementById('btn-agregar-empleado');
    if (btnAgregarEmp) {
        btnAgregarEmp.onclick = function() {
            const nombreInput = document.getElementById('nuevo-nombre-empleado');
            const descInput = document.getElementById('descuento-empleado-pct');
            const nombre = nombreInput.value.trim();
            const descuento = parseFloat(descInput.value) || 0;

            if (!nombre) {
                alert("Escribe el nombre del empleado.");
                return;
            }
            // Evitar duplicados (insensible a mayúsculas/minúsculas)
const yaExiste = listaEmpleados.some(emp => emp.nombre.toLowerCase() === nombre.toLowerCase());
if (yaExiste) {
    alert(`El empleado "${nombre}" ya está registrado en la lista.`);
    return;
}


            listaEmpleados.push({ nombre: nombre, descuento: descuento });
            localStorage.setItem('TQP_lista_empleados', JSON.stringify(listaEmpleados));
            nombreInput.value = "";

            actualizarSelectEmpleados();
            dibujarReporteEmpleados();
            alert(`Empleado "${nombre}" agregado con ${descuento}% de descuento.`);
        };
    }

    const btnRegistrarEmp = document.getElementById('btn-registrar-consumo-empleado')
        || document.getElementById('btn-registrar-consumo-emp');
    if (btnRegistrarEmp) {
        btnRegistrarEmp.onclick = registrarConsumoEmpleado;
    }

    const btnLiquidarMes = document.getElementById('btn-limpiar-mes-empleados')
        || document.getElementById('btn-liquidar-mes-empleados');
    if (btnLiquidarMes) {
        btnLiquidarMes.onclick = function() {
            if (confirm("¿Seguro que ya descontaste estos saldos en planilla y deseas reiniciar el acumulado del mes a $0.00?")) {
                historialEmpleados = [];
                localStorage.setItem('TQP_historial_empleados', JSON.stringify(historialEmpleados));
                dibujarReporteEmpleados();
            }
        };
    }

    actualizarSelectEmpleados();
    dibujarMenuEmpleados();
    dibujarReporteEmpleados();
}
function actualizarSelectConceptosGasto() {
    const selectTipo = document.getElementById('select-tipo-gasto');
    const selectConcepto = document.getElementById('select-concepto-gasto');
    if (!selectTipo || !selectConcepto) return;

    const lista = selectTipo.value === 'fijo' ? catalogoGastosFijos : catalogoGastosImprevistos;
    selectConcepto.innerHTML = "";

    if (lista.length === 0) {
        selectConcepto.innerHTML = `<option value="General">-- Sin conceptos (usa el detalle) --</option>`;
    } else {
        lista.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item;
            opt.textContent = item;
            selectConcepto.appendChild(opt);
        });
    }
}

function dibujarEditorListasGastos() {
    const contFijos = document.getElementById('lista-tags-gastos-fijos');
    const contImprevistos = document.getElementById('lista-tags-gastos-imprevistos');
    if (!contFijos || !contImprevistos) return;

    const esCajero = localStorage.getItem('TQP_device_mode') === 'cajero';

    contFijos.innerHTML = "";
    catalogoGastosFijos.forEach((item, index) => {
        const tag = document.createElement('span');
        tag.style.cssText = "background:#ebf8ff; color:#2b6cb0; border:1px solid #90cdf4; padding:4px 8px; border-radius:12px; font-size:0.8rem; display:inline-flex; align-items:center; gap:6px;";
        // Si es cajero, solo ve el nombre; si es admin, ve también la X para eliminar
        tag.innerHTML = esCajero
            ? `${item}`
            : `${item} <button type="button" onclick="eliminarConceptoCatalogo('fijo', ${index})" style="background:none; border:none; color:#c53030; font-weight:bold; cursor:pointer; padding:0;">×</button>`;
        contFijos.appendChild(tag);
    });

    contImprevistos.innerHTML = "";
    catalogoGastosImprevistos.forEach((item, index) => {
        const tag = document.createElement('span');
        tag.style.cssText = "background:#fffaf0; color:#c05621; border:1px solid #fbd38d; padding:4px 8px; border-radius:12px; font-size:0.8rem; display:inline-flex; align-items:center; gap:6px;";
        tag.innerHTML = `${item} <button type="button" onclick="eliminarConceptoCatalogo('imprevisto', ${index})" style="background:none; border:none; color:#c53030; font-weight:bold; cursor:pointer; padding:0;">×</button>`;
        contImprevistos.appendChild(tag);
    });

    actualizarSelectConceptosGasto();
}

function eliminarConceptoCatalogo(tipo, index) {
    // Seguridad extra: impedir que el cajero borre un gasto fijo
    if (tipo === 'fijo' && localStorage.getItem('TQP_device_mode') === 'cajero') {
        alert("🔒 Solo el Administrador puede modificar los Gastos Fijos.");
        return;
    }

    if (tipo === 'fijo') {
        catalogoGastosFijos.splice(index, 1);
        localStorage.setItem("TQP_catalogo_gastos_fijos", JSON.stringify(catalogoGastosFijos));
    } else {
        catalogoGastosImprevistos.splice(index, 1);
        localStorage.setItem("TQP_catalogo_gastos_imprevistos", JSON.stringify(catalogoGastosImprevistos));
    }
    dibujarEditorListasGastos();
}




function dibujarTablaGastosDia() {
    const tbody = document.getElementById('tabla-gastos-dia');
    if (!tbody) return;

    tbody.innerHTML = "";

    if (gastosCajaDia.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding: 12px; text-align: center; color: #718096;">No se han registrado salidas de efectivo hoy.</td></tr>`;
        return;
    }

    // Ordenar: primero Gastos Fijos, luego Imprevistos, manteniendo el orden cronológico
    const gastosOrdenados = [...gastosCajaDia].sort((a, b) => {
        if (a.tipo === b.tipo) return 0;
        return a.tipo === 'fijo' ? -1 : 1;
    });

    gastosOrdenados.forEach(gasto => {
        const badgeTipo = gasto.tipo === 'fijo'
            ? `<span style="background:#ebf8ff; color:#2b6cb0; padding:3px 7px; border-radius:4px; font-size:0.8rem; font-weight:bold;">📌 Fijo</span>`
            : `<span style="background:#fffaf0; color:#c05621; padding:3px 7px; border-radius:4px; font-size:0.8rem; font-weight:bold;">⚡ Imprevisto</span>`;

        const fila = document.createElement('tr');
        fila.style.borderBottom = "1px solid #fed7d7";
        fila.innerHTML = `
            <td style="padding: 8px;">${gasto.hora}</td>
            <td style="padding: 8px;">${badgeTipo}</td>
            <td style="padding: 8px;"><strong>${gasto.concepto}</strong></td>
            <td style="padding: 8px; color:#4a5568;">${gasto.detalle || '-'}</td>
            <td style="padding: 8px; color:#c53030;"><strong>-$${gasto.monto.toFixed(2)}</strong></td>
            <td style="padding: 8px; text-align: center;">
                <button type="button" onclick="eliminarGastoDia(${gasto.id})" style="background:#e53e3e; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;" title="Eliminar gasto">🗑️</button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

function eliminarGastoDia(idGasto) {
    if (!confirm("¿Eliminar este registro de gasto y devolver el monto al Cash Neto?")) return;
    gastosCajaDia = gastosCajaDia.filter(g => g.id !== idGasto);
    localStorage.setItem("TQP_gastos_dia", JSON.stringify(gastosCajaDia));
    dibujarTablaGastosDia();
    dibujarResumenDia();
}

function dibujarEditorListasGastos() {
    const contFijos = document.getElementById('lista-tags-gastos-fijos');
    const contImprevistos = document.getElementById('lista-tags-gastos-imprevistos');
    if (!contFijos || !contImprevistos) return;

    const esCajero = localStorage.getItem('TQP_device_mode') === 'cajero';

    contFijos.innerHTML = "";
    catalogoGastosFijos.forEach((item, index) => {
        const tag = document.createElement('span');
        tag.style.cssText = "background:#ebf8ff; color:#2b6cb0; border:1px solid #90cdf4; padding:4px 8px; border-radius:12px; font-size:0.8rem; display:inline-flex; align-items:center; gap:6px;";
        // Si es cajero, solo ve el nombre; si es admin, ve también la X para eliminar
        tag.innerHTML = esCajero
            ? `${item}`
            : `${item} <button type="button" onclick="eliminarConceptoCatalogo('fijo', ${index})" style="background:none; border:none; color:#c53030; font-weight:bold; cursor:pointer; padding:0;">×</button>`;
        contFijos.appendChild(tag);
    });

    contImprevistos.innerHTML = "";
    catalogoGastosImprevistos.forEach((item, index) => {
        const tag = document.createElement('span');
        tag.style.cssText = "background:#fffaf0; color:#c05621; border:1px solid #fbd38d; padding:4px 8px; border-radius:12px; font-size:0.8rem; display:inline-flex; align-items:center; gap:6px;";
        tag.innerHTML = `${item} <button type="button" onclick="eliminarConceptoCatalogo('imprevisto', ${index})" style="background:none; border:none; color:#c53030; font-weight:bold; cursor:pointer; padding:0;">×</button>`;
        contImprevistos.appendChild(tag);
    });

    actualizarSelectConceptosGasto();
}

function eliminarConceptoCatalogo(tipo, index) {
    // Seguridad extra: impedir que el cajero borre un gasto fijo
    if (tipo === 'fijo' && localStorage.getItem('TQP_device_mode') === 'cajero') {
        alert("🔒 Solo el Administrador puede modificar los Gastos Fijos.");
        return;
    }

    if (tipo === 'fijo') {
        catalogoGastosFijos.splice(index, 1);
        localStorage.setItem("TQP_catalogo_gastos_fijos", JSON.stringify(catalogoGastosFijos));
    } else {
        catalogoGastosImprevistos.splice(index, 1);
        localStorage.setItem("TQP_catalogo_gastos_imprevistos", JSON.stringify(catalogoGastosImprevistos));
    }
    dibujarEditorListasGastos();
}


let moduloGastosInicializado = false;
function inicializarModuloGastos() {
    if (!moduloGastosInicializado) {
        moduloGastosInicializado = true;

        const btnToggle = document.getElementById('btn-toggle-config-gastos');
        const panelConfig = document.getElementById('panel-config-gastos');
        const selectTipo = document.getElementById('select-tipo-gasto');

        if (btnToggle && panelConfig) {
            btnToggle.addEventListener('click', () => {
                panelConfig.style.display = panelConfig.style.display === 'none' ? 'block' : 'none';
            });
        }

        if (selectTipo) {
            selectTipo.addEventListener('change', actualizarSelectConceptosGasto);
        }

        document.getElementById('btn-add-gasto-fijo')?.addEventListener('click', () => {
            if (localStorage.getItem('TQP_device_mode') === 'cajero') return;
            const input = document.getElementById('input-nuevo-gasto-fijo');
            const val = input.value.trim();
            if (!val) return;
            catalogoGastosFijos.push(val);
            localStorage.setItem("TQP_catalogo_gastos_fijos", JSON.stringify(catalogoGastosFijos));
            input.value = "";
            dibujarEditorListasGastos();
        });

        document.getElementById('btn-add-gasto-imprevisto')?.addEventListener('click', () => {
            const input = document.getElementById('input-nuevo-gasto-imprevisto');
            const val = input.value.trim();
            if (!val) return;
            catalogoGastosImprevistos.push(val);
            localStorage.setItem("TQP_catalogo_gastos_imprevistos", JSON.stringify(catalogoGastosImprevistos));
            input.value = "";
            dibujarEditorListasGastos();
        });

        document.getElementById('btn-registrar-gasto')?.addEventListener('click', () => {
            const tipo = document.getElementById('select-tipo-gasto').value;
            const concepto = document.getElementById('select-concepto-gasto').value;
            const detalle = document.getElementById('input-detalle-gasto').value.trim();
            const monto = parseFloat(document.getElementById('input-monto-gasto').value);

            if (isNaN(monto) || monto <= 0) {
                alert("⚠️ Ingresa un monto válido mayor a $0.00.");
                return;
            }

            const ahora = new Date();
            const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            gastosCajaDia.push({
                id: Date.now(),
                hora,
                tipo,
                concepto,
                detalle,
                monto
            });

            localStorage.setItem("TQP_gastos_dia", JSON.stringify(gastosCajaDia));

            document.getElementById('input-detalle-gasto').value = "";
            document.getElementById('input-monto-gasto').value = "";

            dibujarTablaGastosDia();
            dibujarResumenDia();
        });
    }

    dibujarEditorListasGastos();
    dibujarTablaGastosDia();
}

// Asegura que se inicialice aunque el script cargue arriba o abajo del HTML
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarModuloGastos);
} else {
    inicializarModuloGastos();
}

function reiniciarDiaCompleto() {
    if (!confirm("⚠️ ¿Cerrar el día y reiniciar las ventas y gastos de hoy a $0.00?")) return;
    historialVentasDia = [];
    gastosCajaDia = [];
    localStorage.setItem('TQP_historial_dia', JSON.stringify(historialVentasDia));
    localStorage.setItem('TQP_gastos_dia', JSON.stringify(gastosCajaDia));
    if (typeof dibujarTablaGastosDia === "function") dibujarTablaGastosDia();
    if (typeof dibujarResumenDia === "function") dibujarResumenDia();
    alert("✅ Día cerrado. Resumen y gastos reiniciados a $0.00.");
}

function eliminarEmpleado(nombreEmpleado) {
    // 1. Verificar si tiene consumos pendientes en el mes
    const tieneSaldo = historialEmpleados.some(reg => reg.empleado === nombreEmpleado && reg.montoDescontar > 0);
    
    let mensajeConfirmacion = `¿Seguro que deseas eliminar a "${nombreEmpleado}" de la lista de empleados?`;
    if (tieneSaldo) {
        mensajeConfirmacion = `⚠️ ATENCIÓN: "${nombreEmpleado}" tiene consumos registrados este mes.\n\nSi lo eliminas, ya no podrás agregarle nuevos consumos, pero su historial seguirá visible hasta que liquides el mes.\n\n¿Deseas eliminarlo de todos modos?`;
    }

    if (!confirm(mensajeConfirmacion)) return;

    // 2. Filtrar el arreglo para quitar al empleado seleccionado
    listaEmpleados = listaEmpleados.filter(emp => emp.nombre !== nombreEmpleado);

    // 3. Guardar la nueva lista en localStorage
    localStorage.setItem('TQP_lista_empleados', JSON.stringify(listaEmpleados));

    // 4. Actualizar toda la interfaz (el select y las tarjetas)
    actualizarSelectEmpleados();
    dibujarReporteEmpleados();
}
// Variables de estado en memoria
let claveAdminGuardada = localStorage.getItem('TQP_admin_pin') || null;
let modoDispositivoActual = localStorage.getItem('TQP_device_mode') || 'abierto';

function inicializarControlAcceso() {
    actualizarInterfazControl();
    aplicarPermisosPorRol(modoDispositivoActual);
}

// 1. Qué pasa al presionar el botón grande "Administrador"
function abrirFlujoAdministrador() {
    // CASO A: Es la primera vez (No hay clave guardada aún)
    if (!claveAdminGuardada) {
        crearClaveTresVeces();
    } 
    // CASO B: Ya existe una clave, mostramos el campo para escribirla
    else {
        document.getElementById('btn-abrir-admin').style.display = 'none';
        document.getElementById('caja-login-admin').style.display = 'flex';
        const input = document.getElementById('input-clave-login');
        input.value = '';
        input.focus();
    }
}

// 2. Lógica para pedir y verificar la clave 3 veces
function crearClaveTresVeces() {
    const intento1 = prompt("CONFIGURACIÓN INICIAL (1/3):\nCrea tu nueva clave de Administrador:");
    if (!intento1 || intento1.trim() === "") return; // Canceló

    const intento2 = prompt("VERIFICACIÓN (2/3):\nEscribe nuevamente la misma clave:");
    if (intento1 !== intento2) {
        alert("❌ Error: La segunda clave no coincide con la primera. Inténtalo de nuevo.");
        return;
    }

    const intento3 = prompt("CONFIRMACIÓN FINAL (3/3):\nEscribe por tercera vez la clave para guardarla:");
    if (intento1 !== intento3) {
        alert("❌ Error: La tercera clave no coincide. Por seguridad, no se guardó nada.");
        return;
    }

    // Si las 3 son iguales, guardamos en localStorage
    claveAdminGuardada = intento1.trim();
    localStorage.setItem('TQP_admin_pin', claveAdminGuardada);
    alert("✅ ¡Clave de Administrador guardada con éxito! Ahora elige el modo para este dispositivo.");

    // Mostramos los 3 botones inmediatamente
    mostrarBotonesDeRoles();
}

// 3. Verificar la clave cuando el dispositivo ya estaba configurado
function verificarClaveLogin() {
    const input = document.getElementById('input-clave-login');
    const claveIngresada = input.value.trim();

    if (claveIngresada === claveAdminGuardada) {
        input.value = ''; // Limpiamos el campo por seguridad
        mostrarBotonesDeRoles();
    } else {
        alert("❌ Clave de Administrador incorrecta.");
        input.value = '';
        input.focus();
    }
}

function cancelarLogin() {
    document.getElementById('caja-login-admin').style.display = 'none';
    document.getElementById('btn-abrir-admin').style.display = 'inline-block';
}

// 4. Mostrar los 3 botones (Mesero, Cajero, Administrador)
function mostrarBotonesDeRoles() {
    document.getElementById('zona-input-admin').style.display = 'none';
    document.getElementById('zona-botones-roles').style.display = 'flex';
}

// 5. Qué pasa cuando el dueño presiona Mesero, Cajero o Administrador
function seleccionarRolDispositivo(rolElegido) {
    modoDispositivoActual = rolElegido;
    localStorage.setItem('TQP_device_mode', rolElegido);

    // Ocultamos los 3 botones y volvemos a dejar solo el botón/campo de Administrador
    document.getElementById('zona-botones-roles').style.display = 'none';
    document.getElementById('zona-input-admin').style.display = 'flex';
    document.getElementById('caja-login-admin').style.display = 'none';
    document.getElementById('btn-abrir-admin').style.display = 'inline-block';

    actualizarInterfazControl();
    aplicarPermisosPorRol(rolElegido);
    
    // Aquí más adelante conectaremos las funciones de bloqueo de cada rol
    console.log("El dispositivo cambió al modo:", rolElegido);
}

// 6. Actualiza el texto visual del estado actual
function actualizarInterfazControl() {
    const etiqueta = document.getElementById('etiqueta-modo-actual');
    if (!etiqueta) return;

    const nombresBonitos = {
        'abierto': 'Sin configurar (Todo Abierto)',
        'mesero': '🍽️ Modo Mesero',
        'cajero': '💵 Modo Cajero',
        'admin': '👑 Modo Administrador'
    };

    etiqueta.textContent = nombresBonitos[modoDispositivoActual] || modoDispositivoActual;
}

function aplicarPermisosPorRol(rol) {
    const btnGenerarQR = document.getElementById('btn-generar-qr-mesero');
    const btnEscanearQR = document.getElementById('btn-escanear-qr-cajero');
    const btnLiberarMesaMesero = document.getElementById('btn-liberar-mesa-mesero');
    const contInputGastoFijo = document.getElementById('cont-input-gasto-fijo');
    
    // 1. Elementos de la pantalla (con tus IDs reales)
    const panelConfig = document.getElementById('panel-configuracion');
    const tabEmpleados = document.getElementById('tab-btn-empleados');
    const zonaCobroTips = document.getElementById('zona-cobro-y-tips');
    const seccionGastos = document.getElementById('seccion-gastos-caja');
    const btnConfigGastos = document.getElementById('btn-toggle-config-gastos');
    const seccionResumenDia = document.getElementById('seccion-resumen-dia');
    
    // Botones del cierre en 3 pasos
    const btnAutorizarCierre = document.getElementById('btn-autorizar-cierre');
    const btnSalvarDia = document.getElementById('btn-salvar-dia');
    const btnLimpiarDia = document.getElementById('btn-limpiar-dia');
    
    const btnLiquidarMes = document.getElementById('btn-limpiar-mes-empleados') || document.getElementById('btn-liquidar-mes-empleados');
    const btnCobrarMesa = document.getElementById('btn-cobrar-mesa') || document.getElementById('btn-imprimir-recibo');
    const tabCierres = document.getElementById('tab-btn-cierres');

    if (rol === 'mesero') {
        // 🍽️ MODO MESERO: Solo ve las mesas, toma pedidos y ve el total de pre-cuenta
        if (panelConfig) panelConfig.style.display = 'none';
        if (tabEmpleados) tabEmpleados.style.display = 'none';
        if (tabCierres) tabCierres.style.display = 'none';
        if (zonaCobroTips) zonaCobroTips.style.display = 'block';
        if (btnCobrarMesa) btnCobrarMesa.style.display = 'none';
        if (seccionGastos) seccionGastos.style.display = 'none';
        if (seccionResumenDia) seccionResumenDia.style.display = 'none';
        if (btnGenerarQR) btnGenerarQR.style.display = 'inline-block';
        if (btnEscanearQR) btnEscanearQR.style.display = 'none';
        if (btnLiberarMesaMesero) btnLiberarMesaMesero.style.display = mesaSeleccionada ? 'inline-block' : 'none';
        
        cambiarPestana('mesas');

    } else if (rol === 'cajero') {
        // 💵 MODO CAJERO: Cobra mesas, pone tips, registra gastos, consumo empleados y cierra día con su PIN
        if (panelConfig) panelConfig.style.display = 'none';
        if (tabEmpleados) tabEmpleados.style.display = 'inline-block';
        if (tabCierres) tabCierres.style.display = 'inline-block'; // <-- Visible para cajero
        if (zonaCobroTips) zonaCobroTips.style.display = 'block';
        if (btnCobrarMesa) btnCobrarMesa.style.display = 'inline-block';
        if (seccionGastos) seccionGastos.style.display = 'inline-block';
        if (contInputGastoFijo) contInputGastoFijo.style.display = 'none';
        
        // Los 3 botones de cierre visibles (inician bloqueados los pasos 2 y 3)
        if (btnAutorizarCierre) btnAutorizarCierre.style.display = 'inline-block';
        if (btnSalvarDia) btnSalvarDia.style.display = 'inline-block';
        if (btnLimpiarDia) btnLimpiarDia.style.display = 'inline-block';
        if (typeof actualizarEstadoBotonesCierre === 'function') actualizarEstadoBotonesCierre();

        dibujarEditorListasGastos();

        if (btnConfigGastos) btnConfigGastos.style.display = 'block'; 
        if (seccionResumenDia) seccionResumenDia.style.display = 'block';
        if (btnLiquidarMes) btnLiquidarMes.style.display = 'none';
        if (btnGenerarQR) btnGenerarQR.style.display = 'none';
        if (btnEscanearQR) btnEscanearQR.style.display = 'inline-block';
        if (btnLiberarMesaMesero) btnLiberarMesaMesero.style.display = 'none';

    } else {
        // 👑 MODO ADMINISTRADOR (O SIN CONFIGURAR): Todo 100% visible
        if (panelConfig) panelConfig.style.display = 'block';
        if (typeof actualizarVistaPinCajero === 'function') actualizarVistaPinCajero(); // <-- Muestra estado del PIN cajero
        if (tabEmpleados) tabEmpleados.style.display = 'inline-block';
        if (tabCierres) tabCierres.style.display = 'inline-block';
        if (zonaCobroTips) zonaCobroTips.style.display = 'block';
        if (btnCobrarMesa) btnCobrarMesa.style.display = 'inline-block';
        if (seccionGastos) seccionGastos.style.display = 'block';
        if (btnConfigGastos) btnConfigGastos.style.display = 'inline-block';
        if (contInputGastoFijo) contInputGastoFijo.style.display = 'flex';
        
        if (seccionResumenDia) seccionResumenDia.style.display = 'block';
        
        // Los 3 botones de cierre visibles (inician bloqueados los pasos 2 y 3)
        if (btnAutorizarCierre) btnAutorizarCierre.style.display = 'inline-block';
        if (btnSalvarDia) btnSalvarDia.style.display = 'inline-block';
        if (btnLimpiarDia) btnLimpiarDia.style.display = 'inline-block';
        if (typeof actualizarEstadoBotonesCierre === 'function') actualizarEstadoBotonesCierre();

        if (btnLiquidarMes) btnLiquidarMes.style.display = 'inline-block';
        if (btnGenerarQR) btnGenerarQR.style.display = 'inline-block';
        if (btnEscanearQR) btnEscanearQR.style.display = 'inline-block';
        if (btnLiberarMesaMesero) btnLiberarMesaMesero.style.display = 'none';

        dibujarEditorListasGastos();
    }
}

// =========================================================
// COMUNICACIÓN OFFLINE POR QR (MESERO -> CAJERO)
// =========================================================

function abrirQRParaCaja() {
    if (!mesaSeleccionada) {
        alert("⚠️ Selecciona una mesa primero.");
        return;
    }

    // Guardar automáticamente lo que el mesero tenga escrito antes de generar el QR
    const menuActual = JSON.parse(localStorage.getItem('TQP_menu_productos')) || menuProductos || [];
    let cantidades = [];
    menuActual.forEach((_, index) => {
        const inputCant = document.getElementById(`cant-${index}`);
        cantidades.push(inputCant ? parseInt(inputCant.value) || 0 : 0);
    });

    if (!cantidades.some(c => c > 0)) {
        alert("⚠️ Esta mesa no tiene platillos anotados.");
        return;
    }

    const resumen = actualizarResumenCuenta();
    const radioPago = document.querySelector('input[name="metodo-pago"]:checked');
    const radioPropina = document.querySelector('input[name="metodo-propina"]:checked');
    const inputPers = document.getElementById('input-propina-personalizada');

    // Empaquetamos los datos con claves cortas para que el QR sea fácil de leer
    const paqueteQR = {
        m: mesaSeleccionada,
        c: cantidades,
        tp: resumen.tipoPropina,
        pp: inputPers ? parseFloat(inputPers.value) || 0 : 0,
        mp: radioPago ? radioPago.value : "Cash",
        mpTip: radioPropina ? radioPropina.value : "Igual"
    };

    const textoQR = JSON.stringify(paqueteQR);
    const contenedor = document.getElementById('contenedor-canvas-qr');
    contenedor.innerHTML = "";

    // Dibujar QR usando matriz SVG nativa (0 librerías externas)
    const svgQR = generarSVGQRSimple(textoQR);
    contenedor.appendChild(svgQR);

    document.getElementById('titulo-modal-qr-mesero').innerText = `📲 Cuenta Mesa ${mesaSeleccionada}`;
    document.getElementById('resumen-modal-qr-mesero').innerText = `Total: $${resumen.totalFinal.toFixed(2)} (${paqueteQR.mp})`;
    document.getElementById('modal-qr-mesero').style.display = 'flex';
}

function cerrarModalQRMesero() {
    document.getElementById('modal-qr-mesero').style.display = 'none';
}

let streamCamaraQR = null;
let intervaloEscaneoQR = null;

async function abrirEscanerQRCajero() {
    const modal = document.getElementById('modal-escaner-cajero');
    const video = document.getElementById('video-lector-qr');
    const estado = document.getElementById('estado-escaner-qr');

    if (!('BarcodeDetector' in window)) {
        alert("⚠️ Tu navegador actual no soporta el escáner nativo. Usa Google Chrome o Microsoft Edge actualizado.");
        return;
    }

    modal.style.display = 'flex';
    estado.innerText = "Abriendo cámara...";

    try {
        streamCamaraQR = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        video.srcObject = streamCamaraQR;
        estado.innerText = "Buscando código QR de la mesa...";

        const detector = new BarcodeDetector({ formats: ['qr_code'] });

        intervaloEscaneoQR = setInterval(async () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                try {
                    const codigos = await detector.detect(video);
                    if (codigos.length > 0) {
                        const datosLeidos = codigos[0].rawValue;
                        procesarDatosQREnCaja(datosLeidos);
                    }
                } catch (e) {}
            }
        }, 350);

    } catch (err) {
        estado.innerText = "❌ No se pudo acceder a la cámara. Revisa los permisos del navegador.";
    }
}

function cerrarEscanerQRCajero() {
    if (intervaloEscaneoQR) clearInterval(intervaloEscaneoQR);
    if (streamCamaraQR) {
        streamCamaraQR.getTracks().forEach(track => track.stop());
        streamCamaraQR = null;
    }
    document.getElementById('modal-escaner-cajero').style.display = 'none';
}

function procesarDatosQREnCaja(rawText) {
    try {
        const data = JSON.parse(rawText);
        if (!data.m || !Array.isArray(data.c)) return;

        cerrarEscanerQRCajero();

        // 1. Cargar cantidades y propina en la mesa recibida
        mesaSeleccionada = data.m;
        pedidosPorMesa[mesaSeleccionada] = data.c;
        propinasPorMesa[mesaSeleccionada] = {
            tipo: data.tp || "sin",
            montoPersonalizado: data.pp || 0
        };

        const mesaEnLista = listaMesas.find(m => m.id == mesaSeleccionada);
        if (mesaEnLista) {
            mesaEnLista.estado = "ocupada";
            localStorage.setItem("TQP_lista_mesas", JSON.stringify(listaMesas));
        }

        localStorage.setItem('TQP_pedidos_mesas', JSON.stringify(pedidosPorMesa));
        localStorage.setItem('TQP_propinas_mesas', JSON.stringify(propinasPorMesa));

        // 2. Actualizar interfaz del cajero y marcar métodos de pago elegidos por el cliente
        dibujarMesasEnPantalla();
        generarFormularioPedido(mesaSeleccionada);

        const radioPago = document.querySelector(`input[name="metodo-pago"][value="${data.mp}"]`);
        if (radioPago) radioPago.checked = true;

        const radioPropina = document.querySelector(`input[name="metodo-propina"][value="${data.mpTip}"]`);
        if (radioPropina) radioPropina.checked = true;

        actualizarResumenCuenta();
        alert(`✅ ¡Cuenta de la Mesa ${mesaSeleccionada} cargada con éxito!`);

    } catch (e) {
        console.warn("QR no válido para TQP-System", e);
    }
}

// =========================================================
// =========================================================
// SISTEMA ÓPTICO DE COLORES TQP + CÓDIGO CORTO (100% OFFLINE)
// =========================================================

// Alfabeto de 16 símbolos (4 bits cada uno -> 2 franjas de 4 colores)
const TQP_ALFABETO = "0123456789ABCDEF";
// 4 colores puros de alto contraste para lectura óptica en cámara:
// 0 = Negro (#000000), 1 = Rojo (#FF0000), 2 = Verde (#00CC00), 3 = Azul (#0044FF)
const TQP_PALETA_HEX = ["#000000", "#FF0000", "#00CC00", "#0044FF"];

function empaquetarCuentaCompacta() {
    const menuActual = JSON.parse(localStorage.getItem('TQP_menu_productos')) || menuProductos || [];
    let cantidades = [];
    menuActual.forEach((_, index) => {
        const inputCant = document.getElementById(`cant-${index}`);
        cantidades.push(inputCant ? parseInt(inputCant.value) || 0 : 0);
    });

    if (!cantidades.some(c => c > 0)) return null;

    const resumen = actualizarResumenCuenta();
    const radioPago = document.querySelector('input[name="metodo-pago"]:checked');
    const radioPropina = document.querySelector('input[name="metodo-propina"]:checked');
    const inputPers = document.getElementById('input-propina-personalizada');

    // Códigos cortos de 1 letra para reducir tamaño:
    // Tipo propina: N = sin, S = sugerida, P = personalizada
    const mapTip = { "sin": "N", "5": "S", "personalizada": "P" };
    const codTip = mapTip[resumen.tipoPropina] || "N";
    const montoPers = inputPers ? Math.round((parseFloat(inputPers.value) || 0) * 100) : 0; // en centavos

    // Método pago: C = Cash, T = Tarjeta, R = Transferencia, I = Igual
    const mapPago = { "Cash": "C", "Tarjeta": "T", "Transferencia": "R", "Igual": "I" };
    const codMP = mapPago[radioPago ? radioPago.value : "Cash"] || "C";
    const codMPTip = mapPago[radioPropina ? radioPropina.value : "Igual"] || "I";

    // Formato compacto: M<mesa>-<cantidades separadas por .>-<codTip><centavos>-<codMP><codMPTip>
    // Ejemplo: M3-2.0.1.0-S0-CI
    const identificadorMesa = mesaSeleccionada === "LLEVAR" ? "MLLEVAR" : `M${mesaSeleccionada}`;
    const cadena = `${identificadorMesa}-${cantidades.join('.')}-${codTip}${montoPers}-${codMP}${codMPTip}`;
    return { cadena, resumen, metodoPago: radioPago ? radioPago.value : "Cash" };
}

function textoAHex(str) {
    let hex = "";
    for (let i = 0; i < str.length; i++) {
        hex += str.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0');
    }
    // Checksum simple de 2 dígitos hex para evitar lecturas erróneas
    let suma = 0;
    for (let i = 0; i < str.length; i++) suma = (suma + str.charCodeAt(i)) & 0xFF;
    hex += suma.toString(16).toUpperCase().padStart(2, '0');
    return hex;
}

function hexATexto(hex) {
    if (!hex || hex.length < 4 || hex.length % 2 !== 0) return null;
    const datosHex = hex.slice(0, -2);
    const checkRecibido = parseInt(hex.slice(-2), 16);
    let str = "";
    let suma = 0;
    for (let i = 0; i < datosHex.length; i += 2) {
        const code = parseInt(datosHex.substr(i, 2), 16);
        if (isNaN(code)) return null;
        str += String.fromCharCode(code);
        suma = (suma + code) & 0xFF;
    }
    return (suma === checkRecibido) ? str : null;
}

function dibujarBandaOpticaTQP(cadena) {
    const hex = textoAHex(cadena);
    // Convertir cada dígito hex (0-15) en 2 símbolos base-4 (0, 1, 2, 3)
    let simbolos = [];
    for (let i = 0; i < hex.length; i++) {
        const val = parseInt(hex[i], 16);
        simbolos.push((val >> 2) & 3);
        simbolos.push(val & 3);
    }

    const anchoBarra = 6;
    const altoBarra = 90;
    const margen = 16;
    // Estructura: [Inicio: Blanco-Negro-Blanco] + [Datos] + [Fin: Blanco-Negro-Blanco]
    const totalFranjas = 3 + simbolos.length + 3;
    const canvas = document.createElement('canvas');
    canvas.width = (totalFranjas * anchoBarra) + (margen * 2);
    canvas.height = altoBarra + (margen * 2);
    canvas.style.maxWidth = "100%";
    canvas.style.borderRadius = "6px";

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x = margen;
    // Marca de inicio: Blanco, Negro, Blanco
    const marco = ["#FFFFFF", "#000000", "#FFFFFF"];
    marco.forEach(c => { ctx.fillStyle = c; ctx.fillRect(x, margen, anchoBarra, altoBarra); x += anchoBarra; });

    // Barras de datos en 4 colores
    simbolos.forEach(s => {
        ctx.fillStyle = TQP_PALETA_HEX[s];
        ctx.fillRect(x, margen, anchoBarra, altoBarra);
        x += anchoBarra;
    });

    // Marca de cierre: Blanco, Negro, Blanco
    marco.forEach(c => { ctx.fillStyle = c; ctx.fillRect(x, margen, anchoBarra, altoBarra); x += anchoBarra; });

    return canvas;
}

function abrirQRParaCaja() {
    if (!mesaSeleccionada) {
        alert("⚠️ Selecciona una mesa primero.");
        return;
    }

    const paquete = empaquetarCuentaCompacta();
    if (!paquete) {
        alert("⚠️ Esta mesa no tiene platillos anotados.");
        return;
    }

    const contenedor = document.getElementById('contenedor-canvas-qr');
    contenedor.innerHTML = "";
    contenedor.style.flexDirection = "column";
    contenedor.style.alignItems = "center";

    const canvasOptico = dibujarBandaOpticaTQP(paquete.cadena);
    contenedor.appendChild(canvasOptico);

    // Mostrar también el código corto debajo como respaldo instantáneo
    const badgeCodigo = document.createElement('div');
    badgeCodigo.style.cssText = "margin-top:10px; background:#edf2f7; padding:6px 12px; border-radius:6px; font-family:monospace; font-size:1rem; font-weight:bold; color:#2d3748; letter-spacing:1px;";
    badgeCodigo.innerText = paquete.cadena;
    contenedor.appendChild(badgeCodigo);

    document.getElementById('titulo-modal-qr-mesero').innerText = `📲 Cuenta Mesa ${mesaSeleccionada}`;
    document.getElementById('resumen-modal-qr-mesero').innerText = `Total: $${paquete.resumen.totalFinal.toFixed(2)} (${paquete.metodoPago})`;
    document.getElementById('modal-qr-mesero').style.display = 'flex';
}

function cerrarModalQRMesero() {
    document.getElementById('modal-qr-mesero').style.display = 'none';
}

// =========================================================
// LECTOR ÓPTICO DE CÁMARA + CÓDIGO CORTO EN CAJA
// =========================================================

function clasificarPixelColor(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    // Blanco (fondo/separador)
    if (r > 175 && g > 175 && b > 175 && (max - min) < 55) return "W";
    // Negro (0)
    if (max < 85 && (max - min) < 50) return 0;
    // Rojo (1)
    if (r > g + 45 && r > b + 45) return 1;
    // Verde (2)
    if (g > r + 35 && g > b + 35) return 2;
    // Azul (3)
    if (b > r + 45 && b > g + 35) return 3;
    return null;
}

async function abrirEscanerQRCajero() {
    const modal = document.getElementById('modal-escaner-cajero');
    const video = document.getElementById('video-lector-qr');
    const estado = document.getElementById('estado-escaner-qr');

    modal.style.display = 'flex';
    estado.innerText = "Abriendo cámara...";

    try {
        streamCamaraQR = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        video.srcObject = streamCamaraQR;
        await video.play();
        estado.innerText = "Alinea la banda de colores en la línea amarilla...";

        const canvasTemp = document.createElement('canvas');
        const ctxTemp = canvasTemp.getContext('2d', { willReadFrequently: true });

        intervaloEscaneoQR = setInterval(() => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvasTemp.width = video.videoWidth;
                canvasTemp.height = video.videoHeight;
                ctxTemp.drawImage(video, 0, 0, canvasTemp.width, canvasTemp.height);

                const yCentro = Math.floor(canvasTemp.height / 2);
                const filaPixeles = ctxTemp.getImageData(0, yCentro, canvasTemp.width, 1).data;

                // Agrupar transiciones continuas de color en la línea central
                let bloques = [];
                let actual = null, conteo = 0;
                for (let x = 0; x < canvasTemp.width; x++) {
                    const idx = x * 4;
                    const clase = clasificarPixelColor(filaPixeles[idx], filaPixeles[idx + 1], filaPixeles[idx + 2]);
                    if (clase === actual) {
                        conteo++;
                    } else {
                        if (actual !== null && conteo >= 2) bloques.push({ c: actual, len: conteo });
                        actual = clase;
                        conteo = 1;
                    }
                }
                if (actual !== null && conteo >= 2) bloques.push({ c: actual, len: conteo });

                // Buscar patrón de inicio [W, 0, W] y cierre [W, 0, W]
                for (let i = 0; i < bloques.length - 6; i++) {
                    if (bloques[i].c === "W" && bloques[i + 1].c === 0 && bloques[i + 2].c === "W") {
                        const anchoRef = bloques[i + 1].len;
                        let simbolos = [];
                        for (let j = i + 3; j < bloques.length - 2; j++) {
                            if (bloques[j].c === "W" && bloques[j + 1].c === 0 && bloques[j + 2].c === "W") {
                                // Intentar decodificar símbolos recopilados
                                if (simbolos.length >= 8 && simbolos.length % 2 === 0) {
                                    let hex = "";
                                    for (let k = 0; k < simbolos.length; k += 2) {
                                        hex += ((simbolos[k] << 2) | simbolos[k + 1]).toString(16).toUpperCase();
                                    }
                                    const textoValido = hexATexto(hex);
                                    if (textoValido && textoValido.startsWith("M")) {
aplicarCuentaCompactaEnCaja(textoValido);
return;
}
}
break;
}
if (typeof bloques[j].c === "number") {
const repeticiones = Math.max(1, Math.round(bloques[j].len / anchoRef));
for (let r = 0; r < repeticiones; r++) simbolos.push(bloques[j].c);
}
}
}
}
}
}, 200);
} catch (err) {
estado.innerText = "⚠️ Cámara no disponible. Usa el código corto de abajo.";
}
}
function cerrarEscanerQRCajero() {
if (intervaloEscaneoQR) clearInterval(intervaloEscaneoQR);
if (streamCamaraQR) {
streamCamaraQR.getTracks().forEach(track => track.stop());
streamCamaraQR = null;
}
document.getElementById('modal-escaner-cajero').style.display = 'none';
}
function cargarDesdeCodigoCorto() {
const input = document.getElementById('input-codigo-corto-caja');
if (!input) return;
const codigo = input.value.trim().toUpperCase();
if (!codigo) return;
if (!aplicarCuentaCompactaEnCaja(codigo)) {
alert("❌ Código inválido. Verifica que esté escrito igual (ej: M3-2.0.1-S0-CI).");
} else {
input.value = "";
}
}
function aplicarCuentaCompactaEnCaja(cadena) {
try {
const partes = cadena.trim().toUpperCase().split('-');
const esParaLlevar = partes[0] === "MLLEVAR";
if (
    partes.length !== 4 ||
    (!esParaLlevar && !/^M\d+$/.test(partes[0])) ||
    !/^\d+(?:\.\d+)*$/.test(partes[1]) ||
    !/^[NSP]\d+$/.test(partes[2]) ||
    !/^[CTR][CTRI]$/.test(partes[3])
) return false;

const mesaId = esParaLlevar ? "LLEVAR" : Number(partes[0].slice(1));
const cantidades = partes[1].split('.').map(Number);
if (
    (!esParaLlevar && (!Number.isSafeInteger(mesaId) || mesaId < 1)) ||
    cantidades.some(c => !Number.isSafeInteger(c) || c < 0)
) return false;

const mapaPropina = { "N": "sin", "S": "5", "P": "personalizada" };
const tipoPropina = mapaPropina[partes[2][0]];
const centavosPropina = Number(partes[2].slice(1));
if (!Number.isSafeInteger(centavosPropina)) return false;
const montoPersonalizado = centavosPropina / 100;
const mapaPago = { "C": "Cash", "T": "Tarjeta", "R": "Transferencia", "I": "Igual" };
const metodoPago = mapaPago[partes[3][0]];
const metodoPropina = mapaPago[partes[3][1]];
const mesaEnLista = listaMesas.find(m => m.id === mesaId);
if (!mesaEnLista) return false;

cerrarEscanerQRCajero();
mesaSeleccionada = mesaId;
pedidosPorMesa[mesaSeleccionada] = cantidades;
propinasPorMesa[mesaSeleccionada] = { tipo: tipoPropina, montoPersonalizado };
mesaEnLista.estado = "ocupada";
localStorage.setItem("TQP_lista_mesas", JSON.stringify(listaMesas));
localStorage.setItem('TQP_pedidos_mesas', JSON.stringify(pedidosPorMesa));
localStorage.setItem('TQP_propinas_mesas', JSON.stringify(propinasPorMesa));
dibujarMesasEnPantalla();
generarFormularioPedido(mesaSeleccionada);
const radioPago = document.querySelector(`input[name="metodo-pago"][value="${metodoPago}"]`);
if (radioPago) radioPago.checked = true;
const radioPropina = document.querySelector(`input[name="metodo-propina"][value="${metodoPropina}"]`);
if (radioPropina) radioPropina.checked = true;
actualizarResumenCuenta();
const nombreMesa = mesaSeleccionada === "LLEVAR" ? "🛍️ Para Llevar" : `Mesa ${mesaSeleccionada}`;
alert(`✅ ¡Cuenta de ${nombreMesa} cargada con éxito!`);
return true;
} catch (e) {
console.error("No se pudo aplicar la cuenta del código corto.", e);
return false;
}
}
// Estado temporal en memoria de la sesión actual
let cierreAutorizado = false;
let diaYaSalvado = false;

// Función auxiliar para actualizar el aspecto visual de los 3 botones
function actualizarEstadoBotonesCierre() {
    const btnAutorizar = document.getElementById('btn-autorizar-cierre');
    const btnSalvar = document.getElementById('btn-salvar-dia');
    const btnReiniciar = document.getElementById('btn-limpiar-dia');

    if (!btnAutorizar || !btnSalvar || !btnReiniciar) return;

    // Paso 1: Autorizar
    if (cierreAutorizado) {
        btnAutorizar.textContent = '🔓 Autorizado';
        btnAutorizar.style.backgroundColor = '#2b6cb0';
    } else {
        btnAutorizar.textContent = '🔐 1. Autorizar Cierre';
        btnAutorizar.style.backgroundColor = '#3182ce';
    }

    // Paso 2: Salvar Día (solo activo si está autorizado y aún no se ha salvado)
    if (cierreAutorizado && !diaYaSalvado) {
        btnSalvar.disabled = false;
        btnSalvar.style.backgroundColor = '#38a169'; // Verde activo
        btnSalvar.style.cursor = 'pointer';
        btnSalvar.style.opacity = '1';
    } else {
        btnSalvar.disabled = true;
        btnSalvar.style.backgroundColor = diaYaSalvado ? '#2f855a' : '#a0aec0';
        btnSalvar.style.cursor = 'not-allowed';
        btnSalvar.style.opacity = diaYaSalvado ? '0.9' : '0.7';
        if (diaYaSalvado) btnSalvar.textContent = '✅ Día Salvado';
        else btnSalvar.textContent = '💾 2. Salvar Día';
    }

    // Paso 3: Reiniciar Día (solo activo si ya fue salvado)
    if (cierreAutorizado && diaYaSalvado) {
        btnReiniciar.disabled = false;
        btnReiniciar.style.backgroundColor = '#e53e3e'; // Rojo activo
        btnReiniciar.style.cursor = 'pointer';
        btnReiniciar.style.opacity = '1';
    } else {
        btnReiniciar.disabled = true;
        btnReiniciar.style.backgroundColor = '#a0aec0';
        btnReiniciar.style.cursor = 'not-allowed';
        btnReiniciar.style.opacity = '0.7';
    }
}

function autorizarCierreDia() {
    const rolActual = localStorage.getItem('TQP_device_mode') || 'abierto';
    const pinAdmin = localStorage.getItem('TQP_admin_pin') || '1234';
    const pinCajero = localStorage.getItem('TQP_cajero_pin') || '0000';

    if (rolActual === 'cajero') {
        const pinIngresado = prompt('🔐 Ingresa tu PIN de Cajero para habilitar el cierre:');
        if (pinIngresado === null) return;

        // En modo cajero SOLO funciona el PIN de cajero
        if (pinIngresado.trim() !== pinCajero) {
            alert('❌ PIN de Cajero incorrecto. Solicítalo al Administrador.');
            return;
        }
    } else {
        const pinIngresado = prompt('🔐 Ingresa tu PIN de Administrador para habilitar el cierre:');
        if (pinIngresado === null) return;

        // En modo admin/abierto SOLO funciona el PIN de administrador
        if (pinIngresado.trim() !== pinAdmin) {
            alert('❌ PIN de Administrador incorrecto.');
            return;
        }
    }

    cierreAutorizado = true;
    actualizarEstadoBotonesCierre();
}


// PASO 2: Salvar la foto exacta del Resumen del Día en la pestaña Historial Cierres
function salvarResumenDia() {
    if (!cierreAutorizado) return;

    const historial = JSON.parse(localStorage.getItem('TQP_historial_dia')) || [];
    const gastos = JSON.parse(localStorage.getItem('TQP_gastos_dia')) || [];

    if (historial.length === 0 && gastos.length === 0) {
        alert('ℹ️ No hay movimientos hoy para salvar.');
        return;
    }

    // Capturamos exactamente los 7 valores ya calculados en pantalla
    const snapshotCorte = {
        id: Date.now(),
        fecha: new Date().toLocaleString(),
        rolCierre: localStorage.getItem('TQP_device_mode') || 'abierto',
        totales: {
            cash: document.getElementById('total-dia-cash')?.textContent || '$0.00',
            gastos: document.getElementById('total-dia-gastos')?.textContent || '-$0.00',
            cashNeto: document.getElementById('total-dia-cash-neto')?.textContent || '$0.00',
            tarjeta: document.getElementById('total-dia-tarjeta')?.textContent || '$0.00',
            transferencia: document.getElementById('total-dia-transferencia')?.textContent || '$0.00',
            propinas: document.getElementById('total-dia-propinas')?.textContent || '$0.00',
            general: document.getElementById('total-dia-general')?.textContent || '$0.00'
        },
        ventas: historial,
        gastosDetalle: gastos
    };

    const cierresGuardados = JSON.parse(localStorage.getItem('TQP_cierres_historicos')) || [];
    cierresGuardados.unshift(snapshotCorte);
    localStorage.setItem('TQP_cierres_historicos', JSON.stringify(cierresGuardados));

    diaYaSalvado = true;
    actualizarEstadoBotonesCierre();
    alert('✅ Información del día salvada en la pestaña "Historial Cierres". Ahora ya puedes presionar "3. Reiniciar Día".');
}

// PASO 3: Ejecutar tu función original de reinicio y volver a bloquear todo
function ejecutarReinicioSeguro() {
    if (!cierreAutorizado || !diaYaSalvado) return;

    // Llama a tu función original reiniciarDiaCompleto()
    if (typeof reiniciarDiaCompleto === 'function') {
        reiniciarDiaCompleto();
    }

    // Bloquea nuevamente los botones para el nuevo día
    cierreAutorizado = false;
    diaYaSalvado = false;
    actualizarEstadoBotonesCierre();
}
// Actualizar el texto visual de si existe o no un PIN asignado
function actualizarVistaPinCajero() {
    const estadoDiv = document.getElementById('estado-pin-cajero');
    if (!estadoDiv) return;

    const pinActual = localStorage.getItem('TQP_cajero_pin');
    if (pinActual) {
        estadoDiv.innerHTML = 'Estado: <strong style="color: #2f855a;">✅ PIN Activo (' + '•'.repeat(pinActual.length) + ')</strong>';
    } else {
        estadoDiv.innerHTML = 'Estado: <strong style="color: #c53030;">⚠️ Sin PIN asignado (Cierre de cajero bloqueado)</strong>';
    }
}

// Crear o cambiar el PIN del cajero
function guardarPinCajero() {
    const input = document.getElementById('input-pin-cajero');
    if (!input) return;

    const nuevoPin = input.value.trim();
    if (nuevoPin.length < 4) {
        alert('⚠️ El PIN del cajero debe tener al menos 4 caracteres o números.');
        return;
    }

    localStorage.setItem('TQP_cajero_pin', nuevoPin);
    input.value = '';
    actualizarVistaPinCajero();
    alert('✅ PIN de Cajero guardado correctamente.');
}

// Borrar el PIN del cajero
function borrarPinCajero() {
    if (!localStorage.getItem('TQP_cajero_pin')) {
        alert('ℹ️ No hay ningún PIN de cajero guardado para borrar.');
        return;
    }

    if (!confirm('⚠️ ¿Seguro que deseas borrar el PIN del Cajero? El cajero no podrá cerrar el día hasta que asignes uno nuevo.')) {
        return;
    }

    localStorage.removeItem('TQP_cajero_pin');
    actualizarVistaPinCajero();
    alert('🗑️ PIN de Cajero eliminado.');
}
function dibujarHistorialCierres() {
    const contenedor = document.getElementById('contenedor-cierres-guardados');
    const btnBorrarTodo = document.getElementById('btn-borrar-todo-historial');
    if (!contenedor) return;

    const rolActual = localStorage.getItem('TQP_device_mode') || 'abierto';
    const esAdmin = (rolActual === 'admin' || rolActual === 'abierto');

    // El botón global de borrar solo lo ve el Administrador
    if (btnBorrarTodo) {
        btnBorrarTodo.style.display = esAdmin ? 'inline-block' : 'none';
    }

    const cierres = JSON.parse(localStorage.getItem('TQP_cierres_historicos')) || [];

    if (cierres.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #ffffff; border: 1px dashed #cbd5e0; border-radius: 8px; color: #718096;">
                📭 Aún no hay cierres de día guardados.
            </div>`;
        return;
    }

    contenedor.innerHTML = cierres.map((c, index) => {
        const t = c.totales;
        // Construir filas de detalle si existen ventas guardadas
        const filasVentas = (c.ventas || []).map(v => `
            <tr style="border-bottom: 1px solid #edf2f7;">
                <td style="padding: 6px;">${v.hora || '-'}</td>
                <td style="padding: 6px;">${v.mesa || '-'}</td>
                <td style="padding: 6px;">${v.metodoPago || '-'}</td>
                <td style="padding: 6px;">$${Number(v.consumo || v.subtotal || 0).toFixed(2)}</td>
                <td style="padding: 6px;">$${Number(v.propina || 0).toFixed(2)}</td>
                <td style="padding: 6px; font-weight: bold;">$${Number(v.total || 0).toFixed(2)}</td>
            </tr>
        `).join('');
        const gastosDetalle = c.gastosDetalle || [];
        const filasGastos = gastosDetalle.map(g => `
            <tr style="border-bottom: 1px solid #edf2f7;">
                <td style="padding: 6px;">${escaparHTML(g.concepto || '-')}</td>
                <td style="padding: 6px; text-align: right;">$${Number(g.monto || 0).toFixed(2)}</td>
            </tr>
        `).join('');
        const acumuladosEmpleados = c.acumuladosEmpleados || [];
        const filasAcumuladosEmpleados = acumuladosEmpleados.map(reg => `
            <tr style="border-bottom: 1px solid #edf2f7;">
                <td style="padding: 6px;">${escaparHTML(reg.empleado || '-')}</td>
                <td style="padding: 6px; text-align: right;">$${Number(reg.monto || 0).toFixed(2)}</td>
            </tr>
        `).join('');

        return `
        <div style="margin-bottom: 20px; padding: 20px; background-color: #ffffff; border: 1px solid #cbd5e0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <!-- Cabecera de la tarjeta -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #edf2f7; padding-bottom: 10px;">
                <div>
                    <strong style="font-size: 1.1rem; color: #2d3748;">📅 ${c.fecha}</strong>
                    <span style="margin-left: 8px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; background: #edf2f7; color: #4a5568; padding: 3px 8px; border-radius: 4px;">
                        Cerrado por: ${c.rolCierre}
                    </span>
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button type="button" onclick="generarCodigoParaAdmin(${index})" style="background-color: #2b6cb0; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: bold;">
                        📲 Código WhatsApp Admin
                    </button>
                    ${esAdmin ? `
                    <button type="button" onclick="borrarUnCierre(${index})" style="background-color: #fff5f5; color: #c53030; border: 1px solid #feb2b2; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: bold;">
                        🗑️ Borrar
                    </button>` : ''}
                </div>
            </div>

            <!-- Los 7 cuadros idénticos al Resumen del Día -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 12px;">
                <div style="background: #f0fff4; border: 1px solid #9ae6b4; padding: 10px; border-radius: 6px;">
                    <div style="font-size: 0.8rem; color: #276749;">💵 Cash (Ingresos)</div>
                    <strong style="font-size: 1.15rem; color: #22543d;">${t.cash}</strong>
                </div>
                <div style="background: #fff5f5; border: 1px solid #feb2b2; padding: 10px; border-radius: 6px;">
                    <div style="font-size: 0.8rem; color: #9b2c2c;">💸 Gastos Cash (-)</div>
                    <strong style="font-size: 1.15rem; color: #742a2a;">${t.gastos}</strong>
                </div>
                <div style="background: #c6f6d5; border: 2px solid #38a169; padding: 10px; border-radius: 6px;">
                    <div style="font-size: 0.8rem; color: #22543d; font-weight: bold;">🏦 Cash Neto Gaveta</div>
                    <strong style="font-size: 1.2rem; color: #1c4532;">${t.cashNeto}</strong>
                </div>
                <div style="background: #ebf8ff; border: 1px solid #90cdf4; padding: 10px; border-radius: 6px;">
                    <div style="font-size: 0.8rem; color: #2b6cb0;">💳 Total Tarjeta</div>
                    <strong style="font-size: 1.15rem; color: #2c5282;">${t.tarjeta}</strong>
                </div>
                <div style="background: #faf5ff; border: 1px solid #d6bcfa; padding: 10px; border-radius: 6px;">
                    <div style="font-size: 0.8rem; color: #553c9a;">📲 Transferencia</div>
                    <strong style="font-size: 1.15rem; color: #44337a;">${t.transferencia}</strong>
                </div>
                <div style="background: #fffff0; border: 1px solid #faf089; padding: 10px; border-radius: 6px;">
                    <div style="font-size: 0.8rem; color: #975a16;">⭐ Total Propinas</div>
                    <strong style="font-size: 1.15rem; color: #744210;">${t.propinas}</strong>
                </div>
                <div style="background: #edf2f7; border: 1px solid #cbd5e0; padding: 10px; border-radius: 6px;">
                    <div style="font-size: 0.8rem; color: #2d3748;">💰 Venta Total Día</div>
                    <strong style="font-size: 1.15rem; color: #1a202c;">${t.general}</strong>
                </div>
            </div>

            <!-- Desplegable con el detalle de mesas cobradas ese día -->
            ${filasVentas ? `
            <details style="margin-top: 10px; font-size: 0.9rem;">
                <summary style="cursor: pointer; color: #2b6cb0; font-weight: bold;">📋 Ver detalle de mesas cobradas (${c.ventas.length})</summary>
                <div style="overflow-x: auto; margin-top: 8px;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                        <thead>
                            <tr style="background: #edf2f7;">
                                <th style="padding: 6px;">Hora</th>
                                <th style="padding: 6px;">Mesa</th>
                                <th style="padding: 6px;">Pago</th>
                                <th style="padding: 6px;">Consumo</th>
                                <th style="padding: 6px;">Propina</th>
                                <th style="padding: 6px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>${filasVentas}</tbody>
                    </table>
                </div>
            </details>` : ''}
            ${filasGastos ? `
            <details style="margin-top: 10px; font-size: 0.9rem;">
                <summary style="cursor: pointer; color: #2b6cb0; font-weight: bold;">💸 Ver detalle de gastos (${gastosDetalle.length})</summary>
                <div style="overflow-x: auto; margin-top: 8px;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                        <thead>
                            <tr style="background: #edf2f7;">
                                <th style="padding: 6px;">Concepto</th>
                                <th style="padding: 6px; text-align: right;">Monto</th>
                            </tr>
                        </thead>
                        <tbody>${filasGastos}</tbody>
                    </table>
                </div>
            </details>` : ''}
            ${filasAcumuladosEmpleados ? `
            <details style="margin-top: 10px; font-size: 0.9rem;">
                <summary style="cursor: pointer; color: #2b6cb0; font-weight: bold;">🧑‍🍳 Acumulado del Mes por Empleado (${acumuladosEmpleados.length})</summary>
                <div style="overflow-x: auto; margin-top: 8px;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                        <thead>
                            <tr style="background: #edf2f7;">
                                <th style="padding: 6px;">Empleado</th>
                                <th style="padding: 6px; text-align: right;">Acumulado</th>
                            </tr>
                        </thead>
                        <tbody>${filasAcumuladosEmpleados}</tbody>
                    </table>
                </div>
            </details>` : ''}
        </div>`;
    }).join('');
}

function escaparHTML(valor) {
    return String(valor).replace(/[&<>"']/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caracter]);
}

// Generar código corto del cierre para mandar por WhatsApp al Administrador
function generarCodigoParaAdmin(index) {
    const cierres = JSON.parse(localStorage.getItem('TQP_cierres_historicos')) || [];
    const c = cierres[index];
    if (!c) return;

    const acumuladosPorEmpleado = new Map();
    listaEmpleados.forEach(emp => acumuladosPorEmpleado.set(emp.nombre, 0));
    historialEmpleados.forEach(reg => {
        const montoActual = acumuladosPorEmpleado.get(reg.empleado) || 0;
        acumuladosPorEmpleado.set(reg.empleado, montoActual + (Number(reg.montoDescontar) || 0));
    });

    // Empaquetar resumen ligero en Base64 corto
    const paquete = {
        f: c.fecha,
        r: c.rolCierre,
        t: c.totales,
        g: (c.gastosDetalle || []).map(g => [g.concepto, g.monto]),
        i: c.id,
        e: Array.from(acumuladosPorEmpleado, ([empleado, monto]) => [empleado, monto])
    };
    const codigo = 'TQP-CIERRE-' + btoa(encodeURIComponent(JSON.stringify(paquete)));

    prompt('📲 Copia este código y envíaselo por WhatsApp al Administrador para que lo cargue en su teléfono:', codigo);
}

// Cargar el código enviado por el Cajero en el dispositivo del Administrador
function importarCierrePorCodigo() {
    const entrada = prompt('📥 Pega aquí el código de cierre recibido por WhatsApp:');
    if (!entrada) return;

    try {
        const limpio = entrada.trim().replace('TQP-CIERRE-', '');
        const datos = JSON.parse(decodeURIComponent(atob(limpio)));

        if (!datos.f || !datos.t) throw new Error('Formato inválido');

        const nuevoRegistro = {
            id: Date.now(),
            fecha: datos.f + ' (Importado)',
            rolCierre: datos.r || 'cajero',
            totales: datos.t,
            ventas: [],
            gastosDetalle: (datos.g || []).map(g => ({
                concepto: g[0],
                monto: g[1]
            })),
            esImportado: true,
            idCorteOrigen: datos.i || null,
            incluyeAcumuladosEmpleados: Object.prototype.hasOwnProperty.call(datos, 'e'),
            acumuladosEmpleados: (datos.e || []).map(([empleado, monto]) => ({
                empleado,
                monto: Number(monto) || 0
            }))
        };

        const cierres = JSON.parse(localStorage.getItem('TQP_cierres_historicos')) || [];
        cierres.unshift(nuevoRegistro);
        localStorage.setItem('TQP_cierres_historicos', JSON.stringify(cierres));

        dibujarHistorialCierres();
        dibujarReporteEmpleados();
        alert('✅ Cierre cargado correctamente en tu historial.');
    } catch (e) {
        alert('❌ El código ingresado no es válido. Asegúrate de copiarlo completo.');
    }
}

// Borrar un cierre individual (Solo Admin con PIN)
function borrarUnCierre(index) {
    const pinAdmin = localStorage.getItem('TQP_admin_pin') || '1234';
    const pin = prompt('🔐 Ingresa el PIN de Administrador para borrar este cierre:');
    if (pin === null) return;
    if (pin.trim() !== pinAdmin) {
        alert('❌ PIN incorrecto.');
        return;
    }

    if (!confirm('⚠️ ¿Eliminar permanentemente este registro de cierre?')) return;

    const cierres = JSON.parse(localStorage.getItem('TQP_cierres_historicos')) || [];
    cierres.splice(index, 1);
    localStorage.setItem('TQP_cierres_historicos', JSON.stringify(cierres));
    dibujarHistorialCierres();
}

// Borrar todo el historial (Solo Admin con PIN)
function borrarTodoHistorialCierres() {
    const pinAdmin = localStorage.getItem('TQP_admin_pin') || '1234';
    const pin = prompt('🔐 Ingresa el PIN de Administrador para borrar TODO el historial de cierres:');
    if (pin === null) return;
    if (pin.trim() !== pinAdmin) {
        alert('❌ PIN incorrecto.');
        return;
    }


if (!confirm('⚠️ ¿Estás seguro de borrar TODOS los cierres guardados? Esta acción no se puede deshacer.')) return;
localStorage.setItem('TQP_cierres_historicos', JSON.stringify([]));
dibujarHistorialCierres();
alert('🗑️ Historial de cierres vaciado.');
}

