// Clase Tarea
class Tarea {
    constructor(id, descripcion, prioridad, estado) {
        this.id = id;
        this.descripcion = descripcion;
        this.prioridad = prioridad;
        this.estado = estado; // Puede ser 'pendiente', 'en progreso' o 'completada'
    }
}

// Estructura de Lista Enlazada para gestionar tareas pendientes
class Nodo {
    constructor(tarea) {
        this.tarea = tarea;
        this.siguiente = null;
    }
}

class ListaEnlazada {
    constructor() {
        this.cabeza = null;
    }

    agregar(tarea) {
        const nuevoNodo = new Nodo(tarea);
        if (!this.cabeza) {
            this.cabeza = nuevoNodo;
        } else {
            let actual = this.cabeza;
            while (actual.siguiente) {
                actual = actual.siguiente;
            }
            actual.siguiente = nuevoNodo;
        }
    }

    eliminar(id) {
        if (!this.cabeza) return null;
        if (this.cabeza.tarea.id === id) {
            this.cabeza = this.cabeza.siguiente;
            return;
        }
        let actual = this.cabeza;
        while (actual.siguiente && actual.siguiente.tarea.id !== id) {
            actual = actual.siguiente;
        }
        if (actual.siguiente) {
            actual.siguiente = actual.siguiente.siguiente;
        }
    }

    obtenerPorId(id) {
        let actual = this.cabeza;
        while (actual) {
            if (actual.tarea.id === id) {
                return actual.tarea;
            }
            actual = actual.siguiente;
        }
        return null;
    }

    obtenerTodas() {
        const tareas = [];
        let actual = this.cabeza;
        while (actual) {
            tareas.push(actual.tarea);
            actual = actual.siguiente;
        }
        return tareas;
    }
}

// Cola de tareas en progreso
class Cola {
    constructor() {
        this.elementos = [];
    }

    encolar(tarea) {
        this.elementos.push(tarea);
    }

    desencolar() {
        return this.elementos.shift();
    }

    obtenerPorId(id) {
        return this.elementos.find(t => t.id === id);
    }

    obtenerTodas() {
        return this.elementos;
    }
}

// Pila de tareas completadas
class Pila {
    constructor() {
        this.elementos = [];
    }

    apilar(tarea) {
        this.elementos.push(tarea);
    }

    desapilar() {
        return this.elementos.pop();
    }

    obtenerPorId(id) {
        return this.elementos.find(t => t.id === id);
    }

    obtenerTodas() {
        return this.elementos;
    }
}

// Árbol binario de búsqueda para organizar tareas por prioridad
class NodoArbol {
    constructor(tarea) {
        this.tarea = tarea;
        this.izquierda = null;
        this.derecha = null;
    }
}

class ArbolBinario {
    constructor() {
        this.raiz = null;
    }

    agregar(tarea) {
        const nuevoNodo = new NodoArbol(tarea);
        if (!this.raiz) {
            this.raiz = nuevoNodo;
        } else {
            this._agregarNodo(this.raiz, nuevoNodo);
        }
    }

    _agregarNodo(nodo, nuevoNodo) {
        if (nuevoNodo.tarea.prioridad < nodo.tarea.prioridad) {
            if (!nodo.izquierda) {
                nodo.izquierda = nuevoNodo;
            } else {
                this._agregarNodo(nodo.izquierda, nuevoNodo);
            }
        } else {
            if (!nodo.derecha) {
                nodo.derecha = nuevoNodo;
            } else {
                this._agregarNodo(nodo.derecha, nuevoNodo);
            }
        }
    }

    obtenerEnOrden() {
        const resultado = [];
        this._enOrden(this.raiz, resultado);
        return resultado;
    }

    _enOrden(nodo, resultado) {
        if (nodo) {
            this._enOrden(nodo.izquierda, resultado);
            resultado.push(nodo.tarea);
            this._enOrden(nodo.derecha, resultado);
        }
    }
}

// Grafo simple para representar dependencias entre tareas
class Grafo {
    constructor() {
        this.adyacencias = new Map();
    }

    agregarVertice(tarea) {
        if (!this.adyacencias.has(tarea.id)) {
            this.adyacencias.set(tarea.id, []);
        }
    }

    agregarArista(tarea1, tarea2) {
        if (this.adyacencias.has(tarea1.id) && this.adyacencias.has(tarea2.id)) {
            this.adyacencias.get(tarea1.id).push(tarea2.id);
        }
    }

    obtenerAdyacentes(tarea) {
        return this.adyacencias.get(tarea.id) || [];
    }

