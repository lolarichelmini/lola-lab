"""Genera el audio de los episodios que todavía no lo tienen.

Lee content/podcast/episodes.json, convierte cada guion a mp3 con una voz
neuronal en español argentino y completa "audio" y "duration".
También genera muestras de voces en content/podcast/samples/ si faltan.
Se ejecuta en GitHub Actions (ver .github/workflows/podcast-audio.yml).
"""
import asyncio
import json
import pathlib
import edge_tts
from mutagen.mp3 import MP3

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "content/podcast/episodes.json"
AUDIO_DIR = ROOT / "content/podcast/audio"
SAMPLES_DIR = ROOT / "content/podcast/samples"

SAMPLE_TEXT = (
    "Hola, Lola. Bienvenida a Lunes Creativo. Diez minutos para arrancar la semana "
    "con la cabeza un poco más abierta: novedades, una técnica y un ejercicio para la agencia."
)
SAMPLE_VOICES = ["es-AR-ElenaNeural", "es-AR-TomasNeural"]


def duration(path: pathlib.Path) -> float:
    return round(MP3(str(path)).info.length, 1)


async def speak(text: str, voice: str, out: pathlib.Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    await edge_tts.Communicate(text, voice, rate="-4%").save(str(out))


async def main() -> None:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    voice = data.get("voice", "es-AR-ElenaNeural")
    changed = False

    for ep in data["episodes"]:
        out = AUDIO_DIR / f"{ep['id']}.mp3"
        if ep.get("audio") and out.exists():
            continue
        text = (ROOT / ep["script"]).read_text(encoding="utf-8")
        print(f"Generando {out.name} con {voice}…")
        await speak(text, voice, out)
        ep["audio"] = str(out.relative_to(ROOT))
        ep["duration"] = duration(out)
        changed = True

    for v in SAMPLE_VOICES:
        out = SAMPLES_DIR / f"{v}.mp3"
        if not out.exists():
            print(f"Generando muestra {out.name}…")
            await speak(SAMPLE_TEXT, v, out)

    if changed:
        DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


asyncio.run(main())
