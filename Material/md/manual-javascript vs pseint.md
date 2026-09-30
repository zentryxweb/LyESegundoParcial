# Manual Interactivo · JavaScript
## De la lógica de PSeInt al código real en JavaScript
**prompt() · alert() · 100% archivos .js · sin una línea de HTML**
*Herramientas: Editor de código + Consola del navegador*

---

### ¡Bienvenido/a!
No estás empezando de cero: ya sabés pensar como programador/a. Lo que cambia acá es la sintaxis, no la lógica.

---

## 01. Entorno y Metodología: Editor vs. Navegador
En PSeInt escribías y ejecutabas en el mismo lugar. Ahora esas dos tareas se separan: el editor edita, el navegador ejecuta.

> **💡 Idea clave:**
> - **Editor (VS Code / Sublime):** Donde escribo y guardo el código.
> - **Navegador (Chrome / Edge / Firefox):** Donde lo ejecuto y pruebo.

### ¿Cómo se ejecuta un archivo .js?
1. **Un archivo `.js` no se ejecuta con doble clic** (se abriría como texto plano).
2. **Opción A (Consola):** Presionás `F12` en el navegador, vas a la pestaña **Console**, pegás tu código y das `Enter`.
3. **Opción B (Loader `index.html`):** Creás un archivo simple `index.html` con `<script src="app.js"></script>` y lo abrís en el navegador.

---

## 02. Equivalencias Directas: PSeInt ↔ JavaScript

| Acción | Sintaxis PSeInt | Sintaxis JavaScript |
| :--- | :--- | :--- |
| **Definir variable** | `Definir nombre Como Cadena` | `let nombre;` o `const PI = 3.14;` |
| **Leer dato** | `Leer nombre` | `let nombre = prompt("Ingresá tu nombre:");` |
| **Mostrar en pantalla** | `Escribir "Hola", nombre` | `alert("Hola " + nombre);` |
| **Condicional** | `Si cond Entonces ... FinSi` | `if (cond) { ... } else { ... }` |
| **Selección múltiple** | `Según opcion Hacer ... FinSegun` | `switch (opcion) { case 1: ... break; }` |
| **Bucle mientras** | `Mientras cond Hacer ... FinMientras` | `while (cond) { ... }` |
| **Función** | `Funcion r = Sumar(a,b) ... FinFuncion` | `function sumar(a, b) { return a + b; }` |

---

## 03. Variables y Entrada de Datos: `let`, `const`, `prompt()` y `alert()`

### `let` vs `const`
- `let edad = 25;` $\rightarrow$ **Puede** cambiar su valor con el tiempo.
- `const PI = 3.1416;` $\rightarrow$ **No puede** cambiar su valor.

### ⚠️ Regla de Oro: `prompt()` siempre devuelve Texto (String)
Si leés números con `prompt()`, debes convertirlos explícitamente con `Number()`:

```javascript
// INCORRECTO (Concatena texto):
let n1 = prompt("Primer número:"); // "5"
let n2 = prompt("Segundo número:"); // "3"
alert(n1 + n2); // ¡Da "53"!

// CORRECTO (Suma matemática):
let n1 = Number(prompt("Primer número:")); // 5
let n2 = Number(prompt("Segundo número:")); // 3
alert(n1 + n2); // 8
```

---

## 04. Estructuras de Control de Flujo

### Condicional `if / else if / else` y Operadores Lógicos
- `&&` = **Y** (ambas condiciones deben cumplirse).
- `||` = **O** (al menos una condición debe cumplirse).
- `!` = **NO** (negación lógica).
- `===` = Comparación estricta de igualdad.

```javascript
let edad = Number(prompt("Ingresá tu edad:"));

if (edad >= 18) {
  alert("Sos mayor de edad.");
} else if (edad >= 13) {
  alert("Sos adolescente.");
} else {
  alert("Sos menor de edad.");
}
```

### Selección Múltiple: `switch`
```javascript
let dia = Number(prompt("Día (1 al 7):"));
let nombreDia;

switch (dia) {
  case 1: nombreDia = "Lunes"; break;
  case 2: nombreDia = "Martes"; break;
  case 3: nombreDia = "Miércoles"; break;
  case 4: nombreDia = "Jueves"; break;
  case 5: nombreDia = "Viernes"; break;
  case 6: nombreDia = "Sábado"; break;
  case 7: nombreDia = "Domingo"; break;
  default: nombreDia = "Día inválido";
}

alert("Día seleccionado: " + nombreDia);
```

### Validación con Bucle `while`
Repite la pregunta mientras el dato ingresado sea incorrecto:

```javascript
let numero = Number(prompt("Ingresá un número mayor a 0:"));

while (numero <= 0 || isNaN(numero)) {
  alert("Valor incorrecto. Debe ser un número mayor a 0.");
  numero = Number(prompt("Ingresá un número mayor a 0:"));
}

alert("¡Dato válido! Ingresaste: " + numero);
```

---

## 05. Funciones
Reutilizar bloques de código con parámetros y valor de retorno:

```javascript
// Declaración de función
function sumar(a, b) {
  return a + b;
}

// Uso con prompt y alert:
let n1 = Number(prompt("Primer número:"));
let n2 = Number(prompt("Segundo número:"));
let resultado = sumar(n1, n2);

alert("El resultado de la suma es: " + resultado);
```