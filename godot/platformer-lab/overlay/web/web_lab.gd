extends Node
## WebLab (autoload) — sólo existe en la copia que exporta el blog, nunca en el juego.
##
## Lee la URL de la página que incrusta el juego y decide qué abrir:
##   ?plano=plataformas&lamina=coyote          una lámina
##   ?plano=plataformas&lamina=coyote,buffer   varias, en el orden del plano
##   (sin lamina)                              el plano entero
## Cada lámina ya aísla una técnica con su bandera (tecla T), así que un
## minijuego del blog = un plano con una sola lámina.

const PLANES := {
	"plataformas": "res://game/main.tscn",
	"combate": "res://game/combat/combat_main.tscn",
}
const BOOT_SCENE := "res://web/boot.tscn"

var plane := "plataformas"
var sheets: Array[StringName] = []
## La página pidió menos movimiento (`prefers-reduced-motion`): sin temblor de
## pantalla de entrada. Se puede volver a encender en el laboratorio (Tab).
var reduce_motion := false
## `piloto=1`: la lámina se juega sola (ver `pilot.gd`) hasta que el lector se mueve.
var pilot_wanted := false
## `tactil=1`: los botones táctiles se ven desde el principio (si no, al primer toque).
var touch_wanted := false
## `video=1`: se está grabando el video del blog (`record.mjs`): el piloto juega,
## sin rótulo ni botones táctiles, y espera un momento quieto antes de arrancar.
var video_mode := false
## Idioma de los rótulos que añade la web (el juego en sí está en español).
var lang := "es"
## El lector ya tomó el control: el piloto no vuelve aunque se reinicie la escena.
var taken_over := false
var _pilot: Node
var _numbers := {}   # id de lámina → su número en el plano entero


func _enter_tree() -> void:
	var query := _query()
	var asked: String = query.get("plano", "")
	if PLANES.has(asked):
		plane = asked
	for id: String in String(query.get("lamina", "")).split(",", false):
		sheets.append(StringName(id.strip_edges()))
	reduce_motion = query.get("reducir", "") == "1"
	pilot_wanted = query.get("piloto", "") == "1"
	touch_wanted = query.get("tactil", "") == "1"
	video_mode = query.get("video", "") == "1"
	lang = "en" if query.get("lang", "") == "en" else "es"


func _ready() -> void:
	# En la web no se graba nada: ni partidas ni historial de caídas.
	Telemetry.enabled = false
	_font_fallbacks()
	get_tree().scene_changed.connect(_on_scene_changed)
	if video_mode:
		_ignore_gamepads()


## Grabando: el navegador ve cualquier mando conectado al ordenador (aunque sea
## sin ventana), y un mando en uso le quitaría el control al piloto o cambiaría los
## glifos del marcador. Fuera los mandos de todas las acciones, y sus eventos no
## llegan a nadie (este autoload es el último: recibe `_input` antes que los demás).
func _ignore_gamepads() -> void:
	for action: StringName in InputMap.get_actions():
		for event: InputEvent in InputMap.action_get_events(action):
			if event is InputEventJoypadButton or event is InputEventJoypadMotion:
				InputMap.action_erase_event(action, event)


func _input(event: InputEvent) -> void:
	if video_mode and (event is InputEventJoypadButton or event is InputEventJoypadMotion):
		get_viewport().set_input_as_handled()


## Cada plano restablece las banderas de fábrica al montarse; esto va después.
func _on_scene_changed() -> void:
	if reduce_motion:
		Lab.set_flag(&"juice_shake", false)
	var main := get_tree().current_scene as Main
	if main == null:
		return
	var layer := CanvasLayer.new()
	layer.layer = 60
	main.add_child(layer)
	if not video_mode:
		var pad: Control = preload("res://web/touch_pad.gd").new()
		layer.add_child(pad)
		pad.setup(main, touch_wanted)
	if pilot_wanted and not taken_over and _has_choreography():
		_pilot = preload("res://web/pilot.gd").new()
		main.add_child(_pilot)
		_pilot.setup(main)
		if video_mode:
			_pilot.start_delay = 0.8
		else:
			var banner: Control = preload("res://web/banner.gd").new()
			layer.add_child(banner)
			_pilot.banner = banner


