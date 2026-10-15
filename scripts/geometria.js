// Generadores de geometria basica (cilindro y caja) para armar mallas
// de glTF a mano, sin depender de Blender ni de ningun motor 3D.

export function cilindro({ radioSup = 0.2, radioInf = 0.2, altura = 1, segmentos = 24 }) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let i = 0; i <= segmentos; i++) {
    const t = i / segmentos;
    const ang = t * Math.PI * 2;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);

    positions.push(cos * radioSup, altura / 2, sin * radioSup);
    normals.push(cos, 0, sin);

    positions.push(cos * radioInf, -altura / 2, sin * radioInf);
    normals.push(cos, 0, sin);
  }

  for (let i = 0; i < segmentos; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, b, c, b, d, c);
  }

  // tapas
  const centroSupIdx = positions.length / 3;
  positions.push(0, altura / 2, 0);
  normals.push(0, 1, 0);
  const centroInfIdx = centroSupIdx + 1;
  positions.push(0, -altura / 2, 0);
  normals.push(0, -1, 0);

  for (let i = 0; i < segmentos; i++) {
    const ang = (i / segmentos) * Math.PI * 2;
    const angSig = ((i + 1) / segmentos) * Math.PI * 2;
    positions.push(Math.cos(ang) * radioSup, altura / 2, Math.sin(ang) * radioSup);
    normals.push(0, 1, 0);
    const idxA = positions.length / 3 - 1;
    positions.push(Math.cos(angSig) * radioSup, altura / 2, Math.sin(angSig) * radioSup);
    normals.push(0, 1, 0);
    const idxB = positions.length / 3 - 1;
    indices.push(centroSupIdx, idxB, idxA);
  }

  for (let i = 0; i < segmentos; i++) {
    const ang = (i / segmentos) * Math.PI * 2;
    const angSig = ((i + 1) / segmentos) * Math.PI * 2;
    positions.push(Math.cos(ang) * radioInf, -altura / 2, Math.sin(ang) * radioInf);
    normals.push(0, -1, 0);
    const idxA = positions.length / 3 - 1;
    positions.push(Math.cos(angSig) * radioInf, -altura / 2, Math.sin(angSig) * radioInf);
    normals.push(0, -1, 0);
    const idxB = positions.length / 3 - 1;
    indices.push(centroInfIdx, idxA, idxB);
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
  };
}

export function caja({ ancho = 1, alto = 1, profundidad = 1 }) {
  const x = ancho / 2;
  const y = alto / 2;
  const z = profundidad / 2;

  // 6 caras x 4 vertices, normales planas
  const caras = [
    { n: [0, 0, 1], v: [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]] },
    { n: [0, 0, -1], v: [[x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z]] },
    { n: [0, 1, 0], v: [[-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z]] },
    { n: [0, -1, 0], v: [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]] },
    { n: [1, 0, 0], v: [[x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z]] },
    { n: [-1, 0, 0], v: [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]] },
  ];

  const positions = [];
  const normals = [];
  const indices = [];

  caras.forEach((cara, i) => {
    cara.v.forEach((v) => {
      positions.push(...v);
      normals.push(...cara.n);
    });
    const base = i * 4;
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
  };
}

export function plano({ ancho = 1, profundidad = 1 }) {
  return caja({ ancho, alto: 0.01, profundidad });
}
