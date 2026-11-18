extends Node
## Piloto (sólo web): la lámina se juega sola hasta que el lector toca algo.
##
## Repite el gesto que enseña cada lámina, con las mismas acciones que pulsaría
## una persona (`Input.action_press`): quien lee en el móvil, o quien sólo mira,
## ve la técnica salvar el salto y, con T, ve el mismo intento fallar.
## Moverse o saltar (teclado, mando o los botones táctiles) le da el control.
##
## Láminas con coreografía: las de `SUPPORTED`. En las demás el piloto no hace nada.

const SUPPORTED: Array[StringName] = [&"coyote", &"buffer", &"juice", &"variable", &"gravity", &"apex"]
## Salto variable: saltos guionizados (columna de la lámina donde despegar, segundos
## con el botón pulsado). Bajo el techo de pinchos, toques; en el muro, salto entero.
## Sin la técnica, todos salen enteros y el primero se clava en los pinchos.
const SCRIPTED := {
	# Calculados con la física del jugador (toque: 1,1 × 2,5 casillas; 50 ms: 1,7 × 3;
	# entero: 3,6 × 6,4) para pasar bajo los pinchos del techo con margen.
	&"variable": [[18.5, 0.03], [23.9, 0.03], [28.875, 0.05], [34.5, 0.04], [39.0, 0.6]],
}
const PLAYER_ACTIONS: Array[StringName] = [
	&"move_left", &"move_right", &"move_up", &"move_down", &"jump", &"dash", &"attack", &"heal"]
## Coyote: se salta un instante DESPUÉS de dejar el suelo (la ventana es de 100 ms;
## `left_ledge` llega unos 20 ms tarde, así que el aviso dirá «COYOTE +50 ms» o así).
const COYOTE_LATE := 0.03
## Buffer: se pulsa 70 ms ANTES de tocar el suelo (la ventana es de 120 ms).
const BUFFER_EARLY := 0.07
## Atascado contra el final del mapa: vuelta al principio de la lámina.
const STUCK_TIME := 0.6
const FLOOR_MASK := 3   # capas 1 (sólidos) y 2 (one-way)

var main: Main
var player: PlatformerPlayer
var banner: Control
## Segundos quieto antes de empezar (el video arranca con el héroe en su sitio).
var start_delay := 0.0

var _held := {}                 # acción → true
var _jump_in := -1.0            # cuenta atrás para pulsar salto
var _jump_hold := -1.0          # tiempo con el salto pulsado (-1 = suelto)
var _took_off := false          # ya saltó desde que reapareció
var _pressed_this_fall := false
var _stuck := 0.0
var _last_x := 0.0
var _script_next := 0           # siguiente salto guionizado de la lámina
var _hold_for := -1.0           # segundos que se mantiene el salto (-1 = hasta el ápice)
var _edge_ahead := INF          # distancia al borde de la superficie que se pisa
## Buffer: dónde tiene que caer este salto (x del centro, y de la superficie).
## Los pilares están a 4 casillas y un salto completo llega a 6,4: hay que apuntar.
var _target := Vector2.INF


func setup(scene_main: Main) -> void:
	main = scene_main
	player = main.player
	process_physics_priority = -100   # antes que el jugador: que vea la pulsación este mismo tick
	player.left_ledge.connect(_on_left_ledge)
	player.landed.connect(_on_landed)
	player.jumped.connect(_on_jumped)
	player.respawned.connect(_on_respawned)
	player.bounced.connect(_on_bounced)


func _physics_process(delta: float) -> void:
	if start_delay > 0.0:
		start_delay -= delta
		return
	var sheet: StringName = main.current_sheet.def.get("id", &"")
	if not sheet in SUPPORTED or player.state == PlatformerPlayer.State.DEAD:
		_release_all()
		return
	if _target != Vector2.INF and not player.is_on_floor():
		_steer()
	else:
		_release(&"move_left")
		_hold(&"move_right")
	if _jump_in >= 0.0:
		_jump_in -= delta
		if _jump_in < 0.0:
			_press_jump()
	if sheet == &"buffer":
		_buffer_lookahead()
	elif sheet == &"juice":
		_juice_hop()
	elif sheet == &"gravity" or sheet == &"apex":
		_hop()
	elif SCRIPTED.has(sheet):
		_scripted(sheet)
	_update_jump_hold(delta)
	_loop_at_end(delta)


# --- Coreografías ------------------------------------------------------------------

func _on_left_ledge() -> void:
	match main.current_sheet.def.get("id", &""):
		&"coyote":
			_jump_in = COYOTE_LATE        # tarde a propósito: sólo el coyote lo salva
		&"buffer":
			if not _took_off:
				_jump_in = 0.0            # el primer salto, al borde; luego, botes


## Buffer: pulsar un poco ANTES de aterrizar. Sin buffer esa pulsación se pierde,
## el héroe aterriza sin saltar y sigue corriendo hacia los pinchos.
func _buffer_lookahead() -> void:
	if not _took_off or _pressed_this_fall or player.is_on_floor() or player.velocity.y <= 0.0:
		return
	var distance := _floor_distance()
	if distance >= 0.0 and distance / player.velocity.y < BUFFER_EARLY:
		_pressed_this_fall = true
		_press_jump()


