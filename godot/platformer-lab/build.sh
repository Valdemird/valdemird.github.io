#!/usr/bin/env bash
# Exporta el laboratorio de Platform-game a la web, sin tocar el proyecto original.
#
#   godot/platformer-lab/build.sh            # usa el commit de GAME_REF
#   GAME_REF=abc1234 godot/platformer-lab/build.sh
#
# 1. Copia el juego desde git (`git archive`, nunca la carpeta de trabajo: lo que
#    esté a medias en el proyecto no entra, y el proyecto no se toca).
# 2. Le añade `overlay/`: el arranque web (`web/`) y el preset de exportación.
# 3. Parchea la copia: escena de arranque, autoload WebLab y el filtro de láminas.
# 4. Importa y exporta con las plantillas web sin hilos (GitHub Pages no manda
#    las cabeceras COOP/COEP que pide la versión con hilos). Sólo se exportan las
#    escenas del laboratorio y sus dependencias (export_files en el preset): el
#    juego en desarrollo (título, historia, arte, música, tienda) no viaja en el .pck.
#
# Sale en public/play/platformer-lab/. Un minijuego = una URL:
#   /play/platformer-lab/index.html?plano=plataformas&lamina=coyote
set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
SITE=$(cd "$HERE/../.." && pwd)
GAME_REPO=${GAME_REPO:-$HOME/Github/Platform-game}
GAME_REF=${GAME_REF:-$(tr -d '[:space:]' < "$HERE/GAME_REF")}
GODOT=${GODOT:-/Applications/Godot.app/Contents/MacOS/Godot}
TEMPLATES=${TEMPLATES:-$HOME/.cache/godot/export_templates/4.7.2.stable}
WORK="$HERE/.build"
OUT="$SITE/public/play/platformer-lab"

if [[ ! -f "$TEMPLATES/web_nothreads_release.zip" ]]; then
	cat >&2 <<EOF
Faltan las plantillas web de Godot en $TEMPLATES.
Descarga Godot_v4.7.2-stable_export_templates.tpz de
https://github.com/godotengine/godot/releases/tag/4.7.2-stable y extrae sólo:
  unzip -j <tpz> templates/version.txt templates/web_nothreads_release.zip \\
    templates/web_nothreads_debug.zip -d "$TEMPLATES"
EOF
	exit 1
fi

echo "› Copia de $GAME_REPO @ $GAME_REF"
mkdir -p "$WORK"
# Se conserva .godot/ (la importación) entre builds; todo lo demás se rehace.
find "$WORK" -mindepth 1 -maxdepth 1 ! -name .godot -exec rm -rf {} +
git -C "$GAME_REPO" archive "$GAME_REF" | tar -x -C "$WORK"
# Fuera todo lo que es del juego en desarrollo y no del laboratorio (título, la
# caída, historia, tienda, diálogos, pixel art, música, mapas, estilos): ni sus
# archivos ni sus nombres de clase deben viajar en el .pck público.
for path in game/caida game/tienda game/titulo game/pixel game/silhouette game/watercolor \
		game/flat game/dialogue game/partida game/music game/stage game/sprites \
		game/fx/caida_sfx.gd game/fx/caida_sfx_escucha.gd game/fx/caida_sfx_escucha.tscn \
		game/menu.gd game/menu.tscn music tests tools docs historia art addons/dialogue_kit; do
	rm -rf "${WORK:?}/$path" "${WORK:?}/$path.uid"
done
# De los shaders, sólo los del plano (papel y rayado); los demás son de los estilos.
find "$WORK/game/shaders" -type f ! -name 'blueprint_bg.gdshader*' ! -name 'hatch.gdshader*' -delete
# El overlay va después: su game/demo.gd sustituye al modo demo del juego.
cp -R "$HERE/overlay/." "$WORK/"
sed -i '' "s#@TEMPLATES@#$TEMPLATES#g" "$WORK/export_presets.cfg"

echo "› Parches de la copia"
python3 - "$WORK" <<'PY'
import pathlib, sys

root = pathlib.Path(sys.argv[1])

def patch(rel, old, new):
    path = root / rel
    text = path.read_text()
    if text.count(old) != 1:
        sys.exit(f"parche fallido en {rel}: se esperaba una vez {old!r}")
    path.write_text(text.replace(old, new))

# El arranque web en vez del título; y otra carpeta de datos, para que una
# prueba de esta copia en escritorio no se mezcle con las partidas del juego.
patch("project.godot", 'run/main_scene="res://game/titulo/titulo.tscn"',
      'run/main_scene="res://web/boot.tscn"')
patch("project.godot", 'config/custom_user_dir_name="PlatformerBlueprint"',
      'config/custom_user_dir_name="PlatformerBlueprintWeb"')
# Pantalla de carga del color del plano, sin el logo de Godot a pantalla completa.
patch("project.godot", 'config/icon="res://icon.svg"\n',
      'config/icon="res://icon.svg"\nboot_splash/bg_color=Color(0.075, 0.24, 0.56, 1)\n'
      'boot_splash/show_image=false\n')
# Los diálogos no son del laboratorio: fuera su autoload y su plugin.
patch("project.godot", 'Dialogue="*res://addons/dialogue_kit/autoload/dialogue.gd"\n', '')
patch("project.godot", ', "res://addons/dialogue_kit/plugin.cfg")', ')')
patch("project.godot", 'Demo="*res://game/demo.gd"\n',
      'Demo="*res://game/demo.gd"\nWebLab="*res://web/web_lab.gd"\n')
# Un minijuego = las láminas que pide la URL.
patch("game/level/level.gd", "var maps := _sheet_maps()",
      "var maps := WebLab.filter_maps(_sheet_maps(), _sheet_defs())")
patch("game/level/level.gd", "for def: Dictionary in _sheet_defs():",
      "for def: Dictionary in WebLab.filter_defs(_sheet_defs()):")
patch("game/level/level.gd", '{"index": sheets.size(), "def": def,',
      '{"index": WebLab.number(def, sheets.size()), "def": def,')
PY

echo "› Importar (la primera vez tarda)"
"$GODOT" --headless --path "$WORK" --import >"$WORK/import.log" 2>&1 || {
	tail -40 "$WORK/import.log" >&2
	exit 1
}

echo "› Exportar"
mkdir -p "$WORK/out"
"$GODOT" --headless --path "$WORK" --export-release "Web" "$WORK/out/index.html" >"$WORK/export.log" 2>&1 || {
	tail -40 "$WORK/export.log" >&2
	exit 1
}
grep -iE "error|warning" "$WORK/export.log" | grep -v "^WARNING: Blend file import" | head -20 || true

rm -rf "$OUT"
mkdir -p "$OUT"
cp "$WORK/out/"* "$OUT/"
du -sh "$OUT"/* | sort -h
echo "✓ $OUT"
