Manual Interactivo: Funciones y Métodos en JavaScript
Aprende la teoría fundamental de subprogramas y manipulación de cadenas con ejemplos prácticos

1. Anatomía de una Función y Pasaje por Valor
Una Función es un bloque de código reutilizable diseñado para realizar una tarea específica. Recibe datos de entrada llamados parámetros, procesa las instrucciones y opcionalmente devuelve un resultado mediante la instrucción return.

📌 Parámetros Formales vs. Reales:
Los parámetros son las variables declaradas en la firma de la función. Los argumentos son los valores reales transmitidos al invocarla.
📌 Pasaje por Valor (Primitivos):
Los tipos primitivos (Number, String, Boolean) se pasan como una **copia**. Modificar el parámetro dentro de la función no altera la variable original del exterior.
📌 Retorno explicitado (return):
Interrumpe la ejecución del bloque de la función y devuelve el valor evaluado al punto donde fue llamada.
📌 Validación con isNaN y || (OR):
isNaN(v) comprueba si un valor NO es número. Al combinarlo con el operador disyuntivo ||, la condición se cumple si
al menos una
de las entradas es inválida.
⚡ Práctica 1: Calculadora de Calificaciones (Pasaje por Valor + Validación)
Demuestra el pasaje de parámetros numéricos, la verificación de tipos con isNaN() y la restricción de rango (0 a 10).

1. Calcular Promedio
📄 Ver Código
// FUNCIÓN PRINCIPAL ORQUESTADORA (Sin parámetros)
function iniciarCalculoPromedio() {
  let n1 = Number(prompt("Ingresá la primera nota (0 a 10):"));
  let n2 = Number(prompt("Ingresá la segunda nota (0 a 10):"));
  let n3 = Number(prompt("Ingresá la tercera nota (0 a 10):"));

  // 1. VALIDACIÓN DE TIPO DE DATO:
  if (isNaN(n1) || isNaN(n2) || isNaN(n3)) {
    alert("❌ Error: Al menos una de las notas ingresadas no es un número válido.");
    return;
  }

  // 2. VALIDACIÓN DE RANGO (0 a 10):
  if (n1 < 0 || n1 > 10 || n2 < 0 || n2 > 10 || n3 < 0 || n3 > 10) {
    alert("❌ Error: Las notas deben estar comprendidas entre 0 y 10.");
    return;
  }

  let resultado = calcularPromedio(n1, n2, n3);
  alert("El promedio final calculado es: " + resultado.toFixed(2));
}

function calcularPromedio(nota1, nota2, nota3) {
  let suma = nota1 + nota2 + nota3;
  return suma / 3;
}
2. Pasaje de Parámetros por Referencia
A diferencia de los tipos primitivos, los tipos de datos compuestos como Objetos y Arreglos se pasan por **referencia**. Esto significa que la función comparte la dirección exacta de memoria donde reside la estructura.

Mecanismo	Tipos de Datos	Comportamiento en Memoria	Efecto en Variable Original
Por Valor	Number, String, Boolean	Se duplica el valor en un nuevo espacio del Stack.	Sin cambios (Inmutable desde el exterior).
Por Referencia	Array, Object	Se comparte el puntero hacia la dirección en el Heap.	Se modifica directamente el objeto/array original.
⚡ Práctica 2: Modificación de Registros (Pasaje por Referencia)
Demuestra cómo enviar un objeto como parámetro permite transformar su estado interno sin reasignarlo.

1. Aplicar Descuento a Estudiante
📄 Ver Código
function iniciarAplicacionBeca() {
  let alumno = {
    nombre: "Carlos Gómez",
    cuota: 10000,
    becado: false
  };

  alert("Estado Inicial:\n" +
        "Nombre: " + alumno.nombre + "\n" +
        "Cuota: $" + alumno.cuota + "\n" +
        "Becado: " + alumno.becado);

  let porc = Number(prompt("Ingresá el porcentaje de beca a otorgar (ej: 20):"));

  if (!isNaN(porc) && porc > 0 && porc <= 100) {
    aplicarBeca(alumno, porc);

    alert("Estado Final (luego de mutar el objeto):\n" +
          "Nombre: " + alumno.nombre + "\n" +
          "Nueva Cuota: $" + alumno.cuota + "\n" +
          "Becado: " + alumno.becado);
  } else {
    alert("❌ Porcentaje no válido.");
  }
}

