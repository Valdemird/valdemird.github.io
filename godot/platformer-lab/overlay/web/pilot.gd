extends Node
## Piloto (sólo web): la lámina se juega sola hasta que el lector toca algo.
##
## Repite el gesto que enseña cada lámina, con las mismas acciones que pulsaría
## una persona (`Input.action_press`): quien lee en el móvil, o quien sólo mira,
## ve la técnica salvar el salto y, con T, ve el mismo intento fallar.
## Moverse o saltar (teclado, mando o los botones táctiles) le da el control.
##
## Láminas con coreografía: las de `SUPPORTED`. En las demás el piloto no hace nada.

const SUPPORTED: Array[StringName] = [&"coyote", &"buffer", &"juice", &"variable", &"gravity", &"apex",
		&"accel", &"corner", &"slopes", &"movers", &"wall", &"dash", &"camera",
		&"c_boxes", &"c_anatomy", &"c_confirm", &"c_pogo", &"c_health", &"c_hazard", &"c_dodge", &"c_telegraph"]
## Combate contra un maniquí: [cuál (por orden de izquierda a derecha), distancia de
## centro a centro (px), segundos entre golpes]. En «tres cajas», el del pedestal: su
## caja empieza una casilla por encima del suelo; la hitbox generosa (56 px de grosor)
## llega, la exacta (28 px) pasa por debajo.
const DUMMY_DRILLS := {
	&"c_boxes": [1, 44.0, 0.6],
	&"c_anatomy": [0, 46.0, 0.22],
	&"c_confirm": [0, 46.0, 0.5],
}
## Salto variable: saltos guionizados (columna de la lámina donde despegar, segundos
## con el botón pulsado). Bajo el techo de pinchos, toques; en el muro, salto entero.
## Sin la técnica, todos salen enteros y el primero se clava en los pinchos.
const SCRIPTED := {
	# Calculados con la física del jugador (toque: 1,1 × 2,5 casillas; 50 ms: 1,7 × 3;
	# entero: 3,6 × 6,4) para pasar bajo los pinchos del techo con margen.
	&"variable": [[18.5, 0.03], [23.9, 0.03], [28.875, 0.05], [34.5, 0.04], [39.0, 0.6]],
	# Pendientes: el salto del foso justo al acabar la rampa (sin snap, a menudo no hay suelo).
	&"slopes": [[39.45, 0.6]],
}
## Aceleración: correr, soltar, girar, soltar (segundos de cada fase). En bucle.
const ACCEL_STEPS: Array = [[&"move_right", 0.7], [&"", 0.35], [&"move_left", 0.5], [&"", 0.35]]
## Corner correction: los huecos de 1 casilla del techo (columna del hueco). Se para
## 5 px descentrado, para que el salto roce la esquina y la técnica tenga que actuar.
const CORNER_HOLES: Array[int] = [16, 24, 32]
const CORNER_OFFSET := 5.0
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
var _phase := 0                 # fase de la coreografía de la lámina
var _phase_time := 0.0
var _cooldown := 0.0
var _stay := false              # quieto en el sitio (la cámara: saltitos sobre la meseta)
var _mover: Mover               # la plataforma rápida de la lámina de plataformas móviles
var _mover_last_x := 0.0
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


var _tap_release: Array[StringName] = []


func _physics_process(delta: float) -> void:
	for action: StringName in _tap_release:
		_release(action)
	_tap_release.clear()
	if start_delay > 0.0:
		start_delay -= delta
		return
	var sheet: StringName = main.current_sheet.def.get("id", &"")
	if not sheet in SUPPORTED or player.state == PlatformerPlayer.State.DEAD:
		_release_all()
		return
	if _stay:
		_release(&"move_left")
		_release(&"move_right")
	elif sheet in [&"accel", &"corner", &"wall", &"dash", &"movers", &"c_boxes", &"c_anatomy",
			&"c_confirm", &"c_pogo", &"c_dodge"]:
		pass   # estas coreografías llevan las direcciones ellas mismas
	elif _target != Vector2.INF and not player.is_on_floor():
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
	elif sheet == &"camera":
		_camera_hops(delta)
	elif sheet == &"accel":
		_accel(delta)
	elif sheet == &"corner":
		_corner(delta)
	elif sheet == &"wall":
		_wall_climb(delta)
	elif sheet == &"dash":
		_dash_run(delta)
	elif sheet == &"movers":
		_movers(delta)
	elif DUMMY_DRILLS.has(sheet):
		_dummy_drill(delta, DUMMY_DRILLS[sheet])
	elif sheet == &"c_pogo":
		_pogo_run(delta)
	elif sheet == &"c_health":
		_loop_after(17.5)
	elif sheet == &"c_dodge":
		_dodge_run()
	elif sheet == &"c_telegraph":
		_telegraph_run()
	elif SCRIPTED.has(sheet):
		_scripted(sheet)
	_update_jump_hold(delta)
	# Coreografías que se quedan quietas a propósito (esperar una plataforma, pararse
	# bajo un hueco) no deben confundirse con estar atascado al final del mapa.
	if sheet != &"movers" and not DUMMY_DRILLS.has(sheet) \
			and not (sheet == &"corner" and _phase < CORNER_HOLES.size()):
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


