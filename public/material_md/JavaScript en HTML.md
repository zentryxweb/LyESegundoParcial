# JavaScript en HTML
## Guía de Integración Práctica: Scripts Internos, Externos y Loader

---

### 1. El Enfoque del Loader Fijo (`index.html`)
Para mantener el código ordenado y modular, no escribimos la lógica dentro de archivos HTML extensos ni manipulamos el DOM. Usamos `index.html` como un cargador (*loader*) del script principal:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Aplicación JavaScript</title>
</head>
<body>
  <h1>Evaluación de Laboratorio y Estructuras</h1>
  
  <!-- Vinculación del script externo donde reside toda la lógica -->
  <script src="app.js"></script>
</body>
</html>
```

---

### 2. Organización del Código en `app.js`
En `app.js` se colocan las variables, bucles y funciones reutilizables.
- Toda la interacción con el usuario se hace mediante `prompt()`, `alert()` y `confirm()`.
- No requiere diseñar tablas ni estilos en HTML.
- El navegador ejecuta secuencialmente las instrucciones apenas se carga la página.