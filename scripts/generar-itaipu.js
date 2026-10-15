// Genera public/models/itaipu.glb: version simplificada de una represa
// binacional tipo Itaipu (embalse, cuerpo de la presa, vertedero, casa
// de maquinas y rio aguas abajo). No depende de Blender.

import { Document, NodeIO } from '@gltf-transform/core';
import { caja, plano } from './geometria.js';
import { agregarMalla, material } from './gltf-utils.js';

const doc = new Document();
const buffer = doc.createBuffer();

const matConcreto = material(doc, 'Concreto', [0.72, 0.71, 0.68, 1], { rugosidad: 0.7, metalico: 0.05 });
const matAgua = material(doc, 'Agua', [0.15, 0.40, 0.55, 1], { rugosidad: 0.15, metalico: 0 });
const matCasaMaquinas = material(doc, 'CasaMaquinas', [0.80, 0.35, 0.15, 1], { rugosidad: 0.5, metalico: 0.1 });
const matVertedero = material(doc, 'Vertedero', [0.85, 0.85, 0.85, 1], { rugosidad: 0.6, metalico: 0.05 });

const scene = doc.createScene('Escena');

function agregarBloque(nombre, geo, mat, pos) {
  const malla = agregarMalla(doc, buffer, geo, mat, nombre);
  const nodo = doc.createNode(nombre).setMesh(malla).setTranslation(pos);
  scene.addChild(nodo);
  return nodo;
}

// Embalse: agua acumulada aguas arriba de la presa
agregarBloque(
  'Embalse',
  plano({ ancho: 2.4, profundidad: 1.4 }),
  matAgua,
  [0, 0.02, -0.9],
);

// Cuerpo principal de la presa
agregarBloque(
  'Presa_principal',
  caja({ ancho: 2.4, alto: 0.5, profundidad: 0.3 }),
  matConcreto,
  [0, 0.25, 0],
);

// Vertedero: seccion por donde se libera el agua excedente
agregarBloque(
  'Vertedero',
  caja({ ancho: 0.44, alto: 0.3, profundidad: 0.34 }),
  matVertedero,
  [0.5, 0.15, 0],
);

// Casa de maquinas: contiene las turbinas y generadores
agregarBloque(
  'Casa_de_maquinas',
  caja({ ancho: 2.2, alto: 0.2, profundidad: 0.24 }),
  matCasaMaquinas,
  [0, 0.1, 0.22],
);

// Rio aguas abajo
agregarBloque(
  'Rio_aguas_abajo',
  plano({ ancho: 2.4, profundidad: 1.2 }),
  matAgua,
  [0, 0.01, 0.6],
);

doc.getRoot().setDefaultScene(scene);

const io = new NodeIO();
await io.write('public/models/itaipu.glb', doc);
console.log('Exportado: public/models/itaipu.glb');
