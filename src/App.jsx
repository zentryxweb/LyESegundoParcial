import React, { useState, useEffect } from 'react';
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

// Lista fiel a los archivos en Material/md
const MATERIALES_MD = [
  {
    id: 'arraydinamico',
    titulo: 'Array Dinámico & CRUD',
    archivo: 'arraydinamido.md',
    desc: 'Métodos push, pop, splice, iteración con for y CRUD con objetos.'
  },
  {
    id: 'crud_completo',
    titulo: 'Manual CRUD Completo por DNI',
    archivo: 'manual crud completo crud.md',
    desc: 'Buscar, Modificar, Eliminar y Agregar con validación por DNI.'
  },
  {
    id: 'funciones',
    titulo: 'Funciones y Pasaje de Parámetros',
    archivo: 'Funciones y Pasaje de Parámetros.md',
    desc: 'Parámetros por valor y referencia, modularización y sanitización.'
  },
  {
    id: 'js_pseint_1',
    titulo: 'JavaScript vs PSeInt (Parte 1)',
    archivo: 'manual-javascript vs pseint.md',
    desc: 'Variables, Number(prompt()), if, switch y bucle while.'
  },
  {
    id: 'js_pseint_2',
    titulo: 'JavaScript vs PSeInt (Parte 2)',
    archivo: 'manual-javascript-pseint-parte2.md',
    desc: 'Bucles for, do-while, arreglos y Proyecto Control de Notas.'
  },
  {
    id: 'js_en_html',
    titulo: 'JavaScript en HTML',
    archivo: 'JavaScript en HTML.md',
    desc: 'Loader index.html, vinculación de app.js y eventos onclick.'
  }
];

