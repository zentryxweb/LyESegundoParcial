CRUD COMPLETO POR DNI
Modificar • Eliminar • Agregar
Ejemplos ejecutables con DNI cargados
Datos de ejemplo - Arreglo de alumnos
let alumnos = [
{ dni: "40111222", nombre: "Ana García", nota: 8 },
{ dni: "40333444", nombre: "Juan Martínez", nota: 6 },
{ dni: "41555666", nombre: "Carlos López", nota: 9 },
{ dni: "42777888", nombre: "Marta Rodríguez", nota: 7 },
{ dni: "43999000", nombre: "Pedro Fernández", nota: 5 }
];
MODIFICAR - Cambiar nota de un alumno por DNI
// Ej: Cambiar nota a Ana (DNI 40111222) de 8 a 9
let dniBuscado = "40111222";
let encontrado = false;
for (let i = 0; i < alumnos.length; i++) {
if (alumnos[i].dni === dniBuscado) {
let nombreAnterior = alumnos[i].nombre;
let notaAnterior = alumnos[i].nota;
alumnos[i].nota = 9;  // ← MODIFICAMOS
alert("✓ Nota modificada\n" +
nombreAnterior + ": " + notaAnterior + 
" → " + alumnos[i].nota);
encontrado = true;
break;
}
}
if (!encontrado) {
alert("❌ DNI no encontrado");
}
MODIFICAR - Versión interactiva con validación
let dniBuscado = prompt("DNI a modificar:");
let encontrado = false;
for (let i = 0; i < alumnos.length; i++) {
if (alumnos[i].dni === dniBuscado) {
let nuevaNota = Number(prompt(
"Nueva nota para " + alumnos[i].nombre + 
" (actual: " + alumnos[i].nota + "):"
));
// VALIDAR entre 0 y 10
while (nuevaNota < 0 || nuevaNota > 10) {
alert("❌ Nota inválida (0-10)");
nuevaNota = Number(prompt("Ingresá de nuevo:"));
}
alumnos[i].nota = nuevaNota;
alert("✓ Nota actualizada a: " + nuevaNota);
encontrado = true;
break;
}
}
if (!encontrado) alert("❌ DNI: " + dniBuscado + " no existe");
ELIMINAR - Quitar un alumno del arreglo por DNI
// Ej: Eliminar a Juan Martínez (DNI 40333444)
let dniEliminar = "40333444";
let encontrado = false;
for (let i = 0; i < alumnos.length; i++) {
if (alumnos[i].dni === dniEliminar) {
let nombreEliminado = alumnos[i].nombre;
alumnos.splice(i, 1);  // ← ELIMINAMOS 1 elemento
alert("✓ Alumno eliminado: " + nombreEliminado +
"\nAhora hay " + alumnos.length + " alumnos");
encontrado = true;
break;  // Importante: salir después de splice
}
}
if (!encontrado) {
alert("❌ DNI no encontrado para eliminar");
}
// Resultado: Juan (40333444) ya no está en el arreglo
ELIMINAR - Versión interactiva con confirmación
let dniEliminar = prompt("DNI del alumno a eliminar:");
let encontrado = false;
for (let i = 0; i < alumnos.length; i++) {
if (alumnos[i].dni === dniEliminar) {
let nombre = alumnos[i].nombre;
// Pedir confirmación antes de eliminar
let confirmar = confirm(
"¿Eliminar a " + nombre + "?\n" +
"Esta acción NO se puede deshacer."
);
if (confirmar) {
alumnos.splice(i, 1);
alert("✓ " + nombre + " fue eliminado\n" +
"Alumnos restantes: " + alumnos.length);
} else {
alert("⚠ Eliminación cancelada");
}
encontrado = true;
break;
}
}
if (!encontrado) {
alert("❌ DNI: " + dniEliminar + " no existe");
}
AGREGAR - Insertar un alumno nuevo al arreglo
// Agregar nuevo alumno: Sofia Ruiz (DNI 44111222, nota 8)
let dniNuevo = "44111222";
let nombreNuevo = "Sofia Ruiz";
let notaNuevo = 8;
// Verificar que el DNI no exista ya
let yaExiste = false;
for (let i = 0; i < alumnos.length; i++) {
if (alumnos[i].dni === dniNuevo) {
yaExiste = true;
break;
}
}
if (yaExiste) {
alert("❌ El DNI " + dniNuevo + " ya está registrado");
} else {
// Crear el nuevo objeto y agregarlo
let nuevoAlumno = {
dni: dniNuevo,
nombre: nombreNuevo,
nota: notaNuevo
};
alumnos.push(nuevoAlumno);  // ← AGREGAMOS
alert("✓ Alumno agregado: " + nombreNuevo +
"\nAhora hay " + alumnos.length + " alumnos");
}
AGREGAR - Versión interactiva con prompt
// Cargar nuevo alumno desde prompt
let dniNuevo = prompt("DNI del nuevo alumno:");
// Verificar que no exista
let yaExiste = false;
for (let i = 0; i < alumnos.length; i++) {
if (alumnos[i].dni === dniNuevo) {
alert("❌ El DNI ya está registrado");
yaExiste = true;
break;
}
}
if (!yaExiste) {
let nombreNuevo = prompt("Nombre:");
let notaNuevo = Number(prompt("Nota (0-10):"));
// Validar nota
while (notaNuevo < 0 || notaNuevo > 10) {
alert("❌ Nota inválida (0-10)");
notaNuevo = Number(prompt("Nota (0-10):"));
}
alumnos.push({
dni: dniNuevo,
nombre: nombreNuevo,
nota: notaNuevo
});
alert("✓ Alumno " + nombreNuevo + " agregado");
alert("Total de alumnos: " + alumnos.length);
}
BONUS: Ver todos los alumnos (después de CRUD)
// Mostrar todos los alumnos actuales
let listado = "=== ALUMNOS REGISTRADOS ===\n\n";
for (let i = 0; i < alumnos.length; i++) {
listado += (i + 1) + ". " + alumnos[i].nombre +
"\n   DNI: " + alumnos[i].dni +
" | Nota: " + alumnos[i].nota + "\n\n";
}
listado += "Total: " + alumnos.length + " alumnos";
alert(listado);
// O mostrar en consola
console.log("Alumnos actuales:");
for (let i = 0; i < alumnos.length; i++) {
console.log(alumnos[i]);
}
RESUMEN - Los 4 patrones CRUD
CREATE (Agregar)
READ (Ver todos)
UPDATE (Modificar)
DELETE (Eliminar)
alumnos.push({ dni, nombre, nota })
for (let i=0; i < alumnos.length; i++)
alumnos[i].nota = nuevaNota
alumnos.splice(i, 1)
Siempre busca por DNI y valida antes de modificar o eliminar