    // Algoritmo para detectar ciclos en el grafo (DFS modificado)
    tieneCiclo() {
        const visitados = new Set();
        const enRecorrido = new Set();

        for (let tareaId of this.adyacencias.keys()) {
            if (this._tieneCicloAux(tareaId, visitados, enRecorrido)) {
                return true;
            }
        }
        return false;
    }

    _tieneCicloAux(tareaId, visitados, enRecorrido) {
        if (enRecorrido.has(tareaId)) return true; // Ciclo detectado
        if (visitados.has(tareaId)) return false; // Ya visitado y sin ciclo

        visitados.add(tareaId);
        enRecorrido.add(tareaId);

        const adyacentes = this.adyacencias.get(tareaId);
        for (let adyacente of adyacentes) {
            if (this._tieneCicloAux(adyacente, visitados, enRecorrido)) {
                return true;
            }
        }

        enRecorrido.delete(tareaId); // Eliminar de la lista de recorrido actual
        return false;
    }
}

// Implementación del sistema de gestión de tareas
const listaPendientes = new ListaEnlazada();
const colaEnProgreso = new Cola();
const pilaCompletadas = new Pila();
const arbolPrioridad = new ArbolBinario(); // Cambio: ArbolBinario para organizar por prioridad
const grafoDependencias = new Grafo();

// Funciones para manipular el DOM y responder a eventos
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('taskForm');
    form.addEventListener('submit', agregarTarea);

    const empezarBtn = document.getElementById('empezarBtn');
    empezarBtn.addEventListener('click', empezarTarea);

    const terminarBtn = document.getElementById('terminarBtn');
    terminarBtn.addEventListener('click', terminarTarea);

    const eliminarBtn = document.getElementById('eliminarBtn');
    eliminarBtn.addEventListener('click', eliminarTarea);
});

// Función para agregar una nueva tarea desde el formulario
function agregarTarea(event) {
    event.preventDefault();
    const descripcion = document.getElementById('descripcion').value;
    const prioridad = parseInt(document.getElementById('prioridad').value);

    agregarNuevaTarea(descripcion, prioridad);
    actualizarInterfaz();
    document.getElementById('taskForm').reset();
}

// Función para agregar una nueva tarea al sistema
function agregarNuevaTarea(descripcion, prioridad) {
    const id = Date.now(); // Generar un id único
    const nuevaTarea = new Tarea(id, descripcion, prioridad, 'pendiente');

    // Agregar la tarea a las estructuras correspondientes
    listaPendientes.agregar(nuevaTarea);
    arbolPrioridad.agregar(nuevaTarea); // Cambio: Agregar al árbol binario por prioridad
    grafoDependencias.agregarVertice(nuevaTarea);
}

// Función para iniciar una tarea pendiente si todas sus dependencias están completadas
function empezarTarea() {
    const pendientes = listaPendientes.obtenerTodas();
    for (let tarea of pendientes) {
        const dependencias = grafoDependencias.obtenerAdyacentes(tarea);
        const todasCompletadas = dependencias.every(id => pilaCompletadas.obtenerPorId(id));
        if (todasCompletadas) {
            listaPendientes.eliminar(tarea.id);
            colaEnProgreso.encolar(tarea);
            tarea.estado = 'en progreso';
            break; // Solo se mueve una tarea a la vez
        }
    }
    actualizarInterfaz();
}

// Función para terminar una tarea en progreso
function terminarTarea() {
    const enProgreso = colaEnProgreso.obtenerTodas();
    if (enProgreso.length > 0) {
        const tarea = enProgreso[0];
        colaEnProgreso.desencolar();
        pilaCompletadas.apilar(tarea);
        tarea.estado = 'completada';
    }
    actualizarInterfaz();
}

// Función para eliminar una tarea completada de la pila de tareas completadas
function eliminarTarea() {
    const completadas = pilaCompletadas.obtenerTodas();
    if (completadas.length > 0) {
        const tarea = completadas[0];
        pilaCompletadas.elementos = pilaCompletadas.elementos.filter(t => t.id !== tarea.id);
    }
    actualizarInterfaz();
}

// Función para actualizar la interfaz gráfica con las tareas actuales
function actualizarInterfaz() {
    actualizarLista(listaPendientes.obtenerTodas(), 'pendientes');
    actualizarLista(colaEnProgreso.obtenerTodas(), 'enProgreso');
    actualizarLista(pilaCompletadas.obtenerTodas(), 'completadas');
}

// Función auxiliar para actualizar la lista de tareas en el DOM
function actualizarLista(tareas, listaId) {
    const lista = document.getElementById(listaId);
    lista.innerHTML = '';
    tareas.forEach(tarea => {
        const li = document.createElement('li');
        li.setAttribute('data-id', tarea.id);
        li.textContent = `${tarea.descripcion} - Prioridad: ${tarea.prioridad}`;
        lista.appendChild(li);
    });
}
