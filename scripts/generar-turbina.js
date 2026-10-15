// Genera public/models/turbina.glb: una turbina hidraulica tipo Francis
// (la misma familia que usan Itaipu y Acaray), con la carcasa y la
// tuberia transparentes para ver el agua y el rodete girando adentro, y
// un LED encendido representando la electricidad generada. No depende
// de Blender.

import { Document, NodeIO } from '@gltf-transform/core';
import { cilindro, caja, plano, esfera, aspaCurva } from './geometria.js';
import { agregarMalla, material, quatEjeAngulo, alinearEntrePuntos } from './gltf-utils.js';

const doc = new Document();
const buffer = doc.createBuffer();

const matEmbalse = material(doc, 'Embalse', [0.15, 0.45, 0.70, 1], { rugosidad: 0.1 });
const matTuboTransparente = material(doc, 'TuboTransparente', [0.75, 0.85, 0.95, 1], {
  rugosidad: 0.05, metalico: 0, transparente: true, alpha: 0.25, dobleCara: true,
});
const matAgua = material(doc, 'Agua', [0.15, 0.55, 0.85, 1], { rugosidad: 0.1 });
const matCarcasaTransparente = material(doc, 'CarcasaTransparente', [0.8, 0.85, 0.9, 1], {
  rugosidad: 0.08, metalico: 0, transparente: true, alpha: 0.2, dobleCara: true,
});
const matRodete = material(doc, 'Rodete', [0.78, 0.12, 0.10, 1], { rugosidad: 0.25, metalico: 0.5, dobleCara: true });
const matEje = material(doc, 'Eje', [0.6, 0.6, 0.63, 1], { rugosidad: 0.25, metalico: 0.8 });
const matGenerador = material(doc, 'Generador', [0.5, 0.5, 0.54, 1], { rugosidad: 0.35, metalico: 0.6 });
const matCobre = material(doc, 'Cobre', [0.72, 0.45, 0.2, 1], { rugosidad: 0.3, metalico: 0.7 });
const matCable = material(doc, 'Cable', [0.08, 0.08, 0.08, 1], { rugosidad: 0.6, metalico: 0 });
const matLED = material(doc, 'LED', [1, 0.95, 0.6, 1], {
  rugosidad: 0.1, metalico: 0, emisivo: [1, 0.85, 0.3],
});

const scene = doc.createScene('Escena');

function agregarNodo(nombre, geo, mat, { pos = [0, 0, 0], rot = null, padre = scene } = {}) {
  const malla = agregarMalla(doc, buffer, geo, mat, nombre);
  const nodo = doc.createNode(nombre).setMesh(malla).setTranslation(pos);
  if (rot) nodo.setRotation(rot);
  padre.addChild(nodo);
  return nodo;
}

// Embalse: superficie de agua representando la reserva aguas arriba
agregarNodo('Embalse', plano({ ancho: 0.5, profundidad: 0.5 }), matEmbalse, { pos: [-0.6, 1.08, 0] });

// Tuberia forzada: tubo transparente + un cilindro de agua azul adentro
const rotTuberia = quatEjeAngulo([0, 0, 1], (55 * Math.PI) / 180);
agregarNodo(
  'Tuberia_forzada',
  cilindro({ radioSup: 0.085, radioInf: 0.085, altura: 0.8, segmentos: 20 }),
  matTuboTransparente,
  { pos: [-0.35, 0.75, 0], rot: rotTuberia },
);
agregarNodo(
  'Agua_tuberia',
  cilindro({ radioSup: 0.065, radioInf: 0.065, altura: 0.78, segmentos: 20 }),
  matAgua,
  { pos: [-0.35, 0.75, 0], rot: rotTuberia },
);

// Carcasa espiral (voluta) transparente, para ver el rodete adentro
agregarNodo(
  'Carcasa_espiral',
  cilindro({ radioSup: 0.28, radioInf: 0.28, altura: 0.24, segmentos: 24 }),
  matCarcasaTransparente,
  { pos: [0, 0.35, 0] },
);

// Pivote de rotacion: rodete + aspas + eje + generador giran juntos
const pivote = doc.createNode('Pivote_rotacion').setTranslation([0, 0.35, 0]);
scene.addChild(pivote);