func _on_landed(_impact: float, _air_time: float) -> void:
	_pressed_this_fall = false
	_target = Vector2.INF


## Un muelle (o un bug pisado) ya lanzó al héroe: se deja de apuntar y se sigue.
func _on_bounced(_kind: StringName) -> void:
	_target = Vector2.INF


func _on_jumped(_kind: StringName) -> void:
	_took_off = true
	if main.current_sheet.def.get("id", &"") == &"buffer":
		_target = _find_landing()


## La siguiente superficie donde caer, por delante: se deja atrás la plataforma
## actual y se busca la primera que esté a su altura o más arriba (los pinchos
## no son sólidos: debajo hay suelo, pero una casilla más abajo).
## `max_drop`: cuánto más abajo puede estar la superficie (px). En el ápice se baja de
## los pilares altos al suelo; en la gravedad, la caída larga es a propósito (sin salto).
func _find_landing(max_drop: float = 45.0) -> Vector2:
	var feet_y := player.global_position.y + PlatformerPlayer.HALF_SIZE.y
	var x0 := player.global_position.x
	var left_platform := false
	var seg_start := INF
	var seg_end := INF
	var seg_y := 0.0
	_edge_ahead = INF
	for step: int in range(1, 48):
		var x := x0 + step * 8.0
		var top := _surface_at(x, feet_y - 160.0)
		var landable := top <= feet_y + max_drop and not _hazard_on(x, top)
		var same := landable and absf(top - feet_y) < 6.0
		if not left_platform:
			if same:
				continue
			left_platform = true
			_edge_ahead = x - x0
			if not landable:
				continue
		if landable:
			if seg_start == INF:
				seg_start = x
				seg_y = top
			seg_end = x
			if seg_end - seg_start >= 48.0:
				break   # plataforma larga: se apunta cerca de su borde
		elif seg_start != INF:
			break
	if seg_start == INF:
		return Vector2.INF
	return Vector2((seg_start + seg_end) * 0.5, seg_y)


## ¿Hay pinchos sobre esta superficie? Se mira el mapa de la lámina: la casilla de
## encima del sólido que tocó el rayo (los pinchos no son sólidos: el rayo los cruza).
func _hazard_on(x: float, top: float) -> bool:
	if top == INF:
		return false
	var cell := Vector2i(floori(x / BP.TILE), roundi(top / BP.TILE) - 1)
	return main.level._grid.get(cell, "") in ["^", "v", "<", ">"]


## Game feel: correr, saltar por encima de los bugs (si al caer pisa otro, mejor:
## rebote, hit stop, partículas), caer sobre los muelles para subir a la torre y
## dejarse caer las 10 casillas del otro lado. Con T se apaga todo el «jugo».
func _juice_hop() -> void:
	if not player.is_on_floor() or _jump_hold >= 0.0:
		return
	var feet_y := player.global_position.y + PlatformerPlayer.HALF_SIZE.y
	var x := player.global_position.x
	for node: Node in main.level.get_children():
		var bug := node as Bug
		if bug != null and not bug.is_queued_for_deletion():
			var ahead := bug.global_position.x - x
			if ahead > 70.0 and ahead < 130.0 and absf(bug.global_position.y - feet_y) < 30.0:
				_press_jump()
				return
		var spring := node as Spring
		if spring != null:
			# El muelle ocupa una casilla; su cara de arriba está 14 px sobre el suelo.
			var center := spring.global_position.x + BP.TILE * 0.5
			var base := spring.global_position.y + BP.TILE
			var ahead := center - x
			if ahead > 60.0 and ahead < 200.0 and absf(base - feet_y) < 20.0:
				_target = Vector2(center, base - 14.0)
				_press_jump()
				return


## En el aire: ¿dónde caería con la velocidad de ahora? Se corrige con ← y →.
func _steer() -> void:
	var t := _time_to_fall_to(_target.y)
	if t < 0.0:
		_release(&"move_left")
		_hold(&"move_right")
		return
	var error := player.global_position.x + player.velocity.x * t - _target.x
	if error > 6.0:
		_release(&"move_right")
		_hold(&"move_left")
	elif error < -6.0:
		_release(&"move_left")
		_hold(&"move_right")
	else:
		_release(&"move_left")
		_release(&"move_right")


## Segundos hasta que los pies bajen a `surface_y`, con la gravedad del jugador
## (asimétrica, y la del ápice si se mantiene el salto). -1 si no llega.
func _time_to_fall_to(surface_y: float) -> float:
	var p := player.params
	var y := player.global_position.y + PlatformerPlayer.HALF_SIZE.y
	var vy := player.velocity.y
	var dt := 1.0 / 120.0
	var t := 0.0
	while t < 2.0:
		var g := p.gravity_up if vy < 0.0 else p.gravity_down
		if _held.has(&"jump") and absf(vy) < p.apex_threshold:
			g *= p.apex_gravity_mult
		vy = minf(vy + g * dt, p.max_fall_speed)
		y += vy * dt
		t += dt
		if vy > 0.0 and y >= surface_y:
			return t
	return -1.0


