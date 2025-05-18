import os
import json
from pathlib import Path

def generate_images_json():
    # Get the root directory of the project
    root_dir = Path(__file__).parent.parent
    
    # Path to the photography folder
    photo_dir = root_dir / 'photography'
    
    # Get all image files
    image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.webp')
    images = []
    
    for file in photo_dir.iterdir():
        if file.suffix.lower() in image_extensions:
            images.append(file.name)
    
    # Sort images alphabetically
    images.sort()
    
    # Write to images.json
    output_file = photo_dir / 'images.json'
    with open(output_file, 'w') as f:
        json.dump(images, f, indent=2)
    
    print(f"Generated images.json with {len(images)} images")

if __name__ == '__main__':
    generate_images_json() 