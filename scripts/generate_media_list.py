import os
import json
import yt_dlp
import subprocess
import requests
import time
from datetime import datetime
from PIL import Image, ImageStat, ImageEnhance
from io import BytesIO
import numpy as np

def calculate_image_quality(img):
    """Calculate image quality score based on brightness, contrast, and sharpness"""
    try:
        # Convert to grayscale for analysis
        gray = img.convert('L')
        
        # Calculate brightness (0-255)
        stat = ImageStat.Stat(gray)
        brightness = stat.mean[0]
        
        # Calculate contrast (standard deviation)
        contrast = stat.stddev[0]
        
        # Calculate sharpness using Laplacian variance
        enhancer = ImageEnhance.Sharpness(gray)
        sharpened = enhancer.enhance(2.0)
        sharpness = np.var(np.array(sharpened))
        
        # Normalize scores
        brightness_score = min(1.0, brightness / 128)  # Prefer brighter images
        contrast_score = min(1.0, contrast / 64)      # Prefer higher contrast
        sharpness_score = min(1.0, sharpness / 1000)  # Prefer sharper images
        
        # Calculate final score (weighted average)
        final_score = (brightness_score * 0.3 + contrast_score * 0.3 + sharpness_score * 0.4)
        
        return final_score
    except Exception as e:
        print(f"Error calculating image quality: {str(e)}")
        return 0

