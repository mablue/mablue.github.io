# blender_export.py — Run with: blender --background --python blender_export.py
import bpy, math

# Clean scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Camera
bpy.ops.object.camera_add(location=(0, -20, 15), rotation=(math.radians(60), 0, 0))
bpy.context.scene.camera = bpy.context.object

# Light
bpy.ops.object.light_add(type='SUN', location=(5, -5, 10))

# Sun
bpy.ops.mesh.primitive_uv_sphere_add(radius=2, location=(0, 0, 0))
bpy.context.object.name = "Sun"

# Planets
planets = [
    ("Mercury", 5, 0.3, (0.7, 0.7, 0.7, 1)),
    ("Venus", 7, 0.5, (0.9, 0.8, 0.6, 1)),
    ("Earth", 9, 0.6, (0.3, 0.5, 0.9, 1)),
    ("Mars", 11, 0.45, (0.8, 0.3, 0.2, 1)),
    ("Jupiter", 14, 1.0, (0.8, 0.7, 0.5, 1)),
]

for name, dist, size, color in planets:
    bpy.ops.mesh.primitive_uv_sphere_add(radius=size, location=(dist, 0, 0))
    planet = bpy.context.object
    planet.name = name
    mat = bpy.data.materials.new(name=f"{name}_Mat")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
    planet.data.materials.append(mat)

    # Orbit pivot
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    pivot = bpy.context.object
    pivot.name = f"Orbit_{name}"
    planet.parent = pivot

    # Orbit animation
    pivot.rotation_euler = (0, 0, 0)
    pivot.keyframe_insert(data_path="rotation_euler", frame=1)
    pivot.rotation_euler = (0, 0, math.radians(360))
    pivot.keyframe_insert(data_path="rotation_euler", frame=250)

bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 250

bpy.ops.export_scene.gltf(
    filepath="solar_system.glb",
    export_format='GLB',
    export_animations=True,
    export_frame_range=True,
    export_apply=True,
)
print("✅ Exported solar_system.glb")