## Cámara: subir la escalera con el saltador y, ya en la meseta, saltar en el sitio una
## y otra vez. La cámara buena no sube con cada salto (se ancla al último suelo); con T
## apagado, la cámara sigue cada salto arriba y abajo.
func _camera_hops(delta: float) -> void:
	_cooldown -= delta
	var column := (player.global_position.x - float(main.current_sheet.x0)) / BP.TILE
	if column >= 22.0 and column < 30.0 and player.is_on_floor():
		_stay = true
	if _stay:
		if player.is_on_floor() and _jump_hold < 0.0 and _cooldown <= 0.0:
			_press_jump()
			_cooldown = 0.95
		return
	if _target != Vector2.INF or _jump_hold >= 0.0 or not player.is_on_floor():
		return
	_hop()


## Aceleración: correr, soltar y girar en bucle. El vídeo enseña el inspector: con la
## técnica la velocidad sube y baja en rampa; sin ella, salta de golpe.
func _accel(delta: float) -> void:
	_phase_time += delta
	var step: Array = ACCEL_STEPS[_phase % ACCEL_STEPS.size()]
	if _phase_time >= float(step[1]):
		_phase += 1
		_phase_time = 0.0
		step = ACCEL_STEPS[_phase % ACCEL_STEPS.size()]
	var action: StringName = step[0]
	for dir: StringName in [&"move_left", &"move_right"]:
		if dir == action:
			_hold(dir)
		else:
			_release(dir)


## Corner correction: parar bajo cada hueco del techo, un poco descentrado, y saltar en
## vertical. Con la técnica, el juego aparta al héroe y pasa; sin ella, cabezazo.
func _corner(delta: float) -> void:
	_phase_time += delta
	if _phase >= CORNER_HOLES.size():
		_release(&"move_left")
		_hold(&"move_right")        # al final del pasillo: el bucle lo devuelve al inicio
		return
	var x0 := float(main.current_sheet.x0)
	var target := x0 + (CORNER_HOLES[_phase] + 0.5) * BP.TILE + CORNER_OFFSET
	var x := player.global_position.x
	if _jump_hold >= 0.0 or not player.is_on_floor():
		_release(&"move_right")
		_release(&"move_left")
		return
	if _cooldown > 0.0:
		_cooldown -= delta
		if _cooldown <= 0.0:
			_phase += 1              # ya saltó en este hueco: al siguiente
		return
	if x < target - 12.0:
		_hold(&"move_right")
		_phase_time = 0.0
	elif absf(player.velocity.x) > 1.0 or _phase_time < 0.25:
		_release(&"move_right")      # frenar y quedarse quieto un instante
	else:
		_press_jump(0.6)
		_cooldown = 0.9


## Wall jump: el error de siempre, saltar manteniendo la dirección HACIA la pared, y
## soltar el stick después. Con las ayudas (bloqueo de control 140 ms, inercia) el salto
## llega solo a la otra pared y se sube el pozo; sin ellas, mantener hacia la pared
## anula el impulso en el mismo instante y el héroe no se despega.
func _wall_climb(delta: float) -> void:
	_cooldown -= delta
	_phase_time -= delta
	var toward := player.wall_dir
	if toward == 0 and player.is_on_floor() and player.is_on_wall():
		toward = 1 if _held.has(&"move_right") else -1   # en el suelo, contra el muro
	if toward != 0 and _cooldown <= 0.0 and _jump_hold < 0.0:
		var held := &"move_right" if toward > 0 else &"move_left"
		_release(&"move_left" if toward > 0 else &"move_right")
		_hold(held)
		_press_jump(0.18)
		_cooldown = 0.22
		_phase_time = 0.15           # el empujón hacia la pared dura lo que el bloqueo
		return
	if _phase_time > 0.0:
		return
	if player.is_on_floor() and toward == 0:
		_release(&"move_left")
		_hold(&"move_right")
	elif not player.is_on_floor():
		_release(&"move_left")       # manos fuera: la inercia hace el resto
		_release(&"move_right")


