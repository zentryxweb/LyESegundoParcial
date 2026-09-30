# Manual Interactivo · JavaScript (Parte 2)
## Bucles `for`, Arreglos y Tu Primer Sistema con Datos
**prompt() · alert() · IDE libre + index.html (Loader) · Sin manipular DOM**

---

### Lo que vas a aprender en este módulo:
1. **Entorno fijo:** Loader `index.html` vinculando `app.js`.
2. **Bucles controlados:** `for` y `do-while`.
3. **Arreglos (Arrays):** Equivalente a `Dimension` y vectores de PSeInt.
4. **Manejo de Arreglos:** Métodos `push`, `pop`, `splice` y acceso por índice.
5. **Arreglos de Objetos:** Colecciones con clave y valor (ej: DNI, nombre, nota).
6. **Proyecto Integrador:** Menú de opciones + cálculos (suma, promedio y nota máxima).

---

## 01. Entorno de Trabajo: El Loader `index.html`
A partir de este punto, el archivo `index.html` se crea una única vez y queda fijo:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Control de Notas</title>
</head>
<body>
  <!-- Carga automática del código JavaScript -->
  <script src="app.js"></script>
</body>
</html>
```

> **Flujo de trabajo:**
> 1. Escribís y guardás todo tu código en `app.js`.
> 2. Abrís `index.html` con doble clic en tu navegador.
> 3. Cada vez que hagas un cambio en `app.js`, guardás y recargás el navegador con `F5`.

---

## 02. Bucles `for` y `do-while`

### Anatomía del ciclo `for`
Ideal cuando ya sabemos de antemano cuántas vueltas dará el ciclo:

```javascript
for (let i = 1; i <= 5; i++) {
  alert("Vuelta número " + i);
}
```
- `let i = 1;` $\rightarrow$ **Inicialización:** arranca el contador.
- `i <= 5;` $\rightarrow$ **Condición:** se evalúa antes de cada iteración.
- `i++` $\rightarrow$ **Incremento:** suma 1 al final de cada vuelta.

### Bucle `do...while`
Se ejecuta **al menos una vez obligatoriamente** antes de evaluar la condición:

```javascript
let numero;
do {
  numero = Number(prompt("Ingresá un número mayor a 0:"));
} while (numero <= 0 || isNaN(numero));

alert("Número válido ingresado: " + numero);
```

---

## 03. Arreglos (Arrays): De `Dimension` a `Array`

En PSeInt usabas `Dimension arreglo[N]`. En JavaScript es dinámico y se declara con corchetes `[]`:

```javascript
// Arreglo con elementos iniciales
let notas = [8, 6, 10, 4];

// Regla del Índice 0:
alert(notas[0]); // 8 -> Primer elemento
alert(notas[3]); // 4 -> Último elemento
alert(notas.length); // 4 -> Cantidad de elementos
```

### Métodos Principales del Arreglo:
| Método | Acción | Ejemplo |
| :--- | :--- | :--- |
| `push(valor)` | Agrega un elemento **al final** | `notas.push(9);` |
| `pop()` | Elimina el **último** elemento | `notas.pop();` |
| `arreglo[i] = v` | **Modifica** el valor en la posición `i` | `notas[1] = 7;` |
| `splice(i, cant)` | **Elimina** `cant` elementos desde el índice `i` | `notas.splice(2, 1);` |

### Recorrer un arreglo con ciclo `for`:
```javascript
let notas = [8, 6, 10, 4];

for (let i = 0; i < notas.length; i++) {
  alert("Alumno " + (i + 1) + " tiene nota: " + notas[i]);
}
```

---

## 04. Arreglos de Objetos (Estructura con Clave y Valor)
Equivalente a una colección de Registros:

```javascript
let alumnos = [
  { dni: "40111222", nombre: "Ana", nota: 8 },
  { dni: "40333444", nombre: "Juan", nota: 6 }
];

// Acceso a propiedades con punto (.):
alert(alumnos[0].nombre); // "Ana"
alert(alumnos[0].dni);    // "40111222"
alert(alumnos[0].nota);   // 8
```

### Búsqueda por DNI y modificación:
```javascript
let dniBuscado = prompt("Ingresá el DNI a modificar:");
let encontrado = false;

for (let i = 0; i < alumnos.length; i++) {
  if (alumnos[i].dni === dniBuscado) {
    let nuevaNota = Number(prompt("Nueva nota para " + alumnos[i].nombre + ":"));
    alumnos[i].nota = nuevaNota;
    alert("Nota actualizada con éxito.");
    encontrado = true;
    break;
  }
}

if (!encontrado) {
  alert("No se encontró ningún alumno con el DNI: " + dniBuscado);
}
```

---

## 05. Proyecto: Sistema de Control de Notas con Menú Interactivo

```javascript
let notas = [];
let opcion = "0";

while (opcion !== "5") {
  opcion = prompt(
    "=== CONTROL DE NOTAS ===\\n" +
    "1. Cargar Notas\\n" +
    "2. Ver Todas\\n" +
    "3. Calcular Promedio\\n" +
    "4. Ver Nota Más Alta\\n" +
    "5. Salir\\n\\n" +
    "Elija una opción (1-5):"
  );

  switch (opcion) {
    case "1":
      let cantidad = Number(prompt("¿Cuántas notas vas a cargar?"));
      notas = [];
      let contador = 0;
      while (contador < cantidad) {
        let nota = Number(prompt("Nota del alumno " + (contador + 1) + " (0-10):"));
        while (isNaN(nota) || nota < 0 || nota > 10) {
          alert("Nota inválida. Debe ser entre 0 y 10.");
          nota = Number(prompt("Ingresá la nota nuevamente:"));
        }
        notas.push(nota);
        contador++;
      }
      alert("Se cargaron " + notas.length + " notas.");
      break;

    case "2":
      if (notas.length === 0) {
        alert("No hay notas cargadas.");
      } else {
        let listado = "Listado de Notas:\\n";
        for (let i = 0; i < notas.length; i++) {
          listado += "Alumno " + (i + 1) + ": " + notas[i] + "\\n";
        }
        alert(listado);
      }
      break;

    case "3":
      if (notas.length === 0) {
        alert("No hay notas para promediar.");
      } else {
        let suma = 0;
        for (let i = 0; i < notas.length; i++) {
          suma += notas[i];
        }
        let prom = suma / notas.length;
        alert("El promedio del curso es: " + prom.toFixed(2));
      }
      break;

    case "4":
      if (notas.length === 0) {
        alert("No hay notas registradas.");
      } else {
        let max = notas[0];
        for (let i = 1; i < notas.length; i++) {
          if (notas[i] > max) max = notas[i];
        }
        alert("La nota más alta es: " + max);
      }
      break;

    case "5":
      alert("Saliendo del sistema...");
      break;

    default:
      if (opcion !== null) alert("Opción no válida.");
  }
}
```