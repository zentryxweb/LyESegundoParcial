import JSZip from 'jszip';

/**
 * Genera el paquete final oficial que consolida todos los trabajos que el alumno realizó en el día
 */
export async function generarPaqueteEntregaFinal({ alumno, trabajos, trabajoActual }) {
  const zip = new JSZip();
  const safeName = alumno.nombre.replace(/[^a-zA-Z0-9]/g, '_');
  const folderName = `ENTREGA_FINAL_${alumno.dni}_${safeName}`;
  const folder = zip.folder(folderName);

  // 1. Manifiesto de la Práctica
  const manifest = {
    institucion: "Cátedra Laboratorio y Estructuras",
    evaluacion: "Práctica Evaluativa y Formativa",
    alumno: {
      nombre: alumno.nombre,
      dni: alumno.dni
    },
    fechaEntrega: new Date().toLocaleString('es-AR'),
    cantidadTrabajos: trabajos.length + 1,
    trabajos: [
      ...trabajos.map((t, idx) => ({
        numero: idx + 1,
        titulo: t.titulo_trabajo,
        fecha: t.fecha_registro
      })),
      {
        numero: trabajos.length + 1,
        titulo: trabajoActual.titulo || "Ejercicio Final",
        fecha: new Date().toLocaleString('es-AR')
      }
    ]
  };

  folder.file('README_ENTREGA.txt', `PRÁCTICA L&E - ENTREGA DE TRABAJOS
Alumno: ${alumno.nombre}
DNI: ${alumno.dni}
Fecha de Entrega Final: ${manifest.fechaEntrega}
Total de ejercicios incluidos: ${manifest.cantidadTrabajos}
-----------------------------------------------------------
Este archivo comprimido contiene todos los ejercicios y avances desarrollados
durante la práctica para su corrección.
`);

  folder.file('manifiesto.json', JSON.stringify(manifest, null, 2));

  // 2. Agregar cada trabajo anterior al ZIP
  trabajos.forEach((t, i) => {
    const subFolder = folder.folder(`ejercicio_${i + 1}_${(t.titulo_trabajo || 'avance').replace(/[^a-zA-Z0-9]/g, '_')}`);
    subFolder.file('index.html', t.codigo_html);
    subFolder.file('app.js', t.codigo_js);
  });

  // 3. Agregar el trabajo actual / final
  const finalSubFolder = folder.folder(`ejercicio_${trabajos.length + 1}_final`);
  finalSubFolder.file('index.html', trabajoActual.html);
  finalSubFolder.file('app.js', trabajoActual.js);

  // 4. Agregar una versión ejecutable directa que incluye todo
  const consolidatedHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Entrega Final - ${alumno.nombre} (${alumno.dni})</title>
</head>
<body>
  <!-- TRABAJO FINAL ENTREGADO POR ${alumno.nombre} (DNI ${alumno.dni}) -->
  ${trabajoActual.html}
  <script>
    ${trabajoActual.js}
  <\/script>
</body>
</html>`;
  folder.file(`EJECUTABLE_DIRECTO_${alumno.dni}.html`, consolidatedHTML);

  // Generar blob y descargar
  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  return {
    filename: `${folderName}.zip`,
    totalEjercicios: manifest.cantidadTrabajos
  };
}
