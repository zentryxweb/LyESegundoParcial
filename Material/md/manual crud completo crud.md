# CRUD Completo por DNI
## Modificar · Eliminar · Agregar · Ver Listado
**Ejemplos ejecutables con prompt() y alert()**

---

### Datos de Ejemplo Iniciales
```javascript
let alumnos = [
  { dni: "40111222", nombre: "Ana García", nota: 8 },
  { dni: "40333444", nombre: "Juan Martínez", nota: 6 },
  { dni: "41555666", nombre: "Carlos López", nota: 9 },
  { dni: "42777888", nombre: "Marta Rodríguez", nota: 7 },
  { dni: "43999000", nombre: "Pedro Fernández", nota: 5 }
];
```

---

## 1. CREATE (Agregar Alumno con Validación de DNI Único)
Verifica que el DNI no exista antes de insertar el nuevo objeto:

```javascript
let dniNuevo = prompt("DNI del nuevo alumno:");
let yaExiste = false;

// Comprobar si el DNI ya está registrado
for (let i = 0; i < alumnos.length; i++) {
  if (alumnos[i].dni === dniNuevo) {
    alert("❌ El DNI ya está registrado.");
    yaExiste = true;
    break;
  }
}

if (!yaExiste) {
  let nombreNuevo = prompt("Nombre del alumno:");
  let notaNuevo = Number(prompt("Nota (0 a 10):"));

  while (isNaN(notaNuevo) || notaNuevo < 0 || notaNuevo > 10) {
    alert("❌ Nota inválida (0-10).");
    notaNuevo = Number(prompt("Ingrese la nota nuevamente (0-10):"));
  }

  alumnos.push({
    dni: dniNuevo,
    nombre: nombreNuevo ? nombreNuevo.trim() : "Sin Nombre",
    nota: notaNuevo
  });

  alert("✓ Alumno " + nombreNuevo + " agregado con éxito.\nTotal de alumnos: " + alumnos.length);
}
```

---

## 2. READ (Ver Todos los Registros)
Recorre el arreglo con un ciclo `for` y concatena la información en un mensaje:

```javascript
if (alumnos.length === 0) {
  alert("No hay alumnos registrados.");
} else {
  let listado = "=== ALUMNOS REGISTRADOS ===\n\n";
  for (let i = 0; i < alumnos.length; i++) {
    listado += (i + 1) + ". " + alumnos[i].nombre + "\n" +
               "   DNI: " + alumnos[i].dni + " | Nota: " + alumnos[i].nota + "\n\n";
  }
  listado += "Total: " + alumnos.length + " alumnos.";
  alert(listado);
}
```

---

## 3. UPDATE (Modificar Nota por DNI)
Busca por DNI, solicita el nuevo valor y actualiza la propiedad:

```javascript
let dniBuscado = prompt("DNI del alumno a modificar:");
let encontrado = false;

for (let i = 0; i < alumnos.length; i++) {
  if (alumnos[i].dni === dniBuscado) {
    let nuevaNota = Number(prompt("Nueva nota para " + alumnos[i].nombre + " (actual: " + alumnos[i].nota + "):"));

    while (isNaN(nuevaNota) || nuevaNota < 0 || nuevaNota > 10) {
      alert("❌ Nota inválida (0-10).");
      nuevaNota = Number(prompt("Ingrese la nota nuevamente (0-10):"));
    }

    alumnos[i].nota = nuevaNota;
    alert("✓ Nota modificada correctamente a: " + nuevaNota);
    encontrado = true;
    break; // Corta el for al encontrarlo
  }
}

if (!encontrado) {
  alert("❌ DNI: " + dniBuscado + " no encontrado.");
}
```

---

## 4. DELETE (Eliminar por DNI con Confirmación)
Busca la posición con el ciclo, pide confirmación con `confirm()` y remueve el elemento con `splice()`:

```javascript
let dniEliminar = prompt("DNI del alumno a eliminar:");
let encontrado = false;

for (let i = 0; i < alumnos.length; i++) {
  if (alumnos[i].dni === dniEliminar) {
    let nombre = alumnos[i].nombre;
    let confirmar = confirm("¿Estás seguro de eliminar a " + nombre + "?");

    if (confirmar) {
      alumnos.splice(i, 1);
      alert("✓ " + nombre + " fue eliminado.\nAlumnos restantes: " + alumnos.length);
    } else {
      alert("⚠ Eliminación cancelada.");
    }

    encontrado = true;
    break; // Importante salir tras aplicar splice
  }
}

if (!encontrado) {
  alert("❌ DNI: " + dniEliminar + " no existe.");
}
```

---

## Resumen de los 4 Patrones
| Operación | Método Clave | Descripción |
| :--- | :--- | :--- |
| **CREATE** | `alumnos.push({ dni, nombre, nota })` | Agrega un nuevo registro al final del arreglo. |
| **READ** | `for (let i = 0; i < alumnos.length; i++)` | Recorre e informa los elementos. |
| **UPDATE** | `alumnos[i].nota = nuevaNota` | Modifica directamente la propiedad del objeto encontrado. |
| **DELETE** | `alumnos.splice(i, 1)` | Elimina el registro del arreglo por su índice. |