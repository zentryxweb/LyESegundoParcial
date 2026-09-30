import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { marked } from 'marked';
import './App.css';
import { initialHtmlCode, initialJsCode } from './data/initialCode';
import {
  registrarAccesoDiario,
  guardarTrabajo,
  getTrabajosPorAlumno,
  getAllTrabajos,
  getAllAccesos,
  resetDatabase
} from './db/sqlite';
import { generarPaqueteEntregaFinal } from './utils/zipExporter';

const TEACHER_PIN = "39370453";

// Materiales de cátedra disponibles para consulta en línea (HTML interactivos y PDFs)
const MATERIALES_MD = [
  {
    id: 'arraylist_html',
    titulo: 'ArrayList Dinámicos (HTML Interactivo)',
    archivo: 'ArrayList Dinamicos.html',
    tipo: 'html',
    desc: 'Guía interactiva ejecutable con botones y código.'
  },
  {
    id: 'funciones_html',
    titulo: 'Funciones y Pasaje de Parámetros (HTML)',
    archivo: 'Funciones y Pasaje de Parámetros.html',
    tipo: 'html',
    desc: 'Guía interactiva de subprogramas y cadenas.'
  },
  {
    id: 'js_html_pdf',
    titulo: 'JavaScript en HTML (PDF)',
    archivo: 'JavaScript en HTML - Guía Práctica.pdf',
    tipo: 'pdf',
    desc: 'Documento PDF oficial de cátedra.'
  },
  {
    id: 'crud_pdf',
    titulo: 'Manual CRUD Completo (PDF)',
    archivo: 'manual-crud-completo crud.pdf',
    tipo: 'pdf',
    desc: 'Presentación completa en PDF de operaciones CRUD.'
  },
  {
    id: 'pseint_1_pdf',
    titulo: 'JavaScript vs PSeInt Parte 1 (PDF)',
    archivo: 'manual-javascript vs pseint.pdf',
    tipo: 'pdf',
    desc: 'Diapositivas teóricas en PDF.'
  },
  {
    id: 'pseint_2_pdf',
    titulo: 'JavaScript vs PSeInt Parte 2 (PDF)',
    archivo: 'manual-javascript-pseint-parte2.pdf',
    tipo: 'pdf',
    desc: 'Segunda parte del manual en PDF.'
  }
];

