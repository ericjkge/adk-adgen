import json
import os
import subprocess
import tempfile
import uuid
from pathlib import Path

from dotenv import load_dotenv
from google.adk.tools import ToolContext
from google.cloud import storage
from google.genai import types

load_dotenv()
OUTPUT_STORAGE_URI = os.getenv("OUTPUT_STORAGE_URI")


async def upload_to_gcs(video_path: Path, tool_context: ToolContext) -> str | None:
    try:
        if not OUTPUT_STORAGE_URI:
            return None

        # Parse bucket name from OUTPUT_STORAGE_URI (e.g., "gs://bucket-name/")
        bucket_name = OUTPUT_STORAGE_URI.replace("gs://", "").rstrip("/")

        # Generate unique filename for processed video
        unique_id = str(uuid.uuid4().int)[:15]  # Use first 15 digits of UUID
        object_name = f"{unique_id}/processed_video.mp4"

        # Check if file exists
        if not video_path.exists():
            return None

        # Initialize GCS client and upload
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(object_name)

        # Upload the video file
        blob.upload_from_filename(str(video_path))

        # Return GCS URI
        gcs_uri = f"gs://{bucket_name}/{object_name}"
        return gcs_uri

    except Exception as e:
        return None


# Dynamic A-roll and B-roll alternation based on A-roll duration
def get_video_duration(video_path: Path) -> float:
    cmd = [
        "ffprobe",
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        str(video_path),
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        data = json.loads(result.stdout)
        return float(data["format"]["duration"])
    except (
        subprocess.CalledProcessError,
        KeyError,
        ValueError,
        json.JSONDecodeError,
    ) as e:
        raise Exception(f"Failed to get video duration: {e}")


# 50/50 split of A-roll and B-roll, with A-roll audio continuous
async def post_process(tool_context: ToolContext) -> str:
    """
    Combines A-roll and B-roll videos with dynamic alternation while maintaining continuous A-roll audio.

    Args:
        tool_context (ToolContext): Tool context to access A-roll and B-roll video artifacts.

    Returns:
        str: Status message with processing details and final video URL if successful.
    """
    a_roll = await tool_context.load_artifact("a_roll.mp4")
    b_roll = await tool_context.load_artifact("b_roll.mp4")

    if not a_roll:
        return "Missing A-roll"
    if not b_roll:
        return "Missing B-roll"

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        a_path = temp_path / "a_roll.mp4"
        b_path = temp_path / "b_roll.mp4"
        out_path = temp_path / "processed_video.mp4"

        if a_roll.inline_data and a_roll.inline_data.data:
            a_path.write_bytes(a_roll.inline_data.data)
        else:
            return "A-roll data is missing"

        if b_roll.inline_data and b_roll.inline_data.data:
            b_path.write_bytes(b_roll.inline_data.data)
        else:
            return "B-roll data is missing"

        try:
            # Get video durations
            a_duration = get_video_duration(a_path)
            b_duration = get_video_duration(b_path)

            # Calculate alternating segments
            speech_segment_1_end = a_duration / 4
            gap_1_end = a_duration / 2
            speech_segment_2_start = a_duration / 2
            speech_segment_2_end = 3 * a_duration / 4

            # Use B-roll duration for gap segments
            b_segment_duration = min(b_duration, gap_1_end - speech_segment_1_end)

            # Build filter string with proper audio sync
            filter_str = (
                f"[0:v]trim=0:{speech_segment_1_end},setpts=PTS-STARTPTS[a1];"
                f"[1:v]trim=0:{gap_1_end - speech_segment_1_end},setpts=PTS-STARTPTS[b1];"
                f"[0:v]trim={speech_segment_2_start}:{speech_segment_2_end},setpts=PTS-STARTPTS[a2];"
                f"[1:v]trim=0:{a_duration - speech_segment_2_end},setpts=PTS-STARTPTS[b2];"
                "[a1][b1][a2][b2]concat=n=4:v=1:a=0[outv]"
            )

            ffmpeg_cmd = [
                "ffmpeg",
                "-y",
                "-i",
                str(a_path),  # input 0
                "-i",
                str(b_path),  # input 1
                "-filter_complex",
                filter_str,
                "-map",
                "[outv]",
                "-map",
                "0:a",  # A-roll audio
                "-c:v",
                "libx264",
                "-c:a",
                "aac",
                str(out_path),
            ]

            subprocess.run(ffmpeg_cmd, capture_output=True, text=True, check=True)

            # Save as artifact
            await tool_context.save_artifact(
                "processed_video.mp4",
                types.Part(
                    inline_data=types.Blob(
                        mime_type="video/mp4", data=out_path.read_bytes()
                    )
                ),
            )

            # Upload to GCS for public access
            gcs_uri = await upload_to_gcs(out_path, tool_context)
            if gcs_uri:
                return f"Video processed: A-roll ({a_duration:.1f}s) and B-roll ({b_duration:.1f}s) alternated dynamically. Video URL: {gcs_uri}"
            else:
                return f"Video processed: A-roll ({a_duration:.1f}s) and B-roll ({b_duration:.1f}s) alternated dynamically. (GCS upload failed)"

        except subprocess.CalledProcessError as e:
            return f"FFmpeg failed:\n{e.stderr}"
        except Exception as e:
            return f"Unexpected error:\n{str(e)}"