## Dash: saltar y hacer dash en lo alto sobre los 8u de pinchos, salto + dash hacia
## arriba en el muro de 6u y dash por el túnel de 1u con un foso dentro.
func _dash_run(delta: float) -> void:
	_cooldown -= delta
	var column := (player.global_position.x - float(main.current_sheet.x0)) / BP.TILE
	match _phase:
		0:   # carrerilla y salto antes de los pinchos
			_hold(&"move_right")
			if player.is_on_floor() and column >= 11.3:
				_press_jump()
				_phase = 1
		1:   # en lo alto, dash a la derecha
			if not player.is_on_floor() and player.velocity.y >= -40.0:
				_tap(&"dash")
				_phase = 2
		2:   # hasta el muro: pegado a él, salto
			_hold(&"move_right")
			if player.is_on_floor() and column >= 29.4:
				_press_jump()
				_phase = 3
		3:   # en lo alto, dash hacia ARRIBA (sin dirección horizontal)
			if not player.is_on_floor() and player.velocity.y >= -60.0:
				_release(&"move_right")
				_hold(&"move_up")
				_tap(&"dash")
				_cooldown = 0.2
				_phase = 4
		4:   # acabado el dash, a la derecha hasta subir al muro
			if _cooldown <= 0.0:
				_release(&"move_up")
				_hold(&"move_right")
				if player.is_on_floor() and column > 30.0:
					_phase = 5
		5:   # bajar y entrar en el túnel; dash sobre el foso
			_hold(&"move_right")
			if player.is_on_floor() and column >= 41.45 and column < 42.0:
				_tap(&"dash")
				_phase = 6
		_:
			_hold(&"move_right")


## Plataformas móviles: subirse a la plataforma rápida y saltar mientras corre hacia el
## hueco de 8u. Con inercia, se hereda su velocidad y se llega; sin ella, no. Para el
## vídeo, cada intento empieza en el borde del bloque (se coloca al héroe ahí).
func _movers(delta: float) -> void:
	if _mover == null:
		for node: Node in main.level.get_children():
			var m := node as Mover
			if m != null and not m.eased:
				_mover = m
		if _mover == null:
			return
		_phase = 0
	var mx := _mover.global_position.x
	var moving_right := mx > _mover_last_x + 0.01
	_mover_last_x = mx
	_cooldown -= delta
	match _phase:
		0:   # esperar a que la plataforma arranque y colocar al héroe encima
			_release(&"move_right")
			if moving_right and mx < _mover.from.x + 12.0:
				player.teleport(Vector2(mx + 60.0, _mover.from.y - PlatformerPlayer.HALF_SIZE.y - 1.0))
				_phase = 3
		3:   # quieto encima hasta casi el final del recorrido: salto con la derecha pulsada
			if moving_right and mx > _mover.to.x - 34.0 and player.is_on_floor():
				_hold(&"move_right")
				_press_jump()
				_phase = 4
		4:   # en el aire hacia el otro bloque; al aterrizar (o caer), otro intento
			if player.is_on_floor() and _jump_hold < 0.0:
				_cooldown = 0.9
				_phase = 5
		5:
			if _cooldown <= 0.0:
				_phase = 0


## Maniquí: acercarse a la distancia de la tabla, pararse y golpear a ritmo fijo.
func _dummy_drill(delta: float, drill: Array) -> void:
	_cooldown -= delta
	var dummies: Array[Node2D] = []
	for node: Node in main.level.get_children():
		if node is TrainingDummy:
			dummies.append(node)
	dummies.sort_custom(func(a: Node2D, b: Node2D) -> bool: return a.global_position.x < b.global_position.x)
	var index := int(drill[0])
	if index >= dummies.size():
		return
	var dx := dummies[index].global_position.x - player.global_position.x
	if dx > float(drill[1]) + 4.0:
		_hold(&"move_right")
		return
	_release(&"move_right")
	if absf(player.velocity.x) > 1.0:
		return
	if _cooldown <= 0.0:
		_tap(&"attack")
		_cooldown = float(drill[2])