def extract_frame_from_video(url, output_path):
    """Extract the best quality frame from multiple points in the video"""
    try:
        # Get video info to find duration
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            duration = info.get('duration', 0)
            if duration == 0:
                return False
            
            # Calculate timestamps at 25%, 50%, and 75% of the video
            timestamps = [
                duration * 0.25,  # 25% of video
                duration * 0.50,  # 50% of video
                duration * 0.75   # 75% of video
            ]
            
            # Download video temporarily
            temp_path = output_path + '.temp'
            ydl_opts = {
                'format': 'best[height<=720]',
                'outtmpl': temp_path,
                'quiet': True,
                'no_warnings': True,
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            
            best_score = 0
            best_frame = None
            
            # Try each timestamp
            for timestamp in timestamps:
                try:
                    # Extract frame using ffmpeg
                    temp_frame = output_path + f'.temp_{timestamp}.jpg'
                    cmd = [
                        'ffmpeg',
                        '-i', temp_path,
                        '-ss', str(timestamp),
                        '-vframes', '1',
                        '-q:v', '2',
                        '-y',
                        temp_frame
                    ]
                    subprocess.run(cmd, check=True, capture_output=True)
                    
                    # Calculate quality score
                    with Image.open(temp_frame) as img:
                        score = calculate_image_quality(img)
                        print(f"Frame at {timestamp:.1f}s - Quality score: {score:.3f}")
                        
                        if score > best_score:
                            best_score = score
                            if best_frame:
                                os.remove(best_frame)
                            best_frame = temp_frame
                        else:
                            os.remove(temp_frame)
                            
                except Exception as e:
                    print(f"Error extracting frame at {timestamp}s: {str(e)}")
                    if os.path.exists(temp_frame):
                        os.remove(temp_frame)
            
            # Clean up temp video file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            if best_frame:
                # Convert best frame to WebP
                with Image.open(best_frame) as img:
                    img.save(output_path, 'WEBP', quality=90)
                os.remove(best_frame)
                print(f"Selected best frame with quality score: {best_score:.3f}")
                return True
            
            return False
            
    except Exception as e:
        print(f"Error extracting frame: {str(e)}")
        # Clean up temp files
        if os.path.exists(temp_path):
            os.remove(temp_path)
        for timestamp in timestamps:
            temp_frame = output_path + f'.temp_{timestamp}.jpg'
            if os.path.exists(temp_frame):
                os.remove(temp_frame)
        return False

def download_thumbnail(url, output_path):
    """Download thumbnail from YouTube video URL"""
    try:
        # Extract video ID
        if 'youtube.com' in url or 'youtu.be' in url:
            video_id = url.split('v=')[-1] if 'v=' in url else url.split('/')[-1]
            print(f"\nProcessing video ID: {video_id}")
            
            # Try maxresdefault first
            maxres_url = f'https://img.youtube.com/vi/{video_id}/maxresdefault.jpg'
            try:
                print(f"Attempting to download maxresdefault: {maxres_url}")
                time.sleep(1)
                response = requests.get(maxres_url, timeout=10)
                if response.status_code == 200:
                    print(f"Successfully downloaded maxresdefault")
                    img = Image.open(BytesIO(response.content))
                    img.save(output_path, 'WEBP', quality=90)
                    print(f"Saved thumbnail to {output_path}")
                    return True
                else:
                    print(f"maxresdefault not available (status code {response.status_code})")
            except Exception as e:
                print(f"Error downloading maxresdefault: {str(e)}")
            
            # Try extracting frame from video
            print("Attempting to extract frame from video...")
            if extract_frame_from_video(url, output_path):
                print("Successfully extracted frame from video")
                return True
            else:
                print("Failed to extract frame from video")
            
            # Fall back to hqdefault
            hq_url = f'https://img.youtube.com/vi/{video_id}/hqdefault.jpg'
            try:
                print(f"Attempting to download hqdefault: {hq_url}")
                time.sleep(1)
                response = requests.get(hq_url, timeout=10)
                if response.status_code == 200:
                    print(f"Successfully downloaded hqdefault")
                    img = Image.open(BytesIO(response.content))
                    img.save(output_path, 'WEBP', quality=90)
                    print(f"Saved thumbnail to {output_path}")
                    return True
                else:
                    print(f"Failed to download hqdefault: Status code {response.status_code}")
            except Exception as e:
                print(f"Error downloading hqdefault: {str(e)}")
            
            print(f"Failed to download thumbnail for {url} - all attempts failed")
            return False
        else:
            # For non-YouTube videos, use yt-dlp's thumbnail extraction
            print(f"Processing non-YouTube video: {url}")
            ydl_opts = {
                'format': 'best',
                'outtmpl': output_path,
                'quiet': True,
                'no_warnings': True,
                'skip_download': True,
                'writesubtitles': False,
                'writeautomaticsub': False,
                'postprocessors': [{
                    'key': 'FFmpegThumbnailsConvertor',
                    'format': 'webp',
                }],
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            print(f"Successfully processed non-YouTube video thumbnail")
            return True
    except Exception as e:
        print(f"Error downloading thumbnail for {url}: {str(e)}")
        return False

def create_preview_video(url, output_path, duration=3):
    """Create a short preview video from the middle of the source video"""
    try:
        # First get video info and download
        ydl_opts = {
            'format': 'best[height<=720]',  # Limit to 720p for smaller file size
            'outtmpl': output_path + '.temp',  # Temporary file
            'quiet': True,
            'no_warnings': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            video_duration = info.get('duration', 0)
            # Calculate start time to be in the middle of the video
            start_time = max(0, (video_duration - duration) / 2)
            ydl.download([url])
            
        # Create preview using ffmpeg
        cmd = [
            'ffmpeg',
            '-i', output_path + '.temp',
            '-ss', str(start_time),  # Start from middle
            '-t', str(duration),
            '-c:v', 'libvpx-vp9',
            '-crf', '30',
            '-b:v', '0',
            '-vf', 'scale=640:-1',
            '-an',
            output_path
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        
        # Clean up temporary file
        if os.path.exists(output_path + '.temp'):
            os.remove(output_path + '.temp')
            
        return True
    except Exception as e:
        print(f"Error creating preview for {url}: {str(e)}")
        # Clean up temporary file if it exists
        if os.path.exists(output_path + '.temp'):
            os.remove(output_path + '.temp')
        return False

def get_embed_url(url):
    """Get the embed URL for different video platforms"""
    if 'youtube.com' in url or 'youtu.be' in url:
        video_id = url.split('v=')[-1] if 'v=' in url else url.split('/')[-1]
        return f'https://www.youtube.com/embed/{video_id}?autoplay=1&rel=0'
    elif 'vimeo.com' in url:
        video_id = url.split('/')[-1]
        return f'https://player.vimeo.com/video/{video_id}?autoplay=1&title=0&byline=0&portrait=0'
    elif 'streamable.com' in url:
        video_id = url.split('/')[-1]
        return f'https://streamable.com/e/{video_id}?autoplay=1'
    return url

def generate_media_list():
    # Define paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    media_dir = os.path.join(base_dir, 'assets', 'media')
    thumbnails_dir = os.path.join(media_dir, 'thumbnails')
    previews_dir = os.path.join(media_dir, 'previews')
    output_file = os.path.join(base_dir, 'scripts', 'media-list.js')
    
    # Create directories if they don't exist
    os.makedirs(thumbnails_dir, exist_ok=True)
    os.makedirs(previews_dir, exist_ok=True)
    
    # List of video URLs (you can modify this to load from a file or database)
    video_urls = [
        # Add your video URLs here
        # Example: 'https://www.youtube.com/watch?v=VIDEO_ID'
        'https://youtu.be/JQb-2GKdAMo',
        'https://youtu.be/EX9oe1TZKos',
        'https://youtu.be/wgrjS-o1PM8',
        'https://youtu.be/3pmVoWfX0qU',
        'https://youtu.be/KGTlW3aDI8s',
        'https://youtu.be/CRJjUoN8fYo',
        'https://youtu.be/UeP5VZrsb5c',
        'https://youtu.be/a3pmPy4S9xM',
        'https://youtu.be/2jf7wf2X3PY',
        'https://youtu.be/ngREjYJOu6w',
        'https://youtu.be/DwBiUQvQ35o',
        'https://youtu.be/v-BVqDM5nZc',
        'https://youtu.be/n4lF-Bwk63k',
        'https://youtu.be/TzPp0pJGSSE',
        'https://youtu.be/L23zKTxn240',
        'https://youtu.be/CarQe0Pc-pM',
        'https://youtu.be/lMoXPVNI7R4', 
    ]
    
    # Generate thumbnails and create media list
    videos = []
    for url in video_urls:
        try:
            # Get video info
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'skip_download': True,
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                title = info.get('title', 'Untitled')
                upload_date = info.get('upload_date', '')
                if upload_date:
                    date = f"{upload_date[:4]}-{upload_date[4:6]}-{upload_date[6:]}"
                else:
                    date = datetime.now().strftime('%Y-%m-%d')
            
            # Generate thumbnail and preview filenames
            video_id = url.split('v=')[-1] if 'v=' in url else url.split('/')[-1]
            thumbnail_filename = f"thumb_{video_id}.webp"
            preview_filename = f"preview_{video_id}.webm"
            
            thumbnail_path = os.path.join(thumbnails_dir, thumbnail_filename)
            preview_path = os.path.join(previews_dir, preview_filename)
            
            # Check if both files already exist
            if os.path.exists(thumbnail_path) and os.path.exists(preview_path):
                print(f"Skipping {url} - already processed")
                # Add to videos list without reprocessing
                videos.append({
                    'title': title,
                    'thumbnail': f'/assets/media/thumbnails/{thumbnail_filename}',
                    'preview': f'/assets/media/previews/{preview_filename}',
                    'embedUrl': get_embed_url(url),
                    'date': date
                })
                continue
            
            # Download thumbnail and create preview if files don't exist
            if download_thumbnail(url, thumbnail_path) and create_preview_video(url, preview_path):
                # Add to videos list
                videos.append({
                    'title': title,
                    'thumbnail': f'/assets/media/thumbnails/{thumbnail_filename}',
                    'preview': f'/assets/media/previews/{preview_filename}',
                    'embedUrl': get_embed_url(url),
                    'date': date
                })
        except Exception as e:
            print(f"Error processing {url}: {str(e)}")
    
    # Write to JavaScript file
    with open(output_file, 'w') as f:
        f.write('const videos = ')
        json.dump(videos, f, indent=2)
        f.write(';')

if __name__ == '__main__':
    generate_media_list() 