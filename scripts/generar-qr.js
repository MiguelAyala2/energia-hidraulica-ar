import QRCode from 'qrcode';
import { mkdirSync } from 'fs';

// Reemplazar por la URL real una vez desplegado el sitio (ver despliegue.md)
const BASE_URL = 'https://TU-PROYECTO.vercel.app';

const paginas = [
  { nombre: 'qr-motor', ruta: '/motor-hidraulico.html' },
  { nombre: 'qr-itaipu', ruta: '/itaipu.html' },
];

mkdirSync('assets/img', { recursive: true });

for (const { nombre, ruta } of paginas) {
  const url = `${BASE_URL}${ruta}`;
  const destino = `assets/img/${nombre}.png`;
  await QRCode.toFile(destino, url, { width: 600, margin: 2 });
  console.log(`✔ ${destino} -> ${url}`);
}
