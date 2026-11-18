extends Node
## Demo (sólo en la copia web): sustituye al modo demo/producción del juego.
##
## El de verdad abre la pausa con la piel del juego y sus opciones guardadas, que
## no viajan a la web (build.sh borra el juego en desarrollo de la copia). Aquí
## queda lo que usan los planos del laboratorio: el modo nunca está activo, las
## capas de diagnóstico vuelven a su valor de fábrica al montar un plano, y
## «volver al menú» lleva a `home` (el arranque web, que reinicia el minijuego).

signal changed(active: bool)

## Capas de diagnóstico que el modo demo apagaría (aquí, a su valor de fábrica).
const DEV_OVERLAYS: Array[StringName] = [&"trajectory", &"debug_overlay", &"death_map"]

var active := false
var production := false
var home := "res://web/boot.tscn"
var player := ""
var paused := false


func apply() -> void:
	for def: Dictionary in Lab.defs():
		if def.id in DEV_OVERLAYS:
			Lab.set_flag(def.id, def.default)


func blocks(_event: InputEvent) -> bool:
	return false


func menu_scene() -> String:
	return home
