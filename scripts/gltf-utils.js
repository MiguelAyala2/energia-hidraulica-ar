// Utilidades para armar nodos glTF con @gltf-transform/core sin depender
// de ningun motor 3D externo.

export function quatEjeAngulo(eje, anguloRad) {
  const [x, y, z] = eje;
  const s = Math.sin(anguloRad / 2);
  return [x * s, y * s, z * s, Math.cos(anguloRad / 2)];
}

// Rotacion + punto medio + longitud necesarios para que un cilindro
// (cuyo eje largo es Y) quede alineado entre dos puntos cualquiera.
export function alinearEntrePuntos(p1, p2) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const dz = p2[2] - p1[2];
  const longitud = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const dir = [dx / longitud, dy / longitud, dz / longitud];
  const up = [0, 1, 0];

  const ejeX = up[1] * dir[2] - up[2] * dir[1];
  const ejeY = up[2] * dir[0] - up[0] * dir[2];
  const ejeZ = up[0] * dir[1] - up[1] * dir[0];
  const ejeLen = Math.sqrt(ejeX * ejeX + ejeY * ejeY + ejeZ * ejeZ);
  const dot = Math.min(1, Math.max(-1, up[0] * dir[0] + up[1] * dir[1] + up[2] * dir[2]));
  const angulo = Math.acos(dot);

  let rotacion;
  if (ejeLen < 1e-6) {
    rotacion = dot > 0 ? [0, 0, 0, 1] : quatEjeAngulo([1, 0, 0], Math.PI);
  } else {
    rotacion = quatEjeAngulo([ejeX / ejeLen, ejeY / ejeLen, ejeZ / ejeLen], angulo);
  }

  const centro = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, (p1[2] + p2[2]) / 2];
  return { centro, rotacion, longitud };
}

export function agregarMalla(doc, buffer, geo, material, nombre) {
  const posAccessor = doc
    .createAccessor(`${nombre}_pos`)
    .setType('VEC3')
    .setArray(geo.positions)
    .setBuffer(buffer);

  const normAccessor = doc
    .createAccessor(`${nombre}_norm`)
    .setType('VEC3')
    .setArray(geo.normals)
    .setBuffer(buffer);

  const idxAccessor = doc
    .createAccessor(`${nombre}_idx`)
    .setType('SCALAR')
    .setArray(geo.indices)
    .setBuffer(buffer);

  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', posAccessor)
    .setAttribute('NORMAL', normAccessor)
    .setIndices(idxAccessor)
    .setMaterial(material);

  return doc.createMesh(nombre).addPrimitive(prim);
}

export function material(doc, nombre, baseColorRGBA, opciones = {}) {
  const {
    rugosidad = 0.4,
    metalico = 0.1,
    transparente = false,
    alpha = 0.3,
    dobleCara = false,
    emisivo = null,
  } = opciones;

  const mat = doc
    .createMaterial(nombre)
    .setBaseColorFactor(baseColorRGBA)
    .setRoughnessFactor(rugosidad)
    .setMetallicFactor(metalico);

  if (transparente) {
    mat.setAlphaMode('BLEND');
    mat.setBaseColorFactor([baseColorRGBA[0], baseColorRGBA[1], baseColorRGBA[2], alpha]);
  }

  if (dobleCara) {
    mat.setDoubleSided(true);
  }

  if (emisivo) {
    mat.setEmissiveFactor(emisivo);
  }

  return mat;
}
