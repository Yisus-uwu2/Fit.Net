# 🏋️‍♂️ Fit.Net - Sistema de Base de Datos Distribuida (BDD)
### Tema: Distribución e Integración • 7mo Semestre de Ingeniería en Sistemas

---

## 📌 Caso Práctico
**"Fit.Net"** es una cadena de gimnasios con dos sucursales:
* **Sucursal Centro:** Rango de socios IDs `1-100`.
* **Sucursal Norte:** Rango de socios IDs `101-200`.

### 1. Problema de Distribución (Autonomía Local)
Cada sucursal tiene un torniquete en la entrada donde los clientes pasan su tarjeta. La validación y el cobro deben ser instantáneos sin depender de la nube. Cada sucursal almacena y consulta sus datos localmente (`centro.db` y `norte.db`). Si se cae internet, la sucursal continúa cobrando y registrando accesos (Autonomía Local).

### 2. Problema de Integración (Visión Global)
El dueño de la franquicia necesita abrir una aplicación en su celular y ver en tiempo real los ingresos consolidados totales generados hoy entre todas las sucursales ($ Centro + $ Norte).

---

## 🎨 Sistema de Diseño: Neo-Luna (Windows XP + Frutiger Aero)
* **Estética:** Barras de título clásicas de Windows XP Luna, botones táctiles de gelatina, efectos de sonido sintetizados en Web Audio API (Ding, Chord, Click) y tarjetas translúcidas de cristal esmerilado (*glassmorphism*).

---

## 🚀 Instalación y Puesta en Marcha

### Requisitos Previos:
* Node.js v18 o superior (v20+ recomendado).
* Navegador moderno.

### Pasos de Ejecución:

1. **Instalar dependencias de todo el proyecto:**
   ```bash
   npm run install:all
   ```

2. **Poblar las bases de datos locales (Seed):**
   ```bash
   npm run seed
   ```
   *Esto generará automáticamente `database/centro.db` (20 socios de prueba IDs 1-20) y `database/norte.db` (20 socios de prueba IDs 101-120).*

3. **Iniciar Servidor y Cliente en paralelo:**
   ```bash
   npm run dev
   ```
   * Servidor Backend (API + WebSockets): `http://localhost:4000`
   * Aplicación Web (Frontend): `http://localhost:5173`

4. **Para probar en tu Celular (Celular del Dueño):**
   Asegúrate de estar en la misma red Wi-Fi y abre la IP local que Vite muestra en consola (ej. `http://192.168.1.X:5173`).

---

## 📂 Arquitectura de Directorios

```text
Fit.Net/
├── client/                     # Frontend React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── xp/             # Componentes Windows XP (XpWindow, GelButton, etc.)
│   │   │   └── views/          # Pantallas (Centro, Norte, Dueño, Monitor, Reporte)
│   │   ├── services/           # Conexión API y WebSockets
│   │   └── utils/              # Sintetizador Web Audio de sonidos XP
├── server/                     # Backend Node.js + Express + WebSockets
│   ├── database/               # Bases de datos físicas SQLite (centro.db, norte.db, central.db)
│   ├── src/
│   │   ├── config/             # Constantes, rangos de sucursales y tarifas
│   │   ├── database/           # Inicializador de esquemas y seed
│   │   ├── repositories/       # Consultas parametrizadas (Prepared Statements)
│   │   ├── services/           # Lógica de negocio (Torniquetes, Sync, Integración)
│   │   └── server.js           # API REST y Servidor WebSocket
└── package.json                # Orquestador del monorepo
```

---

## 🛡️ Seguridad y Buenas Prácticas Implementadas
1. **Prepared Statements Obligatorios:** Prevención total contra SQL Injection en SQLite y Supabase.
2. **Restricciones CHECK a Nivel Motor:** Las tablas SQLite tienen `CHECK(id BETWEEN 1 AND 100)` para forzar la fragmentación horizontal por hardware/motor.
3. **Anti-Repass Rate Limiting:** Cooldown de 3 segundos por socio para evitar cobros dobles accidentales al pasar la tarjeta.
4. **Cola de Sincronización Resiliente:** Si el enlace de red se cae, los accesos se guardan en la base local con `sincronizado = 0`. Al restablecerse la red, se sincronizan automáticamente.
