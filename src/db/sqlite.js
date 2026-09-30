import initSqlJs from 'sql.js';
// Import directo de Vite para el archivo WASM como URL garantizada
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

const SQLITE_STORAGE_KEY = 'evaluacion_sqlite_db_bin';
const FALLBACK_STORAGE_KEY = 'evaluacion_sqlite_fallback_json';

let dbInstance = null;

// Implementación de respaldo Relacional en LocalStorage (si WebAssembly no se puede instanciar en el entorno)
class LocalStorageFallbackDB {
  constructor() {
    const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
    this.data = raw ? JSON.parse(raw) : { accesos: [], trabajos: [] };
  }

  save() {
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(this.data));
  }

  run(query, params = []) {
    // Parser liviano para INSERTs comunes
    if (query.includes('INSERT INTO registro_accesos')) {
      const [dni, nombre, fecha_dia, created_at] = params;
      this.data.accesos.push({
        id: this.data.accesos.length + 1,
        dni,
        nombre,
        fecha_dia,
        created_at
      });
      this.save();
    } else if (query.includes('INSERT INTO entregas_trabajos')) {
      const [dni, nombre, titulo_trabajo, es_entrega_final, codigo_html, codigo_js, fecha_registro, created_at] = params;
      this.data.trabajos.push({
        id: this.data.trabajos.length + 1,
        dni,
        nombre,
        titulo_trabajo,
        es_entrega_final,
        codigo_html,
        codigo_js,
        fecha_registro,
        created_at
      });
      this.save();
    }
  }

  prepare(query) {
    const self = this;
    let boundParams = {};
    let cursor = 0;
    let results = [];

    return {
      bind(params) {
        boundParams = params;
        if (query.includes('FROM registro_accesos')) {
          results = self.data.accesos.filter(a => 
            a.dni === String(boundParams[':dni']).trim() &&
            (!boundParams[':fecha'] || a.fecha_dia === boundParams[':fecha'])
          );
        } else if (query.includes('FROM entregas_trabajos')) {
          if (boundParams[':dni']) {
            results = self.data.trabajos.filter(t => t.dni === String(boundParams[':dni']).trim());
          } else {
            results = [...self.data.trabajos].reverse();
          }
        }
        cursor = 0;
      },
      step() {
        return cursor < results.length;
      },
      getAsObject() {
        const item = results[cursor];
        cursor++;
        return item || {};
      },
      free() {}
    };
  }

  export() {
    return new Uint8Array();
  }
}

export async function getDatabase() {
  if (dbInstance) return dbInstance;

  // Intento 1: Carga con URL resuelta por Vite
  try {
    const SQL = await initSqlJs({
      locateFile: () => wasmUrl
    });

    const savedBinary = localStorage.getItem(SQLITE_STORAGE_KEY);
    if (savedBinary) {
      const uInt8Array = Uint8Array.from(atob(savedBinary), c => c.charCodeAt(0));
      dbInstance = new SQL.Database(uInt8Array);
    } else {
      dbInstance = new SQL.Database();
      initTables(dbInstance);
      persistDatabase(dbInstance);
    }
    return dbInstance;
  } catch (err1) {
    console.warn('Fallo método 1 de WASM, intentando CDN...', err1);
  }

  // Intento 2: Carga desde CDN oficial de sql.js
  try {
    const SQL = await initSqlJs({
      locateFile: () => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm'
    });

    const savedBinary = localStorage.getItem(SQLITE_STORAGE_KEY);
    if (savedBinary) {
      const uInt8Array = Uint8Array.from(atob(savedBinary), c => c.charCodeAt(0));
      dbInstance = new SQL.Database(uInt8Array);
    } else {
      dbInstance = new SQL.Database();
      initTables(dbInstance);
      persistDatabase(dbInstance);
    }
    return dbInstance;
  } catch (err2) {
    console.warn('WASM no disponible, usando motor de persistencia alternativo en LocalStorage:', err2);
  }

  // Intento 3: Motor alternativo 100% infalible que nunca arroja CompileError
  dbInstance = new LocalStorageFallbackDB();
  return dbInstance;
}

