// Genera public/models/turbina.glb: una turbina hidraulica tipo Francis
// (la misma familia que usan Itaipu y Acaray) con el rodete + eje +
// generador animados girando en loop. No depende de Blender.

import { Document, NodeIO } from '@gltf-transform/core';
import { cilindro, caja } from './geometria.js';
import { agregarMalla, material, quatEjeAngulo } from './gltf-utils.js';

const doc = new Document();
const buffer = doc.createBuffer();

const matTuberia = material(doc, 'Tuberia', [0.25, 0.45, 0.75, 1]);
const matCarcasa = material(doc, 'Carcasa', [0.55, 0.55, 0.58, 1], 0.5, 0.6);
const matRodete = material(doc, 'Rodete', [0.85, 0.45, 0.10, 1], 0.3, 0.7);
const matEje = material(doc, 'Eje', [0.15, 0.15, 0.17, 1], 0.3, 0.8);
const matGenerador = material(doc, 'Generador', [0.65, 0.10, 0.10, 1], 0.4, 0.3);

const scene = doc.createScene('Escena');

// Tuberia forzada: trae el agua desde la represa, inclinada
const mallaTuberia = agregarMalla(
  doc, buffer,
  cilindro({ radioSup: 0.07, radioInf: 0.07, altura: 0.8, segmentos: 20 }),
  matTuberia, 'Tuberia_forzada',
);
const nodoTuberia = doc.createNode('Tuberia_forzada')
  .setMesh(mallaTuberia)
  .setTranslation([-0.35, 0.75, 0])
  .setRotation(quatEjeAngulo([0, 0, 1], (55 * Math.PI) / 180));
scene.addChild(nodoTuberia);

// Carcasa espiral (voluta) que envuelve el rodete
const mallaCarcasa = agregarMalla(
  doc, buffer,
  cilindro({ radioSup: 0.26, radioInf: 0.26, altura: 0.22, segmentos: 24 }),
  matCarcasa, 'Carcasa_espiral',
);
const nodoCarcasa = doc.createNode('Carcasa_espiral')
  .setMesh(mallaCarcasa)
  .setTranslation([0, 0.35, 0]);
scene.addChild(nodoCarcasa);

// Pivote de rotacion: cuelgan de el el rodete, los alabes, el eje y el
// generador, para que giren todos juntos (eje vertical, igual que en una
// turbina real).
const pivote = doc.createNode('Pivote_rotacion').setTranslation([0, 0.35, 0]);
scene.addChild(pivote);

const mallaRodete = agregarMalla(
  doc, buffer,
  cilindro({ radioSup: 0.16, radioInf: 0.16, altura: 0.08, segmentos: 24 }),
  matRodete, 'Rodete',
);
const nodoRodete = doc.createNode('Rodete').setMesh(mallaRodete).setTranslation([0, 0, 0]);
pivote.addChild(nodoRodete);

for (let i = 0; i < 8; i++) {
  const ang = (i / 8) * Math.PI * 2;
  const x = 0.16 * Math.cos(ang);
  const z = 0.16 * Math.sin(ang);
  const mallaAlabe = agregarMalla(
    doc, buffer,
    caja({ ancho: 0.02, alto: 0.09, profundidad: 0.09 }),
    matRodete, `Alabe_${i}`,
  );
  const nodoAlabe = doc.createNode(`Alabe_${i}`)
    .setMesh(mallaAlabe)
    .setTranslation([x, 0, z])
    .setRotation(quatEjeAngulo([0, 1, 0], ang));
  pivote.addChild(nodoAlabe);
}

const mallaEje = agregarMalla(
  doc, buffer,
  cilindro({ radioSup: 0.035, radioInf: 0.035, altura: 0.55, segmentos: 12 }),
  matEje, 'Eje',
);
const nodoEje = doc.createNode('Eje').setMesh(mallaEje).setTranslation([0, 0.33, 0]);
pivote.addChild(nodoEje);

const mallaGenerador = agregarMalla(
  doc, buffer,
  cilindro({ radioSup: 0.2, radioInf: 0.2, altura: 0.3, segmentos: 24 }),
  matGenerador, 'Generador',
);
const nodoGenerador = doc.createNode('Generador').setMesh(mallaGenerador).setTranslation([0, 0.75, 0]);
pivote.addChild(nodoGenerador);

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
