from google.cloud import storage  
from google.genai import types  
from google.adk.tools import ToolContext

async def load_gcs_files_to_artifacts(  
    tool_context: ToolContext,  
    bucket_name: str,  
    a_roll_path: str,  
    b_roll_path: str,  
    captions_path: str  
) -> str:  
    """Load files from GCS and save them as artifacts for post-processing."""  
      
    try:  
        client = storage.Client()  
        bucket = client.bucket(bucket_name)  
          
        # Load A-roll video  
        a_roll_blob = bucket.blob(a_roll_path)  
        a_roll_data = a_roll_blob.download_as_bytes()  
        await tool_context.save_artifact("a_roll.mp4", types.Part(  
            inline_data=types.Blob(mime_type='video/mp4', data=a_roll_data)  
        ))  
          
        # Load B-roll video    
        b_roll_blob = bucket.blob(b_roll_path)  
        b_roll_data = b_roll_blob.download_as_bytes()  
        await tool_context.save_artifact("b_roll.mp4", types.Part(  
            inline_data=types.Blob(mime_type='video/mp4', data=b_roll_data)  
        ))  
          
        # Load ASS captions  
        captions_blob = bucket.blob(captions_path)  
        captions_data = captions_blob.download_as_bytes()  
        await tool_context.save_artifact("a_roll_captions.ass", types.Part(  
            inline_data=types.Blob(mime_type='text/x-ass', data=captions_data)  
        ))  
          
        return "✅ Files loaded from GCS and saved as artifacts"  
          
    except Exception as e:  
        return f"❌ Error loading files from GCS: {str(e)}"
