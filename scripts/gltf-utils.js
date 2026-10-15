// Utilidades para armar nodos glTF con @gltf-transform/core sin depender
// de ningun motor 3D externo.

export function quatEjeAngulo(eje, anguloRad) {
  const [x, y, z] = eje;
  const s = Math.sin(anguloRad / 2);
  return [x * s, y * s, z * s, Math.cos(anguloRad / 2)];
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

export function material(doc, nombre, [r, g, b, a], rugosidad = 0.4, metalico = 0.1) {
  return doc
    .createMaterial(nombre)
    .setBaseColorFactor([r, g, b, a])
    .setRoughnessFactor(rugosidad)
    .setMetallicFactor(metalico);
}
