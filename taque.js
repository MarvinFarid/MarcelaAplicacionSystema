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

    const btnLimpiarDia = document.getElementById('btn-limpiar-dia');
    if (btnLimpiarDia) {
        btnLimpiarDia.onclick = function() {
            if (!confirm("¿Cerrar el día y borrar las ventas y gastos registrados? Las listas editables de gastos se conservarán.")) return;

            historialVentasDia = [];
            gastosCajaDia = [];
            localStorage.setItem('TQP_historial_dia', JSON.stringify(historialVentasDia));
            localStorage.setItem('TQP_gastos_dia', JSON.stringify(gastosCajaDia));

            dibujarResumenDia();
            dibujarTablaGastosDia();
            alert("Día cerrado. Se borraron las ventas y gastos del día; las listas de gastos se conservaron.");
        };
    }

    inicializarModuloGastos();

    // Encendido inicial y restauración de mesas ocupadas guardadas
    inicializarMesas();
    const mesasGuardadas = JSON.parse(localStorage.getItem("TQP_lista_mesas"));
    if (mesasGuardadas && mesasGuardadas.length === listaMesas.length) {
        listaMesas = mesasGuardadas;
    }

    dibujarMesasEnPantalla();
    dibujarEditorMenu();
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
        tituloPedido.innerText = `📌 Pedido para Mesa ${numeroMesa}`;
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
            <div class="fila-formulario-pedido" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #edf2f7;">
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
        
        const radios = document.querySelectorAll('input[name="tipo-propina"]');
        radios.forEach(r => { r.checked = (r.value === propinaGuardada.tipo); });

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

    const confirmar = confirm(
        `Mesa ${mesaSeleccionada}\n\n` +
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

    alert(`¡Mesa ${mesaSeleccionada} cobrada!\nConsumo: ${metodoPago} | Propina: ${metodoPropina}\nTotal: $${resumen.totalFinal.toFixed(2)}`);
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

            const detallePago = (venta.propina > 0 && pagoPropina !== pagoConsumo)
                ? `${pagoConsumo} <br><small style="color:#718096;">(Tip: ${pagoPropina})</small>`
                : pagoConsumo;

            const fila = document.createElement("tr");
            fila.style.borderBottom = "1px solid #edf2f7";
            fila.innerHTML = `
                <td style="padding: 8px;">${venta.hora}</td>
                <td style="padding: 8px;"><strong>Mesa ${venta.mesa}</strong></td>
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
    const btnMesas = document.getElementById('tab-btn-mesas');
    const btnEmpleados = document.getElementById('tab-btn-empleados');

    if (pestana === 'empleados') {
        vistaMesas.style.display = 'none';
        vistaEmpleados.style.display = 'block';
        btnEmpleados.style.backgroundColor = '#ecc94b';
        btnEmpleados.style.color = '#744210';
        btnMesas.style.backgroundColor = '#4a5568';
        btnMesas.style.color = 'white';

        actualizarSelectEmpleados();
        dibujarMenuEmpleados();
        dibujarReporteEmpleados();
    } else {
        vistaMesas.style.display = 'block';
        vistaEmpleados.style.display = 'none';
        btnMesas.style.backgroundColor = '#ecc94b';
        btnMesas.style.color = '#744210';
        btnEmpleados.style.backgroundColor = '#4a5568';
        btnEmpleados.style.color = 'white';
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

    contenedorSaldos.innerHTML = "";
    Object.keys(saldosPorNombre).forEach(nombre => {
        const tarjeta = document.createElement('div');
        tarjeta.style.cssText = "background: #ebf8ff; border: 1px solid #90cdf4; padding: 12px; border-radius: 6px;";
        tarjeta.innerHTML = `
            <div style="font-size: 0.9rem; color: #2b6cb0; font-weight: bold;">🧑‍🍳 ${nombre}</div>
            <div style="font-size: 0.8rem; color: #4a5568;">Acumulado a descontar:</div>
            <strong style="font-size: 1.3rem; color: #2c5282;">$${saldosPorNombre[nombre].toFixed(2)}</strong>
        `;
        contenedorSaldos.appendChild(tarjeta);
    });

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

// Conectar botones de la pestaña de empleados al cargar
document.addEventListener("DOMContentLoaded", () => {
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

            listaEmpleados.push({ nombre: nombre, descuento: descuento });
            localStorage.setItem('TQP_lista_empleados', JSON.stringify(listaEmpleados));
            nombreInput.value = "";

            actualizarSelectEmpleados();
            dibujarReporteEmpleados();
            alert(`Empleado "${nombre}" agregado con ${descuento}% de descuento.`);
        };
    }

const btnRegistrarEmp = document.getElementById('btn-registrar-consumo-emp');
if (btnRegistrarEmp) {
btnRegistrarEmp.onclick = registrarConsumoEmpleado;
}
const btnLiquidarMes = document.getElementById('btn-liquidar-mes-empleados');
if (btnLiquidarMes) {
btnLiquidarMes.onclick = function() {
if (confirm("¿Seguro que ya descontaste estos saldos en planilla y deseas reiniciar el acumulado del mes a $0.00?")) {
historialEmpleados = [];
localStorage.setItem('TQP_historial_empleados', JSON.stringify(historialEmpleados));
dibujarReporteEmpleados();
}
};
}
});
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

    contFijos.innerHTML = "";
    catalogoGastosFijos.forEach((item, index) => {
        const tag = document.createElement('span');
        tag.style.cssText = "background:#ebf8ff; color:#2b6cb0; border:1px solid #90cdf4; padding:4px 8px; border-radius:12px; font-size:0.8rem; display:inline-flex; align-items:center; gap:6px;";
        tag.innerHTML = `${item} <button type="button" onclick="eliminarConceptoCatalogo('fijo', ${index})" style="background:none; border:none; color:#c53030; font-weight:bold; cursor:pointer; padding:0;">×</button>`;
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

function inicializarModuloGastos() {
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

    dibujarEditorListasGastos();
    dibujarTablaGastosDia();
}
