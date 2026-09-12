import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture(url, outputPath, width = 1400, height = 900) {
  console.log(`Iniciando captura de: ${url} -> ${outputPath}`);
  const port = 9222 + Math.floor(Math.random() * 100);
  const userDataDir = path.join(process.env.TEMP, `edge_cdp_${port}`);

  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${width},${height}`,
    'about:blank'
  ]);

  // Esperar a que el puerto de depuración esté listo
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    edge.kill();
    throw new Error('No se pudo conectar con Edge CDP');
  }

  // Crear una nueva página (tab)
  const tabRes = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
  const tabData = await tabRes.json();
  const pageWs = new WebSocket(tabData.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    pageWs.on('open', resolve);
    pageWs.on('error', reject);
  });

  let msgId = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id === id) {
          pageWs.off('message', handler);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
      pageWs.on('message', handler);
      pageWs.send(JSON.stringify({ id, method, params }));
    });
  };

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1.5,
    mobile: false
  });

  await send('Page.navigate', { url });
  // Esperar a que cargue y resuelvan las llamadas fetch de React
  await sleep(3000);

  const screenshotResult = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });

  fs.writeFileSync(outputPath, Buffer.from(screenshotResult.data, 'base64'));
  console.log(`✅ Captura guardada con éxito: ${outputPath}`);

  pageWs.close();
  edge.kill();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch (e) {}
}

async function main() {
  const screenshots = [
    {
      url: 'http://localhost:5173/?tab=centro',
      output: path.resolve('..', 'docs_images', 'pantalla_1_torniquete.png'),
      width: 1400,
      height: 1050
    },
    {
      url: 'http://localhost:5173/?tab=dueno',
      output: path.resolve('..', 'docs_images', 'pantalla_2_dueno_portal.png'),
      width: 1400,
      height: 1050
    },
    {
      url: 'http://localhost:5173/?view=mobile',
      output: path.resolve('..', 'docs_images', 'pantalla_2_dueno_mobile.png'),
      width: 440,
      height: 920
    },
    {
      url: 'http://localhost:5173/?tab=monitor',
      output: path.resolve('..', 'docs_images', 'pantalla_3_topologia_red.png'),
      width: 1400,
      height: 1000
    }
  ];

  for (const s of screenshots) {
    try {
      await capture(s.url, s.output, s.width, s.height);
    } catch (err) {
      console.error(`Error en ${s.output}:`, err);
    }
  }
}

main();
