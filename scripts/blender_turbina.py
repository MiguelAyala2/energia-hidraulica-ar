"""
Genera un modelo low-poly inicial de una turbina hidraulica tipo Francis
(tuberia forzada, carcasa, rodete con alabes, eje y generador), con el
rodete + eje + generador animados girando en loop, y lo exporta a
public/models/turbina.glb

Como correrlo:
  1. Abrir Blender -> pestana "Scripting" -> Open -> elegir este archivo -> Alt+P
  2. O sin abrir la interfaz (desde la raiz del repo):
     blender --background --python scripts/blender_turbina.py

El resultado es un bloque de formas simples para arrancar. Despues, en la
interfaz de Blender, se puede afinar la forma del rodete, agregar textura
de metal, suavizar la carcasa, etc.
"""

import math
import os

import bpy

FPS = 24
FRAMES = 48  # una vuelta completa cada 2 segundos


def limpiar_escena():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def material(nombre, color_rgba, rugosidad=0.35):
    mat = bpy.data.materials.new(nombre)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color_rgba
    bsdf.inputs["Roughness"].default_value = rugosidad
    return mat


def construir_turbina():
    mat_tuberia = material("Tuberia", (0.25, 0.45, 0.75, 1))
    mat_carcasa = material("Carcasa", (0.55, 0.55, 0.58, 1))
    mat_rodete = material("Rodete", (0.85, 0.45, 0.10, 1))
    mat_eje = material("Eje", (0.15, 0.15, 0.17, 1))
    mat_generador = material("Generador", (0.65, 0.10, 0.10, 1))

    # Tuberia forzada: trae el agua desde la represa hacia la turbina
    bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=0.8, location=(-0.35, 0, 0.75))
    tuberia = bpy.context.object
    tuberia.rotation_euler = (math.radians(55), 0, 0)
    tuberia.data.materials.append(mat_tuberia)
    tuberia.name = "Tuberia_forzada"

    # Carcasa espiral (voluta) que envuelve el rodete
    bpy.ops.mesh.primitive_cylinder_add(radius=0.26, depth=0.22, location=(0, 0, 0.35))
    carcasa = bpy.context.object
    carcasa.data.materials.append(mat_carcasa)
    carcasa.name = "Carcasa_espiral"

    # Eje: conecta el rodete con el generador
    bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=0.55, location=(0, 0, 0.68))
    eje = bpy.context.object
    eje.data.materials.append(mat_eje)
    eje.name = "Eje"

    # Rodete: disco central
    bpy.ops.mesh.primitive_cylinder_add(radius=0.16, depth=0.08, location=(0, 0, 0.35))
    rodete = bpy.context.object
    rodete.data.materials.append(mat_rodete)
    rodete.name = "Rodete"

    # Alabes del rodete, distribuidos en circulo
    alabes = []
    for i in range(8):
        ang = (2 * math.pi / 8) * i
        x = 0.16 * math.cos(ang)
        y = 0.16 * math.sin(ang)
        bpy.ops.mesh.primitive_cube_add(size=0.12, location=(x, y, 0.35))
        pala = bpy.context.object
        pala.scale = (0.02, 0.09, 0.09)
        pala.rotation_euler = (0, 0, ang)
        pala.data.materials.append(mat_rodete)
        pala.name = f"Alabe_{i}"
        alabes.append(pala)

    # Generador: carcasa cilindrica sobre el eje
    bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=0.3, location=(0, 0, 1.1))
    generador = bpy.context.object
    generador.data.materials.append(mat_generador)
    generador.name = "Generador"

    # Pivote de rotacion: rodete + alabes + eje + generador giran juntos
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0.35))
    pivote = bpy.context.object
    pivote.name = "Pivote_rotacion"

    for obj in [rodete, eje, generador] + alabes:
        obj.parent = pivote
        obj.matrix_parent_inverse = pivote.matrix_world.inverted()

    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = FRAMES
    bpy.context.scene.render.fps = FPS

    pivote.rotation_euler = (0, 0, 0)
    pivote.keyframe_insert(data_path="rotation_euler", index=2, frame=1)
    pivote.rotation_euler = (0, 0, math.radians(360))
    pivote.keyframe_insert(data_path="rotation_euler", index=2, frame=FRAMES)

    for fcurve in pivote.animation_data.action.fcurves:
        for kp in fcurve.keyframe_points:
            kp.interpolation = 'LINEAR'


def exportar(ruta_salida):
    os.makedirs(os.path.dirname(ruta_salida), exist_ok=True)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=ruta_salida,
        export_format='GLB',
        use_selection=False,
        export_animations=True,
        export_yup=True,
    )
    print(f"Exportado: {ruta_salida}")


if __name__ == "__main__":
    limpiar_escena()
    construir_turbina()
    exportar(os.path.join("public", "models", "turbina.glb"))