func _on_respawned() -> void:
	_script_next = 0
	_took_off = false
	_pressed_this_fall = false
	_jump_in = -1.0
	_target = Vector2.INF
	_release(&"jump")
	_jump_hold = -1.0


# --- Pulsaciones -------------------------------------------------------------------

func _press_jump(hold_for: float = -1.0) -> void:
	_release(&"jump")
	_hold(&"jump")
	_jump_hold = 0.0
	_hold_for = hold_for


## Saltos guionizados: al pasar por cada columna, despega y mantiene lo que diga la tabla.
func _scripted(sheet: StringName) -> void:
	var table: Array = SCRIPTED[sheet]
	if _script_next >= table.size() or not player.is_on_floor() or _jump_hold >= 0.0:
		return
	var column := (player.global_position.x - float(main.current_sheet.x0)) / BP.TILE
	var step: Array = table[_script_next]
	if column >= float(step[0]):
		_script_next += 1
		_press_jump(float(step[1]))


## Saltador: desde el suelo, la siguiente superficie segura por delante (a su altura,
## más alta o un poco más baja, nunca con pinchos), y se apunta a ella en el aire.
func _hop() -> void:
	if not player.is_on_floor() or _jump_hold >= 0.0 or _target != Vector2.INF:
		return
	var sheet: StringName = main.current_sheet.def.get("id", &"")
	var landing := _find_landing(125.0 if sheet == &"apex" else 45.0)
	if landing == Vector2.INF:
		return
	var ahead := landing.x - player.global_position.x
	if (ahead > 30.0 and ahead < 170.0) or (_edge_ahead < 36.0 and ahead > 0.0 and ahead < 300.0):
		_target = landing
		_press_jump()


## Salto completo: se mantiene hasta lo más alto. Si no llegó a saltar (técnica
## apagada), se suelta enseguida.
func _update_jump_hold(delta: float) -> void:
	if _jump_hold < 0.0:
		return
	_jump_hold += delta
	var done := _jump_hold >= _hold_for if _hold_for >= 0.0 \
			else (_jump_hold > 0.12 and player.velocity.y >= 0.0) or _jump_hold > 0.7
	if done:
		_release(&"jump")
		_jump_hold = -1.0


func _loop_at_end(delta: float) -> void:
	# Se mira si avanza de verdad: contra una pared la velocidad no siempre es 0.
	var x := player.global_position.x
	var moved := absf(x - _last_x) > 0.5
	_last_x = x
	var at_end := x > main.level.bounds.end.x - 30.0
	if player.is_on_floor() and (not moved or at_end):
		_stuck += delta
		if _stuck > STUCK_TIME:
			_stuck = 0.0
			main.go_to_sheet(0)
	else:
		_stuck = 0.0


func _hold(action: StringName) -> void:
	if not _held.has(action):
		_held[action] = true
		Input.action_press(action)


func _release(action: StringName) -> void:
	if _held.erase(action):
		Input.action_release(action)


func _release_all() -> void:
	for action: StringName in _held.keys():
		Input.action_release(action)
	_held.clear()
	_jump_hold = -1.0


## Altura de la superficie sólida bajo `x`, mirando desde `from_y` (INF si no hay).
func _surface_at(x: float, from_y: float) -> float:
	var space := player.get_world_2d().direct_space_state
	var from := Vector2(x, from_y)
	var query := PhysicsRayQueryParameters2D.create(from, from + Vector2(0.0, 480.0), FLOOR_MASK, [player.get_rid()])
	var hit := space.intersect_ray(query)
	return INF if hit.is_empty() else (hit.position as Vector2).y


## Distancia (px) de los pies al suelo, mirando un poco por delante del héroe.
func _floor_distance() -> float:
	var space := player.get_world_2d().direct_space_state
	var feet := player.global_position + Vector2(0.0, PlatformerPlayer.HALF_SIZE.y)
	var ahead := player.velocity.x * BUFFER_EARLY
	var best := -1.0
	for dx: float in [-PlatformerPlayer.HALF_SIZE.x, 0.0, PlatformerPlayer.HALF_SIZE.x]:
		var from := feet + Vector2(dx + ahead, 0.0)
		var query := PhysicsRayQueryParameters2D.create(from, from + Vector2(0.0, 600.0), FLOOR_MASK, [player.get_rid()])
		var hit := space.intersect_ray(query)
		if not hit.is_empty():
			var d: float = (hit.position as Vector2).y - from.y
			if best < 0.0 or d < best:
				best = d
	return best


# --- Ceder el control --------------------------------------------------------------

func _input(event: InputEvent) -> void:
	if event is InputEventMouse or event.is_echo():
		return
	for action: StringName in PLAYER_ACTIONS:
		if event.is_action_pressed(action):
			WebLab.take_over()
			return


func stop() -> void:
	_release_all()
	if banner != null:
		banner.queue_free()
	queue_free()
