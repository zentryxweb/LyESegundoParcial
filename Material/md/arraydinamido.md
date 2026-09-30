Manual Interactivo JavaScript
Desde la lógica de PSeInt hasta el control de estructuras de datos y patrón CRUD

📘 0. Entorno, Integración HTML y Equivalencias
JavaScript se puede incorporar en una página de dos formas principales: mediante un script interno o vinculando un archivo externo .js. Para desarrollo modular y limpio, se recomienda vincular archivos externos mediante el selector <script src="...">.

💡 Metodología de Ejecución: Se puede escribir el código en un archivo externo como app.js y vincularlo con un documento simple index.html. Para probar fragmentos, también se puede abrir la Consola del navegador (F12) e ingresar el código directamente.
Equivalencias directas: PSeInt ↔ JavaScript
Concepto / Acción	Sintaxis PSeInt	Sintaxis JavaScript
Definir Variable	Definir x Como Entero	let x; o const PI = 3.1416;
Leer Dato	Leer nombre	let nombre = prompt("...");
Mostrar Salida	Escribir "Hola", x	alert("Hola " + x); / console.log(...)
Condicional	Si ... Entonces ... FinSi	if (...) { ... } else { ... }
Bucle mientras	Mientras cond Hacer ... FinMientras	while (cond) { ... }
Bucle repetir	Repetir ... Hasta Que cond	do { ... } while (!cond); (Lógica invertida)
Bucle para	Para i <- 1 Hasta N Con Paso 1	for (let i = 0; i < N; i++)
Funciones	Funcion res <- Sumar(a,b) ... FinFuncion	function sumar(a, b) { return a + b; }
⚠️ Importante sobre prompt(): Todo valor retornado por prompt() se procesa como texto (String). Para hacer operaciones matemáticas es obligatorio convertir el dato mediante Number(), parseInt() o parseFloat().
1. Arreglos Simples, Bucles y Métodos del Array
Un Array permite almacenar varios valores en una misma variable. A diferencia de PSeInt (donde el primer índice suele ser 1), en JS el índice inicial siempre es 0. Se obtiene el tamaño del arreglo con la propiedad .length.

📌 push(valor)
Inserta un elemento al final del arreglo.
📌 pop()
Elimina el último elemento del arreglo.
📌 splice(pos, cant)
Elimina cant elementos desde un índice concreto.
📌 Iteración con for
for (let i = 0; i < arr.length; i++).
⚡ Práctica 1: Lista de Frutas (Array Básico)
Interactúa con un vector básico mediante ventanas de entrada/salida:

1. Ver Lista (READ)
2. Agregar Fruta (CREATE)
3. Eliminar Fruta (DELETE)
📄 Ver Código
let frutas = ["Manzana", "Banana", "Naranja"];

// Recorrer usando ciclo for
function verFrutas() {
  let texto = "LISTA DE FRUTAS:\n\n";
  for (let i = 0; i < frutas.length; i++) {
    texto += (i + 1) + ". " + frutas[i] + "\n";
  }
  alert(texto);
}

// Agregar al final usando push
function agregarFruta() {
  let nueva = prompt("Nombre de la nueva fruta:");
  if (nueva && nueva.trim() !== "") {
    frutas.push(nueva.trim());
    alert("✓ Fruta agregada.");
  }
}

// Eliminar buscando la posición con findIndex y removiendo con splice
function eliminarFruta() {
  let eliminar = prompt("Nombre de la fruta a eliminar:");
  if (!eliminar) return;
  let idx = frutas.findIndex(f => f.toLowerCase() === eliminar.trim().toLowerCase());
  if (idx !== -1) {
    frutas.splice(idx, 1);
    alert("✓ Fruta eliminada.");
  } else {
    alert("❌ No encontrada.");
  }
}
2. Arreglos de Objetos y Patrón CRUD Completo
Cuando requerimos gestionar registros estructurados (por ejemplo: DNI, Nombre y Nota), se combina la estructura de Arreglos con Objetos (equivalente a los Registros/Estructuras en otros lenguajes). Sobre esta estructura aplicamos la arquitectura CRUD (Create, Read, Update, Delete).

Operación CRUD	Descripción teórica	Patrón de Código en JavaScript
C - Create	Verifica que la clave única (DNI) no exista antes de insertar con validación.	alumnos.push({ dni, nombre, nota })
R - Read	Itera sobre la estructura para extraer e informar los campos.	for (let i = 0; i < alumnos.length; i++) { ... }
U - Update	Busca por la clave primaria, solicita el nuevo valor y aplica la modificación.	alumnos[i].nota = nuevaNota
D - Delete	Busca por DNI, solicita confirmación y retira el elemento con splice.	alumnos.splice(i, 1)
⚡ Práctica 2: Sistema CRUD Completo de Alumnos por DNI
Prueba las 4 operaciones esenciales de un sistema de información sobre un arreglo de objetos:

1. Ver Alumnos (READ)
2. Agregar Alumno (CREATE)
3. Modificar Nota (UPDATE)
4. Eliminar Alumno (DELETE)
5. Estadísticas (Promedio/Máx)
📄 Ver Código
// Estructura de datos inicial
let alumnos = [
  { dni: "40111222", nombre: "Ana García", nota: 8 },
  { dni: "40333444", nombre: "Juan Martínez", nota: 6 },
  { dni: "41555666", nombre: "Carlos López", nota: 9 }
];

// READ: Muestra el listado de elementos
function verAlumnos() {
  if (alumnos.length === 0) {
    alert("No hay alumnos registrados.");
    return;
  }
  let listado = "=== ALUMNOS REGISTRADOS ===\n\n";
  for (let i = 0; i < alumnos.length; i++) {
    listado += `${i + 1}. ${alumnos[i].nombre}\n   DNI: ${alumnos[i].dni} | Nota: ${alumnos[i].nota}\n\n`;
  }
  listado += "Total: " + alumnos.length + " alumnos.";
  alert(listado);
}

// CREATE: Validación de duplicados y agregado
function agregarAlumno() {
  let dniNuevo = prompt("DNI del nuevo alumno:");
  if (!dniNuevo) return;
  dniNuevo = dniNuevo.trim();

  // Buscar si el DNI ya existe
  let yaExiste = false;
  for (let i = 0; i < alumnos.length; i++) {
    if (alumnos[i].dni === dniNuevo) {
      yaExiste = true;
      break;
    }
  }

  if (yaExiste) {
    alert("❌ El DNI " + dniNuevo + " ya está registrado.");
    return;
  }

  let nombreNuevo = prompt("Nombre completo:");
  let notaNuevo = Number(prompt("Nota (0-10):"));

  // Bucle de validación
  while (isNaN(notaNuevo) || notaNuevo < 0 || notaNuevo > 10) {
    alert("❌ Nota inválida (debe ser entre 0 y 10).");
    notaNuevo = Number(prompt("Ingresá la nota nuevamente (0-10):"));
  }

  alumnos.push({ dni: dniNuevo, nombre: nombreNuevo.trim(), nota: notaNuevo });
  alert("✓ Alumno " + nombreNuevo + " registrado correctamente.");
}

// UPDATE: Búsqueda y actualización de propiedad
function modificarNota() {
  let dniBuscado = prompt("DNI del alumno a modificar:");
  if (!dniBuscado) return;
  
  let encontrado = false;
  for (let i = 0; i < alumnos.length; i++) {
    if (alumnos[i].dni === dniBuscado.trim()) {
      let nuevaNota = Number(prompt(`Nueva nota para ${alumnos[i].nombre} (actual: ${alumnos[i].nota}):`));
      
      while (isNaN(nuevaNota) || nuevaNota < 0 || nuevaNota > 10) {
        alert("❌ Nota inválida.");
        nuevaNota = Number(prompt("Ingresá una nota válida (0-10):"));
      }
      
      alumnos[i].nota = nuevaNota;
      alert("✓ Nota modificada correctamente.");
      encontrado = true;
      break;
    }
  }

  if (!encontrado) alert("❌ DNI no encontrado.");
}

// DELETE: Búsqueda, confirmación y borrado mediante splice
function eliminarAlumno() {
  let dniEliminar = prompt("DNI del alumno a eliminar:");
  if (!dniEliminar) return;

  let encontrado = false;
  for (let i = 0; i < alumnos.length; i++) {
    if (alumnos[i].dni === dniEliminar.trim()) {
      let confirmar = confirm(`¿Confirmas eliminar a ${alumnos[i].nombre}?`);
      if (confirmar) {
        let borrado = alumnos.splice(i, 1);
        alert(`✓ El alumno ${borrado[0].nombre} fue eliminado.`);
      } else {
        alert("⚠ Acción cancelada.");
      }
      encontrado = true;
      break;
    }
  }

  if (!encontrado) alert("❌ DNI no encontrado.");
}

// CÁLCULOS SOBRE EL ARREGLO
function calcularEstadisticas() {
  if (alumnos.length === 0) {
    alert("No hay registros suficientes.");
    return;
  }
  let suma = 0;
  let notaMaxima = alumnos[0].nota;
  let mejorAlumno = alumnos[0].nombre;

  for (let i = 0; i < alumnos.length; i++) {
    suma += alumnos[i].nota;
    if (alumnos[i].nota > notaMaxima) {
      notaMaxima = alumnos[i].nota;
      mejorAlumno = alumnos[i].nombre;
    }
  }

  let promedio = suma / alumnos.length;
  alert(`ESTADÍSTICAS DEL CURSO:\n\n- Promedio General: ${promedio.toFixed(2)}\n- Nota Más Alta: ${notaMaxima} (${mejorAlumno})`);
}