export default function App() {
  // Estado del Alumno
  const [student, setStudent] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [dniInput, setDniInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Estado del Editor: renderizado exclusivo para evitar superposiciones
  const [activeTab, setActiveTab] = useState('html'); // 'html' | 'js'
  const [htmlCode, setHtmlCode] = useState(initialHtmlCode);
  const [jsCode, setJsCode] = useState(initialJsCode);

  // Visor en Línea de Material Markdown (Sin descargas)
  const [activeDoc, setActiveDoc] = useState(null); // { titulo, contentHtml }
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

  // Comenzar a trabajar: sin validación que impida entrar, solo para identificar y nombrar
  const handleStartWorking = async () => {
    const finalName = nameInput.trim() || 'Estudiante';
    const finalDni = dniInput.trim().replace(/\D/g, '') || '00000000';

    setIsVerifying(true);
    setLoginError('');

    try {
      // Verificación en SQLite de no repetir ingreso en el día
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
      showToast(`¡Bienvenido/a, ${finalName}! Ingreso registrado.`);
    } catch (err) {
      console.error(err);
      const alumnoData = { nombre: finalName, dni: finalDni };
      setStudent(alumnoData);
      sessionStorage.setItem('alumno_sesion_activa', JSON.stringify(alumnoData));
    } finally {
      setIsVerifying(false);
    }
  };

  // Abrir Material en Línea en Visor Modal (100% en línea, sin descargas)
  const handleOpenDocOnline = async (mat) => {
    setLoadingDoc(true);
    try {
      const resp = await fetch(`./material_md/${encodeURIComponent(mat.archivo)}`);
      if (!resp.ok) throw new Error('No se pudo leer el archivo');
      const text = await resp.text();
      const contentHtml = marked.parse(text);
      setActiveDoc({
        titulo: mat.titulo,
        contentHtml
      });
    } catch (err) {
      console.error(err);
      alert('Error cargando documento: ' + err.message);
    } finally {
      setLoadingDoc(false);
    }
  };

  // Abrir también en ventana emergente independiente si el alumno lo prefiere
  const handleOpenDocInNewWindow = async (mat) => {
    try {
      const resp = await fetch(`./material_md/${encodeURIComponent(mat.archivo)}`);
      const text = await resp.text();
      const htmlBody = marked.parse(text);

      const win = window.open('', '_blank', 'width=900,height=750,resizable=yes,scrollbars=yes');
      if (!win) {
        alert('Habilite las ventanas emergentes en el navegador.');
        return;
      }

      win.document.open();
      win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${mat.titulo} - Material de Clases</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 30px; background: #0f172a; color: #f8fafc; line-height: 1.6; }
    h1, h2, h3 { color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 6px; }
    pre { background: #1e293b; padding: 14px; border-radius: 8px; overflow-x: auto; color: #7dd3fc; }
    code { background: #334155; padding: 2px 5px; border-radius: 4px; color: #fde047; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #475569; padding: 8px 12px; }
    th { background: #1e293b; }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`);
      win.document.close();
    } catch (e) {
      console.error(e);
    }
  };

  // Ejecutar en Live Server (Ventana Emergente Popup)
  // Como no usamos estilos ni DOM, inyecta el script directamente en el index.html puro
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

  // Guardar un avance parcial (varios trabajos antes de la entrega final)
  const handleSaveAvance = async () => {
    if (!student) return;
    const nro = trabajosRealizados.length + 1;
    const titulo = prompt(`Nombre para este ejercicio/avance #${nro}:`, `Ejercicio ${nro}`);
    if (titulo === null) return;

    await guardarTrabajo({
      dni: student.dni,
      nombre: student.nombre,
      tituloTrabajo: titulo || `Ejercicio ${nro}`,
      esFinal: false,
      html: htmlCode,
      js: jsCode
    });

    await cargarHistorialAlumno(student.dni);
    showToast(`✓ Avance "${titulo || `Ejercicio ${nro}`}" guardado.`);
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

  return (
    <>
      {/* Modal Identificación */}
      {!student && (
        <div className="modal-overlay">
          <div className="login-card">
            <h2>🎓 Evaluación Web</h2>
            <p>Ingresa tu Nombre y DNI. Se utilizan para armar el nombre de tus archivos de entrega sin trabar tu ingreso.</p>

            <div className="info-banner">
              🔒 <strong>Validación SQLite Diaria:</strong> Cada alumno cuenta con un único ingreso habilitado por día para el examen.
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
            <span>Evaluación L&amp;E</span>
            <span className="badge-sqlite">SQLite Web</span>
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

      {/* Workspace Principal */}
      <main className="workspace">
        {/* Panel Izquierdo: Material Exclusivo de Cátedra (Ver en línea sin descargas) */}
        <aside className="guide-panel">
          <div className="guide-panel-title">
            <span>📖 Material Oficial de Clases</span>
          </div>

          <div className="guide-scroll">
            <div className="guide-card-box">
              <strong>💡 Consulta en Línea:</strong>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8' }}>
                Todos los ejemplos trabajados en clase (arreglos, menús interactivos, CRUD y funciones) se visualizan directamente en pantalla sin descargar nada.
              </p>
            </div>

            {MATERIALES_MD.map(mat => (
              <div key={mat.id} className="material-card">
                <div className="material-info">
                  <div className="material-title">{mat.titulo}</div>
                  <div className="material-desc">{mat.desc}</div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    className="btn-open-popup"
                    onClick={() => handleOpenDocOnline(mat)}
                    title="Ver en pantalla en línea"
                  >
                    👁️ Ver
                  </button>
                  <button
                    className="btn-open-popup"
                    style={{ background: 'rgba(139, 92, 246, 0.15)', borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c4b5fd' }}
                    onClick={() => handleOpenDocInNewWindow(mat)}
                    title="Abrir en ventana emergente independiente"
                  >
                    ↗ Pop-up
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Panel Derecho: Editor sin sobreposiciones */}
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
              <button className="btn-ctrl btn-save-step" onClick={handleSaveAvance} title="Guarda un avance parcial">
                <span>💾</span> Guardar Avance
              </button>
              <button className="btn-ctrl btn-final" onClick={handleFinalSubmit} title="Consolida todos los trabajos en el paquete final">
                <span>🎓</span> Entrega Final
              </button>
            </div>
          </div>

          <div className="code-container">
            {/* Renderizado condicional estricto: solo el archivo seleccionado se renderiza */}
            {activeTab === 'html' ? (
              <textarea
                className="code-editor"
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                spellCheck="false"
                placeholder="Escribe tu código HTML aquí..."
              />
            ) : (
              <textarea
                className="code-editor"
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                spellCheck="false"
                placeholder="Escribe tu código JavaScript aquí..."
              />
            )}
          </div>
        </section>
      </main>

      {/* Visor Modal de Documentación Markdown (100% en línea, sin descargas) */}
      {activeDoc && (
        <div className="md-viewer-overlay" onClick={() => setActiveDoc(null)}>
          <div className="md-viewer-container" onClick={(e) => e.stopPropagation()}>
            <div className="md-viewer-header">
              <h3>📖 {activeDoc.titulo}</h3>
              <button className="btn-close" onClick={() => setActiveDoc(null)} title="Cerrar">&times;</button>
            </div>
            <div
              className="md-viewer-body"
              dangerouslySetInnerHTML={{ __html: activeDoc.contentHtml }}
            />
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