// Cubo central del rodete
agregarNodo(
  'Rodete_cubo',
  cilindro({ radioSup: 0.045, radioInf: 0.045, altura: 0.1, segmentos: 16 }),
  matRodete,
  { padre: pivote },
);

// 10 aspas curvas en espiral alrededor del cubo
const NUM_ASPAS = 10;
for (let i = 0; i < NUM_ASPAS; i++) {
  const ang = (i / NUM_ASPAS) * Math.PI * 2;
  agregarNodo(
    `Aspa_${i}`,
    aspaCurva({ radioInterno: 0.045, radioExterno: 0.17, alturaBlade: 0.085, anguloTwist: Math.PI / 2 }),
    matRodete,
    { padre: pivote, rot: quatEjeAngulo([0, 1, 0], ang) },
  );
}

// Eje: conecta el rodete con el generador
agregarNodo(
  'Eje',
  cilindro({ radioSup: 0.035, radioInf: 0.035, altura: 0.55, segmentos: 12 }),
  matEje,
  { padre: pivote, pos: [0, 0.33, 0] },
);

// Generador: carcasa del generador + anillo de cobre decorativo
agregarNodo(
  'Generador',
  cilindro({ radioSup: 0.2, radioInf: 0.2, altura: 0.3, segmentos: 24 }),
  matGenerador,
  { padre: pivote, pos: [0, 0.75, 0] },
);
agregarNodo(
  'Bobinado',
  cilindro({ radioSup: 0.13, radioInf: 0.13, altura: 0.08, segmentos: 24 }),
  matCobre,
  { padre: pivote, pos: [0, 0.75, 0] },
);

// Salida electrica: cable + LED encendido (fijo, no gira con el eje)
const puntoGenerador = [0.2, 0.35 + 0.75, 0];
const puntoLED = [0.4, 1.15, 0];
const { centro, rotacion, longitud } = alinearEntrePuntos(puntoGenerador, puntoLED);
agregarNodo(
  'Cable_salida',
  cilindro({ radioSup: 0.008, radioInf: 0.008, altura: longitud, segmentos: 8 }),
  matCable,
  { pos: centro, rot: rotacion },
);
agregarNodo('LED_salida', esfera({ radio: 0.04, segmentosLat: 8, segmentosLon: 12 }), matLED, { pos: puntoLED });

// Salida de agua (nivel inferior), aguas abajo de la carcasa
agregarNodo('Salida_de_agua', plano({ ancho: 0.5, profundidad: 0.4 }), matAgua, { pos: [0.55, 0.1, 0] });

// Animacion: una vuelta completa cada 2 segundos, en loop (model-viewer
// repite la animacion solo gracias al atributo "autoplay" del HTML).
const tiempos = new Float32Array([0, 0.5, 1.0, 1.5, 2.0]);
const quats = new Float32Array([
  ...quatEjeAngulo([0, 1, 0], 0),
  ...quatEjeAngulo([0, 1, 0], Math.PI / 2),
  ...quatEjeAngulo([0, 1, 0], Math.PI),
  ...quatEjeAngulo([0, 1, 0], (3 * Math.PI) / 2),
  ...quatEjeAngulo([0, 1, 0], 2 * Math.PI),
]);

const inputAccessor = doc.createAccessor('tiempos').setType('SCALAR').setArray(tiempos).setBuffer(buffer);
const outputAccessor = doc.createAccessor('rotaciones').setType('VEC4').setArray(quats).setBuffer(buffer);

const sampler = doc.createAnimationSampler()
  .setInput(inputAccessor)
  .setOutput(outputAccessor)
  .setInterpolation('LINEAR');

const canal = doc.createAnimationChannel()
  .setTargetNode(pivote)
  .setTargetPath('rotation')
  .setSampler(sampler);

doc.createAnimation('Girar').addChannel(canal).addSampler(sampler);

doc.getRoot().setDefaultScene(scene);

const io = new NodeIO();
await io.write('public/models/turbina.glb', doc);
console.log('Exportado: public/models/turbina.glb');