## Pogo: golpe hacia arriba a la primera diana y, sobre los pinchos, de diana en diana
## con el golpe hacia abajo. Con pogo, cada acierto rebota; sin él, a los pinchos.
func _pogo_run(delta: float) -> void:
	_cooldown -= delta
	var targets: Array[Node2D] = []
	for node: Node in main.level.get_children():
		if node is FloatingTarget:
			targets.append(node)
	targets.sort_custom(func(a: Node2D, b: Node2D) -> bool: return a.global_position.x < b.global_position.x)
	if targets.size() < 2:
		return
	var x := player.global_position.x
	var x0 := float(main.current_sheet.x0)
	var column := (x - x0) / BP.TILE
	# Un pincho devuelve al héroe al suelo de antes de los pinchos: se reintenta.
	if _phase >= 3 and player.is_on_floor() and column < 16.0:
		_phase = 2
		_release(&"move_down")
	match _phase:
		0:   # bajo la diana de arriba: salto y golpe hacia arriba
			var up_target := targets[0]
			if x < up_target.global_position.x - 2.0:
				_hold(&"move_right")
			else:
				_release(&"move_right")
				if player.is_on_floor() and _jump_hold < 0.0:
					_press_jump()
					_phase = 1
		1:
			if not player.is_on_floor() and player.velocity.y > -260.0:
				_hold(&"move_up")
				_tap(&"attack")
				_cooldown = 0.2
				_phase = 10
		10:
			if _cooldown <= 0.0:
				_release(&"move_up")
				if player.is_on_floor():
					_phase = 2
		2:   # al borde de los pinchos, salto hacia la primera diana
			_hold(&"move_right")
			if player.is_on_floor() and column >= 15.4:
				_script_next = 1
				_target = _pogo_aim(targets[_script_next])
				_press_jump()
				_phase = 3
		3:   # en el aire: apuntar y, justo encima, golpe hacia abajo
			var t := targets[_script_next]
			_target = _pogo_aim(t)
			_steer()
			var dy := t.global_position.y - player.global_position.y
			if player.velocity.y > 0.0 and absf(t.global_position.x - x) < 26.0 and dy > 40.0 and dy < 100.0:
				_hold(&"move_down")
				_tap(&"attack")
				_cooldown = 0.28        # más que el toque de caída rápida (0,2 s)
				_took_off = false       # aquí: «ya rebotó en esta diana»
				_phase = 4
		4:
			_steer()
			if player.velocity.y < -150.0:
				_took_off = true
			if _cooldown <= 0.0:
				_release(&"move_down")
				if _took_off:                         # rebotó: a la siguiente
					_script_next += 1
					if _script_next < targets.size():
						_phase = 3
					else:
						_target = Vector2(x0 + 38.5 * BP.TILE, targets[-1].global_position.y + 2.5 * BP.TILE)
						_phase = 5
		5:   # la última diana lanza hacia el suelo del otro lado
			if player.is_on_floor():
				_target = Vector2.INF
				_phase = 6
			else:
				_steer()
		_:
			_release(&"move_left")
			_hold(&"move_right")


func _pogo_aim(t: Node2D) -> Vector2:
	return Vector2(t.global_position.x, t.global_position.y - 60.0)


## Vida y daño: cruzar la placa que hace daño y volver a empezar (la vida no se
## recupera al volver: el vídeo deja ver cuántas máscaras cuesta cada cruce).
func _loop_after(column_limit: float) -> void:
	var column := (player.global_position.x - float(main.current_sheet.x0)) / BP.TILE
	if column > column_limit and player.is_on_floor():
		main.go_to_sheet(0)


## Dash de esquiva: un dash a través de cada cortina que hace daño. Con los i-frames
## del dash, pasa sin daño; sin ellos, la misma cortina golpea.
func _dodge_run() -> void:
	_hold(&"move_right")
	var x := player.global_position.x
	for node: Node in main.level.get_children():
		var curtain := node as DamageCurtain
		if curtain == null:
			continue
		var left := curtain.global_position.x - curtain.width * 0.5
		var gap := left - (x + PlatformerPlayer.HALF_SIZE.x)
		if gap > 0.0 and gap < 26.0 and player.can_dash and player.is_on_floor():
			_tap(&"dash")
			return
	_loop_after(33.0)


## Telegrafiar: saltar la embestida cuando el enemigo ya carga y está cerca. Con el
## aviso, la carga se ve venir medio segundo antes; sin él, llega sin aviso.
func _telegraph_run() -> void:
	var x := player.global_position.x
	for node: Node in main.level.get_children():
		var charger := node as Charger
		if charger == null or not player.is_on_floor() or _jump_hold >= 0.0:
			continue
		var dx := charger.global_position.x - x
		if charger.state == &"charge" and dx > 0.0 and dx < 150.0:
			_press_jump()
			return
	_hop()


## Pulsar y soltar una acción en el tick siguiente.
func _tap(action: StringName) -> void:
	_release(action)
	Input.action_press(action)
	_held[action] = true
	_tap_release.append(action)


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
	_stay = false
	_script_next = 0
	_phase = 0
	_phase_time = 0.0
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
