export const initialHtmlCode = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Práctica - Laboratorio y Estructuras</title>
</head>
<body>
  <h1>Práctica de Laboratorio y Estructuras</h1>
  <p>El programa se ejecuta a través de ventanas interactivas.</p>
  
  <!-- Loader del archivo app.js tal como vimos en clases -->
  <script src="app.js"></script>
</body>
</html>`;

export const initialJsCode = `// PRÁCTICA INTEGRAL: SISTEMA DE DATOS INTERACTIVO
// Uso de arreglos, objetos, bucles (for, while), prompt() y alert()

let alumnos = [
  { dni: "40111222", nombre: "Ana García", nota: 8 },
  { dni: "40333444", nombre: "Juan Martínez", nota: 6 },
  { dni: "41555666", nombre: "Carlos López", nota: 9 }
];

let opcion = "0";

while (opcion !== "6") {
  opcion = prompt(
    "=== MENÚ PRINCIPAL ===\\n" +
    "1. Ver Alumnos (READ)\\n" +
    "2. Agregar Alumno (CREATE)\\n" +
    "3. Modificar Nota por DNI (UPDATE)\\n" +
    "4. Eliminar Alumno por DNI (DELETE)\\n" +
    "5. Ver Estadísticas (Promedio / Máxima)\\n" +
    "6. Salir\\n\\n" +
    "Elija una opción (1-6):"
  );

  switch (opcion) {
    case "1":
      // READ: Recorrer con bucle for
      if (alumnos.length === 0) {
        alert("No hay alumnos registrados.");
      } else {
        let listado = "=== LISTA DE ALUMNOS ===\\n\\n";
        for (let i = 0; i < alumnos.length; i++) {
          listado += (i + 1) + ". " + alumnos[i].nombre + "\\n" +
                     "   DNI: " + alumnos[i].dni + " | Nota: " + alumnos[i].nota + "\\n\\n";
        }
        listado += "Total: " + alumnos.length + " alumnos.";
        alert(listado);
      }
      break;

    case "2":
      // CREATE: Validación de DNI único y nota entre 0 y 10
      let dniNuevo = prompt("DNI del nuevo alumno:");
      if (!dniNuevo) break;
      dniNuevo = dniNuevo.trim();

      let yaExiste = false;
      for (let i = 0; i < alumnos.length; i++) {
        if (alumnos[i].dni === dniNuevo) {
          yaExiste = true;
          break;
        }
      }

      if (yaExiste) {
        alert("❌ El DNI " + dniNuevo + " ya está registrado.");
      } else {
        let nombreNuevo = prompt("Nombre del alumno:");
        let notaNuevo = Number(prompt("Nota (0 a 10):"));

        while (isNaN(notaNuevo) || notaNuevo < 0 || notaNuevo > 10) {
          alert("❌ Nota inválida. Debe ser un número entre 0 y 10.");
          notaNuevo = Number(prompt("Ingrese la nota nuevamente (0-10):"));
        }

        alumnos.push({
          dni: dniNuevo,
          nombre: nombreNuevo ? nombreNuevo.trim() : "Sin Nombre",
          nota: notaNuevo
        });

        alert("✓ Alumno " + nombreNuevo + " agregado correctamente.");
      }
      break;

    case "3":
      // UPDATE: Buscar por DNI y cambiar nota
      let dniModif = prompt("DNI del alumno a modificar:");
      if (!dniModif) break;

      let encontradoModif = false;
      for (let i = 0; i < alumnos.length; i++) {
        if (alumnos[i].dni === dniModif.trim()) {
          let nuevaNota = Number(prompt("Nueva nota para " + alumnos[i].nombre + " (actual: " + alumnos[i].nota + "):"));

          while (isNaN(nuevaNota) || nuevaNota < 0 || nuevaNota > 10) {
            alert("❌ Nota inválida (0-10).");
            nuevaNota = Number(prompt("Ingrese la nota nuevamente (0-10):"));
          }

          alumnos[i].nota = nuevaNota;
          alert("✓ Nota modificada a " + nuevaNota + " con éxito.");
          encontradoModif = true;
          break;
        }
      }

      if (!encontradoModif) {
        alert("❌ No se encontró ningún alumno con el DNI: " + dniModif);
      }
      break;

    case "4":
      // DELETE: Buscar por DNI, confirmar y eliminar con splice
      let dniElim = prompt("DNI del alumno a eliminar:");
      if (!dniElim) break;

      let encontradoElim = false;
      for (let i = 0; i < alumnos.length; i++) {
        if (alumnos[i].dni === dniElim.trim()) {
          let confirmar = confirm("¿Deseas eliminar a " + alumnos[i].nombre + " (DNI " + alumnos[i].dni + ")?");
          if (confirmar) {
            let borrado = alumnos.splice(i, 1);
            alert("✓ Alumno " + borrado[0].nombre + " eliminado.");
          } else {
            alert("Acción cancelada.");
          }
          encontradoElim = true;
          break;
        }
      }

      if (!encontradoElim) {
        alert("❌ DNI no encontrado.");
      }
      break;

    case "5":
      // CÁLCULO / ESTADÍSTICAS: Recorrido con for
      if (alumnos.length === 0) {
        alert("No hay alumnos cargados para calcular estadísticas.");
      } else {
        let suma = 0;
        let maxima = alumnos[0].nota;
        let mejorAlumno = alumnos[0].nombre;

        for (let i = 0; i < alumnos.length; i++) {
          suma += alumnos[i].nota;
          if (alumnos[i].nota > maxima) {
            maxima = alumnos[i].nota;
            mejorAlumno = alumnos[i].nombre;
          }
        }

        let promedio = suma / alumnos.length;
        alert(
          "=== ESTADÍSTICAS DEL CURSO ===\\n\\n" +
          "- Total de alumnos: " + alumnos.length + "\\n" +
          "- Promedio General: " + promedio.toFixed(2) + "\\n" +
          "- Nota Más Alta: " + maxima + " (" + mejorAlumno + ")"
        );
      }
      break;

    case "6":
      alert("Finalizando ejecución del programa.");
      break;

    default:
      if (opcion !== null) {
        alert("Opción inválida. Ingrese un número del 1 al 6.");
      }
  }
}
`;
