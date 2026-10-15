"""
Genera un modelo low-poly inicial de la represa de Itaipu (embalse, cuerpo
de la presa, vertedero, casa de maquinas y rio aguas abajo) y lo exporta a
public/models/itaipu.glb

Como correrlo: igual que scripts/blender_turbina.py (ver ese archivo).

Es un bloque de formas simples para arrancar. Despues, en la interfaz de
Blender, se puede dar forma real a la presa (no un cubo liso), agregar
torres de transmision, texturizar el concreto, animar el agua del
vertedero, etc.
"""

import os

import bpy


def limpiar_escena():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(nombre, color_rgba, metalico=0.0, rugosidad=0.6):
    mat = bpy.data.materials.new(nombre)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color_rgba
    bsdf.inputs["Metallic"].default_value = metalico
    bsdf.inputs["Roughness"].default_value = rugosidad
    return mat


def construir_itaipu():
    mat_concreto = material("Concreto", (0.72, 0.71, 0.68, 1))
    mat_agua = material("Agua", (0.15, 0.40, 0.55, 1), rugosidad=0.15)
    mat_casa_maquinas = material("CasaMaquinas", (0.80, 0.35, 0.15, 1))
    mat_vertedero = material("Vertedero", (0.85, 0.85, 0.85, 1))

    # Embalse: agua acumulada aguas arriba de la presa
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -0.9, 0.02))
    embalse = bpy.context.object
    embalse.scale = (1.2, 0.7, 1)
    embalse.data.materials.append(mat_agua)
    embalse.name = "Embalse"

    # Cuerpo principal de la presa
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.25))
    presa = bpy.context.object
    presa.scale = (1.2, 0.15, 0.25)
    presa.data.materials.append(mat_concreto)
    presa.name = "Presa_principal"

    # Vertedero: seccion mas baja por donde se libera agua excedente
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.5, 0, 0.15))
    vertedero = bpy.context.object
    vertedero.scale = (0.22, 0.17, 0.15)
    vertedero.data.materials.append(mat_vertedero)
    vertedero.name = "Vertedero"

    # Casa de maquinas: contiene las turbinas y generadores
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.2, 0.1))
    casa = bpy.context.object
    casa.scale = (1.1, 0.12, 0.1)
    casa.data.materials.append(mat_casa_maquinas)
    casa.name = "Casa_de_maquinas"

    # Rio aguas abajo
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.6, 0.01))
    rio = bpy.context.object
    rio.scale = (1.2, 0.6, 1)
    rio.data.materials.append(mat_agua)
    rio.name = "Rio_aguas_abajo"


def exportar(ruta_salida):
    os.makedirs(os.path.dirname(ruta_salida), exist_ok=True)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=ruta_salida,
        export_format='GLB',
        use_selection=False,
        export_yup=True,
    )
    print(f"Exportado: {ruta_salida}")


if __name__ == "__main__":
    limpiar_escena()
    construir_itaipu()
    exportar(os.path.join("public", "models", "itaipu.glb"))