function aplicarBeca(estudiante, porcentajeDescuento) {
  let descuento = (estudiante.cuota * porcentajeDescuento) / 100;
  estudiante.cuota = estudiante.cuota - descuento;
  estudiante.becado = true;
}
3. Modularización: Llamar Funciones dentro de Funciones
La Modularización consiste en dividir un proceso en subfunciones especializadas que realizan tareas concretas (capturar entradas, validar datos, sanitizar o formatear) orquestadas por una función contenedora.

📌 Función Orquestadora (Sin Parámetros):
Asociada al evento onclick del botón. Inicia la secuencia invocando a las subfunciones necesarias sin requerir argumentos iniciales.
📌 Subfunciones de Utilidad (Con Parámetros):
Funciones encargadas de procesar fragmentos específicos de la lógica del programa y devolver un valor procesado o un resultado booleano.
⚡ Práctica 3: Sistema de Autenticación / Login Modular
El botón invoca a la función vacía iniciarLogin(), la cual orquesta la llamada a subfunciones encargadas de solicitar datos, sanitizar texto, validar credenciales y dar la bienvenida.

1. Iniciar Sesión (Login)
📄 Ver Código
// 1. FUNCIÓN PRINCIPAL ORQUESTADORA (Asociada al botón)
function iniciarLogin() {
  let datosIngresados = solicitarCredenciales();
  
  if (!datosIngresados.usuario || !datosIngresados.pass) {
    alert("❌ Operación cancelada o datos incompletos.");
    return;
  }

  // Se delega la validación a una subfunción
  let esValido = validarCredenciales(datosIngresados.usuario, datosIngresados.pass);

  if (esValido) {
    mostrarMensajeBienvenida(datosIngresados.usuario);
  } else {
    alert("❌ Credenciales incorrectas. Acceso denegado.");
  }
}

// 2. SUBFUNCIÓN DE CAPTURA Y LIMPIEZA
function solicitarCredenciales() {
  let user = prompt("Ingresá tu usuario (Ej: admin123):");
  let password = prompt("Ingresá tu contraseña (Ej: 1234):");

  if (!user || !password) {
    return { usuario: "", pass: "" };
  }

  // Aplicación de métodos de saneamiento de String:
  let usuarioLimpio = user.trim().toLowerCase();
  
  // Eliminamos números usando expresiones regulares (replace)
  usuarioLimpio = usuarioLimpio.replace(/[0-9]/g, "");

  return {
    usuario: usuarioLimpio,
    pass: password.trim()
  };
}

// 3. SUBFUNCIÓN DE VALIDACIÓN LOGICA
function validarCredenciales(user, password) {
  const USUARIO_CORRECTO = "admin";
  const PASS_CORRECTA = "1234";

  return (user === USUARIO_CORRECTO && password === PASS_CORRECTA);
}

// 4. SUBFUNCIÓN DE SALIDA DE DATOS
function mostrarMensajeBienvenida(nombreUsuario) {
  let nombreFormateado = nombreUsuario.toUpperCase();
  alert("🔑 ¡Acceso concedido! Bienvenid@ al sistema, " + nombreFormateado + ".");
}
4. Manipulación y Sanitización de Textos (Strings)
Cuando trabajamos con entradas de texto del usuario, es fundamental limpiar y transformar las cadenas antes de compararlas o procesarlas.

📌 .trim()
Elimina espacios en blanco invisibles al inicio y al final del texto. Evita errores cuando un usuario ingresa espacios por accidente.
📌 .toLowerCase() / .toUpperCase()
Convierten todo el texto a minúsculas o mayúsculas. Ideal para estandarizar búsquedas y validaciones sin importar cómo escribió el usuario.
📌 .replace(patrón, reemplazo)
Busca un patrón o expresión regular (RegEx) y lo reemplaza por otro valor. Se usa para eliminar números, letras o símbolos de un texto.
Método / Expresión	Descripción / Patrón	Ejemplo de Entrada	Resultado Obtencion
cadena.trim()	Elimina espacios externos	" admin "	"admin"
cadena.toLowerCase()	Convierte a minúsculas	"ADMIN"	"admin"
cadena.toUpperCase()	Convierte a mayúsculas	"admin"	"ADMIN"
replace(/[0-9]/g, "")	Elimina todos los **números**	"admin123"	"admin"
replace(/[a-zA-Z]/g, "")	Elimina todas las **letras**	"user123"	"123"