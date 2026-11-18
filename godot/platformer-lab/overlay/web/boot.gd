extends Node
## Escena de arranque de la versión web: abre el plano que pidió la URL, de fábrica.
## «Volver al menú» (desde el laboratorio) vuelve aquí: reinicia el minijuego.


func _ready() -> void:
	Main.fresh_start = true
	Demo.home = WebLab.BOOT_SCENE
	get_tree().change_scene_to_file.call_deferred(WebLab.scene())
