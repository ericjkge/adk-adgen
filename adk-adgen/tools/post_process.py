from google.adk.tools import ToolContext
import subprocess
import tempfile
import json
from pathlib import Path
from google.genai import types

# Dynamic A-roll and B-roll alternation based on A-roll duration
def get_video_duration(video_path: Path) -> float:
    """Get video duration in seconds using ffprobe."""
    cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_format", str(video_path)
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        data = json.loads(result.stdout)
        return float(data['format']['duration'])
    except (subprocess.CalledProcessError, KeyError, ValueError, json.JSONDecodeError) as e:
        raise Exception(f"Failed to get video duration: {e}")

# 50/50 split of A-roll and B-roll, with A-roll audio continuous
async def post_process(tool_context: ToolContext) -> str:
    """
    Alternates A-roll and B-roll video while keeping A-roll audio continuous.
    A-roll video only appears during speech segments; B-roll fills in-between.
    """
    a_roll = await tool_context.load_artifact("a_roll.mp4")
    b_roll = await tool_context.load_artifact("b_roll.mp4")
    
    if not a_roll:
        return "❌ Missing A-roll"
    if not b_roll:
        return "❌ Missing B-roll"
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        a_path = temp_path / "a_roll.mp4"
        b_path = temp_path / "b_roll.mp4"
        out_path = temp_path / "processed_video.mp4"
        
        a_path.write_bytes(a_roll.inline_data.data)
        b_path.write_bytes(b_roll.inline_data.data)
        
        try:
            # Get video durations
            a_duration = get_video_duration(a_path)
            b_duration = get_video_duration(b_path)
            
            # Calculate alternating segments - split A-roll into speech/non-speech parts
            # For this example, assume first and second half are speech segments
            speech_segment_1_end = a_duration / 4  # First quarter is speech
            gap_1_end = a_duration / 2            # Second quarter is gap
            speech_segment_2_start = a_duration / 2
            speech_segment_2_end = 3 * a_duration / 4  # Third quarter is speech
            
            # Use B-roll duration for gap segments
            b_segment_duration = min(b_duration, gap_1_end - speech_segment_1_end)
            
            # Build filter string with proper audio sync
            filter_str = (
                # First speech segment - show A-roll video
                f"[0:v]trim=0:{speech_segment_1_end},setpts=PTS-STARTPTS[a1];"
                # First gap - show B-roll video (duration matches the gap)
                f"[1:v]trim=0:{gap_1_end - speech_segment_1_end},setpts=PTS-STARTPTS[b1];"
                # Second speech segment - show A-roll video (from the correct time point)
                f"[0:v]trim={speech_segment_2_start}:{speech_segment_2_end},setpts=PTS-STARTPTS[a2];"
                # Final gap - show B-roll video
                f"[1:v]trim=0:{a_duration - speech_segment_2_end},setpts=PTS-STARTPTS[b2];"
                "[a1][b1][a2][b2]concat=n=4:v=1:a=0[outv]"
            )
            
            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-i", str(a_path),  # input 0
                "-i", str(b_path),  # input 1
                "-filter_complex", filter_str,
                "-map", "[outv]",
                "-map", "0:a",  # A-roll audio
                "-c:v", "libx264",
                "-c:a", "aac",
                str(out_path)
            ]
            
            subprocess.run(ffmpeg_cmd, capture_output=True, text=True, check=True)
            
            await tool_context.save_artifact("processed_video.mp4", types.Part(
                inline_data=types.Blob(mime_type='video/mp4', data=out_path.read_bytes())
            ))
            
            return f"✅ Video processed: A-roll ({a_duration:.1f}s) and B-roll ({b_duration:.1f}s) alternated dynamically."
            
        except subprocess.CalledProcessError as e:
            return f"❌ FFmpeg failed:\n{e.stderr}"
        except Exception as e:
            return f"❌ Unexpected error:\n{str(e)}"