func _has_choreography() -> bool:
	var supported: Array[StringName] = preload("res://web/pilot.gd").SUPPORTED
	for id: StringName in sheets:
		if id in supported:
			return true
	return false


## El lector se movió o saltó: el piloto suelta los mandos y se va.
func take_over() -> void:
	taken_over = true
	if is_instance_valid(_pilot):
		_pilot.stop()
	_pilot = null


## En escritorio, un carácter que falta en una tipografía (las flechas de las
## teclas, en la manuscrita) lo pone una fuente del sistema. El navegador no
## tiene fuentes del sistema: sin esto salen cuadritos. Plex Mono trae flechas.
## Se guardan las referencias para que `BP` reciba estas mismas instancias.
const FONT_DIR := "res://addons/platformer_kit/fonts/"
var _fonts: Array[Font] = []


func _font_fallbacks() -> void:
	var plex: Font = load(FONT_DIR + "IBMPlexMono-Regular.ttf")
	var fallback: Array[Font] = [plex]
	_fonts.append(plex)
	for file: String in ["ArchitectsDaughter-Regular.ttf", "BarlowCondensed-SemiBold.ttf",
			"BarlowCondensed-Medium.ttf", "IBMPlexMono-SemiBold.ttf"]:
		var font: Font = load(FONT_DIR + file)
		font.fallbacks = fallback
		_fonts.append(font)


func scene() -> String:
	return PLANES[plane]


## Las láminas pedidas (y las que las continúan), en el orden del plano. Si no
## se pidió ninguna o ninguna existe, el plano entero.
func filter_defs(defs: Array[Dictionary]) -> Array[Dictionary]:
	var n := 0
	for def: Dictionary in defs:
		if not def.get("continuation", false):
			_numbers[StringName(def.id)] = n
			n += 1
	if sheets.is_empty():
		return defs
	var out: Array[Dictionary] = []
	var keeping := false
	for def: Dictionary in defs:
		if def.get("continuation", false):
			if keeping:
				out.append(def)
			continue
		keeping = StringName(def.id) in sheets
		if keeping:
			out.append(def)
	return out if not out.is_empty() else defs


## El número de la lámina en el plano entero: el minijuego del coyote sigue
## siendo la «05», como en el juego (el marcador y el título lo enseñan).
func number(def: Dictionary, fallback: int) -> int:
	return _numbers.get(StringName(def.id), fallback)


## Sin la portada no hay casilla «P»: el héroe empieza junto al primer
## checkpoint de la primera lámina que se muestra (el orden es el del plano).
func filter_maps(maps: Dictionary, defs: Array[Dictionary]) -> Dictionary:
	var shown := filter_defs(defs)
	if sheets.is_empty() or shown == defs:
		return maps
	var first := StringName(shown[0].id)
	var rows: Array = (maps[first] as Array).duplicate()
	for joined: String in rows:
		if "P" in joined:
			return maps
	for r: int in rows.size():
		var row: String = rows[r]
		var c := row.find("C")
		if c < 0:
			continue
		var at := c - 1 if c > 0 and row[c - 1] == "." else c + 1
		rows[r] = row.substr(0, at) + "P" + row.substr(at + 1)
		break
	var out := maps.duplicate()
	out[first] = rows
	return out


func _query() -> Dictionary:
	var out := {}
	if not OS.has_feature("web"):
		# Para probar la copia en escritorio: `-- --plano=combate --lamina=c_pogo`.
		for arg: String in OS.get_cmdline_user_args():
			var kv := arg.trim_prefix("--").split("=", true, 1)
			if kv.size() == 2:
				out[kv[0]] = kv[1]
		return out
	var search: Variant = JavaScriptBridge.eval("window.location.search", true)
	if typeof(search) != TYPE_STRING:
		return out
	for pair: String in String(search).trim_prefix("?").split("&", false):
		var parts := pair.split("=", true, 1)
		out[parts[0].uri_decode()] = parts[1].uri_decode() if parts.size() > 1 else ""
	return out
