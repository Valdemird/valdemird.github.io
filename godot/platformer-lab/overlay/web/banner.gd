extends Control
## Rótulo del piloto (sólo web): avisa de que la lámina se juega sola y de cómo
## tomar el control. Desaparece cuando el lector se mueve o salta.

var _time := 0.0


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE


func _process(delta: float) -> void:
	_time += delta
	queue_redraw()


func _draw() -> void:
	var en := WebLab.lang == "en"
	var title := "DEMO"
	var line := ("Playing itself. Press T to switch the technique off · move or jump to take over"
			if en else "Se juega sola. Pulsa T para apagar la técnica · muévete o salta para jugar tú")
	var font := BP.mono()
	var title_font := BP.mono_bold()
	var w := BP.text_size(title, 13, title_font).x + 18.0 + BP.text_size(line, 13, font).x
	var r := Rect2(Vector2((size.x - w) * 0.5 - 16.0, size.y - 92.0), Vector2(w + 32.0, 34.0))
	BP.panel(self, r)
	var pulse := 0.65 + 0.35 * sin(_time * 4.0)
	var p := r.position + Vector2(16.0, 9.0)
	BP.text(self, p, title, 13, Color(BP.ACCENT, pulse), title_font)
	BP.text(self, p + Vector2(BP.text_size(title, 13, title_font).x + 18.0, 0.0), line, 13, BP.INK, font)
