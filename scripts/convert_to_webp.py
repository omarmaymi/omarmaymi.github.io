from PIL import Image
import os
from pathlib import Path

def convert_to_webp(source_dir, quality=80):
    # Create output directory if it doesn't exist
    output_dir = Path(source_dir).parent / 'photography_webp'
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Get all jpg files
    jpg_files = [f for f in os.listdir(source_dir) if f.lower().endswith(('.jpg', '.jpeg'))]
    
    for jpg_file in jpg_files:
        # Open the image
        image_path = os.path.join(source_dir, jpg_file)
        image = Image.open(image_path)
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1])
            image = background
        
        # Create output filename
        webp_filename = os.path.splitext(jpg_file)[0] + '.webp'
        webp_path = os.path.join(output_dir, webp_filename)
        
        # Save as WebP
        image.save(webp_path, 'WEBP', quality=quality)
        print(f'Converted {jpg_file} to {webp_filename}')

if __name__ == '__main__':
    source_directory = 'assets/photography'
    convert_to_webp(source_directory) 