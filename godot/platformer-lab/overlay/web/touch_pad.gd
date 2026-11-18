extends Control
## Mando táctil (sólo web). Izquierda: ← → ↓. Derecha: saltar, dash (y golpe en
## combate). Arriba a la derecha: T, la técnica de la lámina.
##
## Pulsa las mismas acciones que el teclado (`Input.action_press`), así que el
## juego no sabe que es táctil. Se enseña si la página lo pide (`tactil=1`) o con
## el primer toque. Un dedo puede deslizarse de ← a → sin levantarse.

var main: Main
var combat := false

var _buttons: Array[Dictionary] = []   # {action, label, center, radius, slide}
var _fingers := {}                     # índice de toque → índice de botón
var _counts := {}                      # acción → dedos que la pulsan
var _shown := false


func setup(scene_main: Main, show_now: bool) -> void:
	main = scene_main
	combat = scene_main is CombatMain
	_shown = show_now
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	resized.connect(_layout)
	_layout()


func _layout() -> void:
	var w := size.x
	var h := size.y
	var en := WebLab.lang == "en"
	_buttons = [
		{"action": &"move_left", "label": "←", "center": Vector2(105.0, h - 105.0), "radius": 64.0, "slide": true},
		{"action": &"move_right", "label": "→", "center": Vector2(250.0, h - 105.0), "radius": 64.0, "slide": true},
		{"action": &"move_down", "label": "↓", "center": Vector2(177.0, h - 225.0), "radius": 46.0, "slide": true},
		{"action": &"jump", "label": "JUMP" if en else "SALTO", "center": Vector2(w - 110.0, h - 110.0), "radius": 74.0, "slide": false},
		{"action": &"dash", "label": "DASH", "center": Vector2(w - 260.0, h - 78.0), "radius": 52.0, "slide": false},
		{"action": &"toggle_technique", "label": "T", "center": Vector2(w - 70.0, 150.0), "radius": 44.0, "slide": false},
	]
	if combat:
		_buttons.append({"action": &"attack", "label": "HIT" if en else "GOLPE",
				"center": Vector2(w - 235.0, h - 210.0), "radius": 52.0, "slide": false})
	queue_redraw()


func _input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		var touch := event as InputEventScreenTouch
		if not _shown:
			_shown = true
			queue_redraw()
		if touch.pressed:
			var at := _button_at(_local(touch.position))
			if at >= 0:
				_fingers[touch.index] = at
				_press(at)
				get_viewport().set_input_as_handled()
		elif _fingers.has(touch.index):
			_release(_fingers[touch.index])
			_fingers.erase(touch.index)
			get_viewport().set_input_as_handled()
	elif event is InputEventScreenDrag:
		var drag := event as InputEventScreenDrag
		if not _fingers.has(drag.index):
			return
		var from: int = _fingers[drag.index]
		var to := _button_at(_local(drag.position))
		if to >= 0 and to != from and _buttons[from].slide and _buttons[to].slide:
			_release(from)
			_fingers[drag.index] = to
			_press(to)
		get_viewport().set_input_as_handled()


func _press(index: int) -> void:
	var action: StringName = _buttons[index].action
	if action == &"toggle_technique":
		main.toggle_current_technique()
	else:
		WebLab.take_over()
		_counts[action] = int(_counts.get(action, 0)) + 1
		if _counts[action] == 1:
			Input.action_press(action)
	queue_redraw()


func _release(index: int) -> void:
	var action: StringName = _buttons[index].action
	if _counts.has(action):
		_counts[action] -= 1
		if _counts[action] <= 0:
			_counts.erase(action)
			Input.action_release(action)
	queue_redraw()


func _button_at(at: Vector2) -> int:
	for i: int in _buttons.size():
		var b: Dictionary = _buttons[i]
		if at.distance_to(b.center) <= b.radius * 1.15:
			return i
	return -1


func _local(at: Vector2) -> Vector2:
	return get_global_transform_with_canvas().affine_inverse() * at


func _draw() -> void:
	if not _shown:
		return
	for b: Dictionary in _buttons:
		var held: bool = _counts.has(b.action)
		var fill := Color(BP.ACCENT, 0.32) if held else Color(BP.PAPER_DEEP, 0.5)
		draw_circle(b.center, b.radius, fill)
		draw_arc(b.center, b.radius, 0.0, TAU, 48, BP.INK if held else BP.INK_SOFT, 2.0, true)
		var label: String = b.label
		var font_size := 34 if label.length() <= 1 else 18
		BP.text_centered(self, b.center, label, font_size, BP.INK, BP.mono_bold())
