from google.adk.tools import ToolContext
import subprocess
import tempfile
from pathlib import Path
from google.genai import types

async def post_process(tool_context: ToolContext) -> str:
    """
    Post-processes A-roll and B-roll footage by stacking the videos and overlaying captions.

    Assumes captions are in .txt format (SRT-compatible).

    Args:
        tool_context: Tool context to load artifacts from.
    Returns:
        str: Status message
    """

    a_roll = await tool_context.load_artifact("a_roll.mp4")
    b_roll = await tool_context.load_artifact("b_roll.mp4")
    captions = await tool_context.load_artifact("a_roll_captions.txt")

    if not a_roll:
        return "A_ROLL"
    elif not b_roll:
        return "B_ROLL"
    elif not captions:
        return "CAPTIONS"

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)

        a_path = temp_path / "a_roll.mp4"  
        b_path = temp_path / "b_roll.mp4"  
        c_path = temp_path / "captions.srt"  
        out_path = temp_path / "processed_video.mp4" 

        a_path.write_bytes(a_roll.inline_data.data)
        b_path.write_bytes(b_roll.inline_data.data)
        c_path.write_text(captions.text)

        filter_str = (
            f"[1:v]scale=iw:ih/2[b];"
            f"[0:v]scale=iw:ih/2[a];"
            f"[b][a]vstack=inputs=2[stacked];"
            f"[stacked]subtitles='{c_path}'[final]"
        )

        ffmpeg_cmd = [
            "ffmpeg", "-y",
            "-i", str(a_path),
            "-i", str(b_path),
            "-filter_complex", filter_str,
            "-map", "[final]",
            "-map", "0:a",
            "-c:v", "libx264",
            "-c:a", "aac",
            str(out_path)
        ]

        try:
            subprocess.run(ffmpeg_cmd, capture_output=True, text=True, check=True)
            await tool_context.save_artifact("processed_video.mp4", types.Part(
                inline_data=types.Blob(mime_type='video/mp4', data=out_path.read_bytes())
            ))
            return "✅ Video processed: B-roll (top), A-roll (bottom), subtitles overlaid from .txt (SRT)."
        except subprocess.CalledProcessError as e:
            return f"❌ FFmpeg failed:\n{e.stderr}"
        except Exception as e:
            return f"❌ Unexpected error:\n{str(e)}"