export default function App() {
  // Estado del Alumno
  const [student, setStudent] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [dniInput, setDniInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Estado del Editor
  const [activeTab, setActiveTab] = useState('js'); // 'html' | 'js'
  const [htmlCode, setHtmlCode] = useState(initialHtmlCode);
  const [jsCode, setJsCode] = useState(initialJsCode);

  // Diagnóstico de Errores con Línea Exacta
  const [jsError, setJsError] = useState(null); // { message, line }
  const monacoRef = useRef(null);

  // Visor en Línea de Material (Sin descargas)
  const [activeDoc, setActiveDoc] = useState(null); // { titulo, type, contentHtml, url }
  const [loadingDoc, setLoadingDoc] = useState(false);

  // Estado de Trabajos del Alumno
  const [trabajosRealizados, setTrabajosRealizados] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // Panel del Profesor
  const [showTeacherDrawer, setShowTeacherDrawer] = useState(false);
  const [teacherSubmissions, setTeacherSubmissions] = useState([]);
  const [teacherAccesos, setTeacherAccesos] = useState([]);
  const [teacherViewTab, setTeacherViewTab] = useState('entregas');

  useEffect(() => {
    const session = sessionStorage.getItem('alumno_sesion_activa');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.dni && parsed.nombre) {
          setStudent(parsed);
          cargarHistorialAlumno(parsed.dni);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Validación y detección dinámica de errores en JavaScript con número de línea
  useEffect(() => {
    if (!jsCode || !jsCode.trim()) {
      setJsError(null);
      return;
    }

    try {
      // Intenta compilar la función para detectar errores de sintaxis
      new Function(jsCode);
      setJsError(null);
    } catch (err) {
      // Extrae la línea del error si está disponible
      let line = null;
      if (err.stack) {
        const match = err.stack.match(/<anonymous>:(\d+):(\d+)/) || err.stack.match(/eval:(\d+):(\d+)/);
        if (match && match[1]) {
          line = Number(match[1]) - 2; // Compensar wrapper de Function
          if (line <= 0) line = 1;
        }
      }
      setJsError({
        message: err.message,
        line: line || 'Sintaxis'
      });
    }
  }, [jsCode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const cargarHistorialAlumno = async (dni) => {
    try {
      const trabajos = await getTrabajosPorAlumno(dni);
      setTrabajosRealizados(trabajos);
    } catch (e) {
      console.error(e);
    }
  };

  // Comenzar a trabajar: sin validación previa, solo para el nombre del archivo
  const handleStartWorking = async () => {
    const finalName = nameInput.trim() || 'Estudiante';
    const finalDni = dniInput.trim().replace(/\D/g, '') || '00000000';

    setIsVerifying(true);
    setLoginError('');

    try {
      const resultado = await registrarAccesoDiario(finalDni, finalName);

      if (!resultado.allowed) {
        setLoginError(resultado.message);
        setIsVerifying(false);
        return;
      }

      const alumnoData = { nombre: finalName, dni: finalDni };
      setStudent(alumnoData);
      sessionStorage.setItem('alumno_sesion_activa', JSON.stringify(alumnoData));
      await cargarHistorialAlumno(finalDni);
      showToast(`¡Bienvenido/a, ${finalName}! Ingreso registrado en SQLite.`);
    } catch (err) {
      console.error(err);
      const alumnoData = { nombre: finalName, dni: finalDni };
      setStudent(alumnoData);
      sessionStorage.setItem('alumno_sesion_activa', JSON.stringify(alumnoData));
    } finally {
      setIsVerifying(false);
    }
  };

  // Abrir Material en Línea en Visor Modal (md, html y pdfs en visor web)
  const handleOpenDocOnline = async (mat) => {
    setLoadingDoc(true);
    const fileUrl = `./material_md/${encodeURIComponent(mat.archivo)}`;

    if (mat.tipo === 'pdf' || mat.tipo === 'html') {
      setActiveDoc({
        titulo: mat.titulo,
        type: mat.tipo,
        url: fileUrl
      });
      setLoadingDoc(false);
      return;
    }

    try {
      const resp = await fetch(fileUrl);
      if (!resp.ok) throw new Error('No se pudo leer el archivo');
      const text = await resp.text();
      const contentHtml = marked.parse(text);
      setActiveDoc({
        titulo: mat.titulo,
        type: 'md',
        contentHtml
      });
    } catch (err) {
      console.error(err);
      alert('Error cargando documento: ' + err.message);
    } finally {
      setLoadingDoc(false);
    }
  };

  // Ejecutar en Live Server (Ventana Emergente Popup)
  const handleRunLiveServer = () => {
    let combinedContent = htmlCode;
    if (jsCode.trim()) {
      const scriptInjection = `<script>\n${jsCode}\n<\/script>`;
      if (combinedContent.includes('</body>')) {
        combinedContent = combinedContent.replace('</body>', `${scriptInjection}\n</body>`);
      } else {
        combinedContent += `\n${scriptInjection}`;
      }
    }

    const liveWindow = window.open('', '_blank', 'width=800,height=600,resizable=yes,scrollbars=yes');
    if (!liveWindow) {
      alert('⚠️ Por favor habilita los pop-ups en tu navegador para ver la prueba interactiva.');
      return;
    }
    liveWindow.document.open();
    liveWindow.document.write(combinedContent);
    liveWindow.document.close();
  };

  // Guardar Avance: guarda el trabajo y LIMPIA la pestaña para el siguiente ejercicio sin bloquear la UI
  const handleSaveAvance = async () => {
    if (!student) return;
    const nro = trabajosRealizados.length + 1;
    const tituloInput = window.prompt(`Nombre o título para este avance/ejercicio #${nro}:`, `Ejercicio ${nro}`);
    if (tituloInput === null) return; // Cancelado por el usuario

    const titulo = tituloInput.trim() || `Ejercicio ${nro}`;

    try {
      await guardarTrabajo({
        dni: student.dni,
        nombre: student.nombre,
        tituloTrabajo: titulo,
        esFinal: false,
        html: htmlCode,
        js: jsCode
      });

      await cargarHistorialAlumno(student.dni);

      // LIMPIAR la pestaña para empezar un nuevo ejercicio fresco
      setJsCode('');
      setHtmlCode(initialHtmlCode);

      showToast(`✓ Avance "${titulo}" guardado exitosamente. Pestaña lista para el siguiente ejercicio.`);
    } catch (err) {
      console.error(err);
      showToast('⚠️ No se pudo guardar el avance: ' + (err.message || 'Error desconocido'));
    }
  };

  // Entrega Final con paquete ZIP que reúne todo
  const handleFinalSubmit = async () => {
    if (!student) return;

    const confirmSubmit = window.confirm(
      `¿Deseas realizar la ENTREGA FINAL de tu examen?\n\nSe empaquetará el conjunto de tus ${trabajosRealizados.length} avances previos junto con el código actual en tu archivo final.`
    );
    if (!confirmSubmit) return;

    await guardarTrabajo({
      dni: student.dni,
      nombre: student.nombre,
      tituloTrabajo: 'Entrega Final Evaluada',
      esFinal: true,
      html: htmlCode,
      js: jsCode
    });

    await cargarHistorialAlumno(student.dni);

    try {
      const res = await generarPaqueteEntregaFinal({
        alumno: student,
        trabajos: trabajosRealizados,
        trabajoActual: {
          titulo: 'Resolución Final',
          html: htmlCode,
          js: jsCode
        }
      });
      showToast(`🎓 ¡Entrega final completada! Se generó ${res.filename}`);
    } catch (err) {
      console.error(err);
      showToast('Entrega registrada con éxito.');
    }
  };

  // Acceso Docente
  const handleOpenTeacher = async () => {
    const pin = prompt("🔐 Ingrese la clave maestra de profesor:");
    if (pin === null) return;

    if (pin.trim() === TEACHER_PIN) {
      const [trabajos, accesos] = await Promise.all([
        getAllTrabajos(),
        getAllAccesos()
      ]);
      setTeacherSubmissions(trabajos);
      setTeacherAccesos(accesos);
      setShowTeacherDrawer(true);
    } else {
      alert("❌ Clave incorrecta. Acceso denegado.");
    }
  };

  const handleLoadWorkIntoEditor = (item) => {
    if (window.confirm(`¿Cargar en el editor el trabajo de ${item.nombre}?`)) {
      setHtmlCode(item.codigo_html);
      setJsCode(item.codigo_js);
      setShowTeacherDrawer(false);
      showToast(`Código de ${item.nombre} cargado en el editor.`);
    }
  };

  const handlePreviewWork = (item) => {
    let combined = item.codigo_html;
    if (item.codigo_js.trim()) {
      const scriptTag = `<script>\n${item.codigo_js}\n<\/script>`;
      if (combined.includes('</body>')) {
        combined = combined.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        combined += `\n${scriptTag}`;
      }
    }

    const previewWin = window.open('', '_blank', 'width=800,height=600,resizable=yes,scrollbars=yes');
    if (!previewWin) {
      alert('Habilita ventanas emergentes en el navegador.');
      return;
    }
    previewWin.document.open();
    previewWin.document.write(combined);
    previewWin.document.close();
  };

  const handleResetDb = async () => {
    if (window.confirm("⚠️ ¿Estás seguro de resetear la base de datos SQLite docente?")) {
      await resetDatabase();
      setTeacherSubmissions([]);
      setTeacherAccesos([]);
      setTrabajosRealizados([]);
      showToast("Base de datos restablecida.");
    }
  };

  // Configuración del editor Monaco (autocompletado, snippets y tema oscuro tipo VS Code)
  const handleEditorDidMount = (editor, monaco) => {
    monacoRef.current = editor;

    // Registrar autocompletado dinámico para HTML (ej: button, script, input, div, boilerplates)
    monaco.languages.registerCompletionItemProvider('html', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = [
          {
            label: 'button',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<button onclick="${1:miFuncion()}">${2:Presione aquí}</button>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Inserta un botón HTML con manejador de eventos onclick',
            range
          },
          {
            label: 'button:id',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<button id="${1:btnAccion}">${2:Aceptar}</button>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Inserta un botón con atributo id',
            range
          },
          {
            label: 'script:src',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<script src="${1:app.js}"></script>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Vincula un archivo JavaScript externo (ej: app.js)',
            range
          },
          {
            label: 'input:text',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<input type="text" id="${1:txtNombre}" placeholder="${2:Ingrese valor}">',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Campo de entrada de texto',
            range
          },
          {
            label: 'input:button',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<input type="button" value="${1:Ejecutar}" onclick="${2:iniciar()}">',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Botón con etiqueta input',
            range
          },
          {
            label: 'html5:loader',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<!DOCTYPE html>\n<html lang="es">\n<head>\n\t<meta charset="UTF-8">\n\t<title>${1:Práctica LyE}</title>\n</head>\n<body>\n\t<h1>${2:Programa en Ejecución}</h1>\n\t<script src="app.js"></script>\n</body>\n</html>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Estructura mínima HTML5 como cargador de app.js',
            range
          },
          {
            label: 'div',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<div id="${1:contenedor}">\n\t${2}\n</div>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Contenedor div básico',
            range
          }
        ];

        return { suggestions };
      }
    });

    // Sugerencias de autocompletado para JavaScript
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = [
          {
            label: 'prompt',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'prompt("${1:Mensaje:}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Solicita una entrada al usuario mediante ventana modal',
            range
          },
          {
            label: 'alert',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'alert("${1:Mensaje}");',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Muestra una alerta al usuario',
            range
          },
          {
            label: 'confirm',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'confirm("${1:¿Confirmar acción?}");',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Ventana de confirmación Aceptar/Cancelar',
            range
          },
          {
            label: 'Number(prompt())',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'Number(prompt("${1:Ingrese un número:}"));',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Lee un valor numérico convirtiendo el String de prompt',
            range
          },
          {
            label: 'parseInt(prompt())',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'parseInt(prompt("${1:Ingrese un entero:}"));',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Convierte texto de prompt a número entero',
            range
          },
          {
            label: 'for (bucle)',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t${3}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Bucle for para iterar arreglos',
            range
          },
          {
            label: 'while (menu)',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'let opcion = "";\nwhile (opcion !== "${1:5}") {\n\topcion = prompt("1. Agregar\\n2. Listar\\n3. Buscar\\n4. Eliminar\\n5. Salir");\n\tswitch(opcion) {\n\t\tcase "1":\n\t\t\t// Agregar\n\t\t\tbreak;\n\t\tcase "2":\n\t\t\t// Listar\n\t\t\tbreak;\n\t\tcase "3":\n\t\t\t// Buscar\n\t\t\tbreak;\n\t\tcase "4":\n\t\t\t// Eliminar\n\t\t\tbreak;\n\t\tcase "5":\n\t\t\talert("Fin del programa.");\n\t\t\tbreak;\n\t\tdefault:\n\t\t\talert("Opción no válida.");\n\t\t\tbreak;\n\t}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Estructura de menú interactivo con while y switch',
            range
          },
          {
            label: 'push',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'push(${1:elemento});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Agrega un elemento al final del arreglo',
            range
          },
          {
            label: 'splice',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'splice(${1:indice}, ${2:1});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Elimina elementos del arreglo por su índice',
            range
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'function ${1:nombreFuncion}(${2:param}) {\n\t${3}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Declaración de función modularizada',
            range
          }
        ];

        return { suggestions };
      }
    });
  };

  return (
    <>
      {/* Modal Identificación */}
      {!student && (
        <div className="modal-overlay">
          <div className="login-card">
            <h2>🎓 Práctica Web</h2>
            <p>Ingresa tu Nombre y DNI. Se utilizan para armar el nombre de tus archivos de entrega sin trabar tu ingreso.</p>

            <div className="info-banner">
              🔒 <strong>Validación SQLite Diaria:</strong> Cada alumno cuenta con un único ingreso habilitado por día para la práctica.
            </div>

            {loginError && <div className="login-error">❌ {loginError}</div>}

            <div className="form-group">
              <label>Nombre y Apellido</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ej: Juan Pérez"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleStartWorking()}
              />
            </div>

            <div className="form-group">
              <label>DNI</label>
              <input
                type="text"
                value={dniInput}
                onChange={(e) => setDniInput(e.target.value)}
                placeholder="Ej: 42123456"
                maxLength={10}
                onKeyDown={(e) => e.key === 'Enter' && handleStartWorking()}
              />
            </div>

            <button
              type="button"
              className="btn-submit"
              onClick={handleStartWorking}
              disabled={isVerifying}
            >
              {isVerifying ? 'Verificando...' : '🚀 Comenzar a Trabajar'}
            </button>
          </div>
        </div>
      )}

      {/* Header Superior */}
      <header>
        <div className="brand">
          <div className="brand-title">
            <span>💻</span>
            <span>Práctica L&amp;E</span>
          </div>

          {student && (
            <div className="badge-user">
              <span className="dot"></span>
              <span>{student.nombre} (DNI: {student.dni})</span>
            </div>
          )}
        </div>

        <div className="header-actions">
          {student && (
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
              Avances guardados: <strong>{trabajosRealizados.length}</strong>
            </span>
          )}
          <button className="btn-header btn-prof" onClick={handleOpenTeacher} title="Acceso docente con clave">
            <span>🔒</span>
            <span className="btn-text">Acceso Profesor / Entregas</span>
          </button>
        </div>
      </header>

      {/* Workspace Principal (100% Pantalla Completa) */}
      <main className="workspace">
        {/* Panel Izquierdo: Material Exclusivo de Cátedra (Solo Ver en Línea) */}
        <aside className="guide-panel">
          <div className="guide-panel-title">
            <span>📖 Material Oficial de Clases</span>
          </div>

          <div className="guide-scroll">
            <div className="guide-card-box">
              <strong>💡 Consulta en Línea:</strong>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8' }}>
                Todos los manuales, guías y presentaciones se visualizan directamente en pantalla sin pop-ups ni descargas.
              </p>
            </div>

            {MATERIALES_MD.map(mat => (
              <div key={mat.id} className="material-card">
                <div className="material-info">
                  <div className="material-title">{mat.titulo}</div>
                  <div className="material-desc">{mat.desc}</div>
                </div>
                <button
                  className="btn-open-popup"
                  onClick={() => handleOpenDocOnline(mat)}
                  title="Ver en pantalla en línea"
                >
                  👁️ Ver
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Panel Derecho: Editor IDE Monaco con Autocompletado */}
        <section className="editor-panel">
          <div className="editor-toolbar">
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'html' ? 'active' : ''}`}
                onClick={() => setActiveTab('html')}
              >
                <span className="badge-file badge-html">HTML</span> index.html (Loader)
              </button>
              <button
                className={`tab-btn ${activeTab === 'js' ? 'active' : ''}`}
                onClick={() => setActiveTab('js')}
              >
                <span className="badge-file badge-js">JS</span> app.js (Lógica / Menú)
              </button>
            </div>

            <div className="editor-controls">
              <button className="btn-ctrl btn-run" onClick={handleRunLiveServer} title="Probar código en ventana emergente">
                <span>▶</span> Ejecutar en Live Server
              </button>
              <button className="btn-ctrl btn-save-step" onClick={handleSaveAvance} title="Guarda el avance y limpia la pestaña para el próximo ejercicio">
                <span>💾</span> Guardar Avance y Limpiar
              </button>
              <button className="btn-ctrl btn-final" onClick={handleFinalSubmit} title="Consolida todos los trabajos en el paquete final">
                <span>🎓</span> Entrega Final
              </button>
            </div>
          </div>

          <div className="code-container">
            {activeTab === 'html' ? (
              <Editor
                height="100%"
                language="html"
                theme="vs-dark"
                value={htmlCode}
                onChange={(value) => setHtmlCode(value || '')}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  tabSize: 2,
                  scrollBeyondLastLine: false,
                  quickSuggestions: { other: true, comments: true, strings: true },
                  suggestOnTriggerCharacters: true,
                  wordWrap: 'on'
                }}
              />
            ) : (
              <Editor
                height="100%"
                language="javascript"
                theme="vs-dark"
                value={jsCode}
                onChange={(value) => setJsCode(value || '')}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  tabSize: 2,
                  scrollBeyondLastLine: false,
                  quickSuggestions: { other: true, comments: true, strings: true },
                  suggestOnTriggerCharacters: true,
                  wordWrap: 'on'
                }}
              />
            )}
          </div>

          {/* Barra de Diagnóstico de Errores con Línea Exacta */}
          <div className="error-diagnostics-bar">
            {activeTab === 'js' && jsError ? (
              <div className="error-badge-fail">
                <span className="error-line-tag">Línea {jsError.line}</span>
                <span>⚠️ Error de Sintaxis: {jsError.message}</span>
              </div>
            ) : (
              <div className="error-badge-ok">
                <span>✓ Sintaxis de código válida. IDE listo para ejecutar.</span>
              </div>
            )}
            <div style={{ color: '#71717a', fontSize: '0.75rem' }}>
              Autocompletado activo: <kbd>Ctrl</kbd> + <kbd>Espacio</kbd>
            </div>
          </div>
        </section>
      </main>

      {/* Visor Modal de Documentación (md, html y pdfs en pantalla completa sin descargas) */}
      {activeDoc && (
        <div className="md-viewer-overlay" onClick={() => setActiveDoc(null)}>
          <div className="md-viewer-container" onClick={(e) => e.stopPropagation()}>
            <div className="md-viewer-header">
              <h3>📖 {activeDoc.titulo}</h3>
              <button className="btn-close" onClick={() => setActiveDoc(null)} title="Cerrar">&times;</button>
            </div>

            {activeDoc.type === 'pdf' ? (
              <iframe
                src={activeDoc.url}
                title={activeDoc.titulo}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            ) : activeDoc.type === 'html' ? (
              <iframe
                src={activeDoc.url}
                title={activeDoc.titulo}
                style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
              />
            ) : (
              <div
                className="md-viewer-body"
                dangerouslySetInnerHTML={{ __html: activeDoc.contentHtml }}
              />
            )}
          </div>
        </div>
      )}

      {/* Drawer del Profesor (Protegido con clave) */}
      {showTeacherDrawer && (
        <div className="drawer-overlay" onClick={() => setShowTeacherDrawer(false)}>
          <div className="teacher-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>📁 Carpeta Digital de Entregas</h3>
              <button className="btn-close" onClick={() => setShowTeacherDrawer(false)}>&times;</button>
            </div>

            <div className="drawer-body">
              <div className="stats-bar">
                <span>Total Registros: <strong style={{ color: '#60a5fa' }}>{teacherSubmissions.length}</strong></span>
                <span style={{ color: '#a78bfa', fontSize: '0.8rem' }}>SQLite Almacenamiento Local</span>
              </div>

              <div className="drawer-nav-tabs">
                <button
                  className={`drawer-nav-btn ${teacherViewTab === 'entregas' ? 'active' : ''}`}
                  onClick={() => setTeacherViewTab('entregas')}
                >
                  📦 Trabajos y Entregas ({teacherSubmissions.length})
                </button>
                <button
                  className={`drawer-nav-btn ${teacherViewTab === 'accesos' ? 'active' : ''}`}
                  onClick={() => setTeacherViewTab('accesos')}
                >
                  🔒 Registro de Accesos Diarios ({teacherAccesos.length})
                </button>
              </div>

              {teacherViewTab === 'entregas' && (
                <div className="submission-list">
                  {teacherSubmissions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#a1a1aa' }}>
                      No hay entregas registradas todavía.
                    </div>
                  ) : (
                    teacherSubmissions.map((item) => (
                      <div key={item.id} className="submission-card">
                        <div className="submission-meta">
                          <div>
                            <div className="sub-name">
                              {item.nombre}
                              {item.es_entrega_final === 1 && (
                                <span className="sub-badge-final">ENTREGA FINAL</span>
                              )}
                            </div>
                            <div className="sub-dni">DNI: {item.dni} | {item.titulo_trabajo}</div>
                          </div>
                          <span className="sub-date">{item.fecha_registro}</span>
                        </div>
                        <div className="submission-actions">
                          <button className="btn-sub-act btn-load" onClick={() => handleLoadWorkIntoEditor(item)}>
                            📥 Editar
                          </button>
                          <button className="btn-sub-act btn-preview" onClick={() => handlePreviewWork(item)}>
                            ▶ Probar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {teacherViewTab === 'accesos' && (
                <div className="submission-list">
                  {teacherAccesos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#a1a1aa' }}>
                      No hay accesos diarios registrados.
                    </div>
                  ) : (
                    teacherAccesos.map((acc) => (
                      <div key={acc.id} className="submission-card">
                        <div className="submission-meta">
                          <div>
                            <div className="sub-name">{acc.nombre}</div>
                            <div className="sub-dni">DNI: {acc.dni}</div>
                          </div>
                          <div>
                            <span className="sub-date">Día: {acc.fecha_dia} a las {acc.created_at}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div style={{ marginTop: '24px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#fca5a5',
                    width: '100%',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  onClick={handleResetDb}
                >
                  🗑️ Resetear Base de Datos SQLite Docente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