function initTables(db) {
  // Tabla de accesos diarios (DNI + Fecha YYYY-MM-DD única)
  db.run(`
    CREATE TABLE IF NOT EXISTS registro_accesos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dni TEXT NOT NULL,
      nombre TEXT NOT NULL,
      fecha_dia TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(dni, fecha_dia)
    );
  `);

  // Tabla de trabajos parciales y finales
  db.run(`
    CREATE TABLE IF NOT EXISTS entregas_trabajos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dni TEXT NOT NULL,
      nombre TEXT NOT NULL,
      titulo_trabajo TEXT NOT NULL,
      es_entrega_final INTEGER DEFAULT 0,
      codigo_html TEXT NOT NULL,
      codigo_js TEXT NOT NULL,
      fecha_registro TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export function persistDatabase(db = dbInstance) {
  if (!db) return;
  try {
    const binary = db.export();
    let binaryString = '';
    const bytes = new Uint8Array(binary);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binaryString);
    localStorage.setItem(SQLITE_STORAGE_KEY, base64);
  } catch (e) {
    console.warn('No se pudo persistir base de datos a localStorage:', e);
  }
}

export function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Valida si el alumno ya ingresó hoy.
 * Si ya ingresó en el día, retorna { allowed: false, alumno }
 * Si es nuevo en el día, lo registra y retorna { allowed: true, isNew: true }
 */
export async function registrarAccesoDiario(dni, nombre) {
  const db = await getDatabase();
  const hoy = getTodayString();
  const cleanDni = String(dni).trim();
  const cleanNombre = String(nombre).trim();

  // Verificar si ya existe en la fecha de hoy
  const stmt = db.prepare('SELECT dni, nombre, created_at FROM registro_accesos WHERE dni = :dni AND fecha_dia = :fecha');
  stmt.bind({ ':dni': cleanDni, ':fecha': hoy });

  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    // Ya ingresó hoy -> no puede ingresar más de una vez en el día
    return {
      allowed: false,
      message: `El DNI ${cleanDni} ya registró su ingreso oficial para la fecha de hoy (${hoy}) a las ${row.created_at}. Según las pautas de la práctica no está permitido reingresar.`,
      alumno: row
    };
  }
  stmt.free();

  // No existía hoy -> Registrar en SQLite
  try {
    const timeNow = new Date().toLocaleTimeString('es-AR');
    db.run(
      'INSERT INTO registro_accesos (dni, nombre, fecha_dia, created_at) VALUES (?, ?, ?, ?)',
      [cleanDni, cleanNombre, hoy, timeNow]
    );
    persistDatabase(db);
    return {
      allowed: true,
      message: 'Ingreso registrado correctamente en SQLite.',
      alumno: { dni: cleanDni, nombre: cleanNombre }
    };
  } catch (err) {
    return {
      allowed: false,
      message: 'Error al registrar en base de datos: ' + err.message
    };
  }
}

/**
 * Guarda un trabajo (parcial o entrega final)
 */
export async function guardarTrabajo({ dni, nombre, tituloTrabajo, esFinal, html, js }) {
  const db = await getDatabase();
  const fechaStr = new Date().toLocaleString('es-AR');
  const timeStamp = new Date().toISOString();

  db.run(
    `INSERT INTO entregas_trabajos (dni, nombre, titulo_trabajo, es_entrega_final, codigo_html, codigo_js, fecha_registro, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [dni, nombre, tituloTrabajo || 'Ejercicio', esFinal ? 1 : 0, html, js, fechaStr, timeStamp]
  );

  persistDatabase(db);

  return {
    success: true,
    fecha: fechaStr
  };
}

/**
 * Obtener todos los trabajos de un alumno (para armar la entrega final con el conjunto)
 */
export async function getTrabajosPorAlumno(dni) {
  const db = await getDatabase();
  const stmt = db.prepare('SELECT * FROM entregas_trabajos WHERE dni = :dni ORDER BY id ASC');
  stmt.bind({ ':dni': String(dni).trim() });

  const trabajos = [];
  while (stmt.step()) {
    trabajos.push(stmt.getAsObject());
  }
  stmt.free();
  return trabajos;
}

/**
 * Obtener todos los trabajos (para el panel del profesor)
 */
export async function getAllTrabajos() {
  const db = await getDatabase();
  const stmt = db.prepare('SELECT * FROM entregas_trabajos ORDER BY id DESC');
  const items = [];
  while (stmt.step()) {
    items.push(stmt.getAsObject());
  }
  stmt.free();
  return items;
}

/**
 * Obtener todos los accesos diarios (para el profesor)
 */
export async function getAllAccesos() {
  const db = await getDatabase();
  const stmt = db.prepare('SELECT * FROM registro_accesos ORDER BY id DESC');
  const items = [];
  while (stmt.step()) {
    items.push(stmt.getAsObject());
  }
  stmt.free();
  return items;
}

/**
 * Eliminar toda la base de datos (reset docente)
 */
export async function resetDatabase() {
  localStorage.removeItem(SQLITE_STORAGE_KEY);
  localStorage.removeItem(FALLBACK_STORAGE_KEY);
  dbInstance = null;
  const db = await getDatabase();
  return db;
}
