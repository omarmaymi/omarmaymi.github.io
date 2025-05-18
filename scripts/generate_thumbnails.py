from PIL import Image
import os
from pathlib import Path

def generate_thumbnails():
    # Get the root directory of the project
    root_dir = Path(__file__).parent.parent
    
    # Paths
    photo_dir = root_dir / 'assets' / 'photography'
    thumb_dir = photo_dir / 'thumbnails'
    
    # Create thumbnails directory if it doesn't exist
    thumb_dir.mkdir(exist_ok=True)
    
    # Thumbnail size (width, height)
    THUMB_SIZE = (800, 600)  # Adjust these values as needed
    
    # Process each image
    for file in photo_dir.iterdir():
        if file.suffix.lower() in ['.jpg', '.jpeg']:
            thumb_path = thumb_dir / file.name
            
            # Skip if thumbnail already exists
            if thumb_path.exists():
                continue
                
            try:
                # Open and resize image
                with Image.open(file) as img:
                    # Convert to RGB if necessary
                    if img.mode in ('RGBA', 'P'):
                        img = img.convert('RGB')
                    
                    # Get EXIF orientation
                    try:
                        exif = img._getexif()
                        if exif is not None:
                            orientation = exif.get(274)  # 274 is the orientation tag
                            if orientation is not None:
                                # Rotate image based on EXIF orientation
                                if orientation == 3:
                                    img = img.rotate(180, expand=True)
                                elif orientation == 6:
                                    img = img.rotate(270, expand=True)
                                elif orientation == 8:
                                    img = img.rotate(90, expand=True)
                    except (AttributeError, KeyError, IndexError):
                        # No EXIF data or error reading it
                        pass
                    
                    # Calculate aspect ratio
                    aspect = img.width / img.height
                    if aspect > 1:
                        # Landscape
                        new_width = THUMB_SIZE[0]
                        new_height = int(new_width / aspect)
                    else:
                        # Portrait
                        new_height = THUMB_SIZE[1]
                        new_width = int(new_height * aspect)
                    
                    # Resize image
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    
                    # Save thumbnail with quality optimization
                    img.save(thumb_path, 'JPEG', quality=85, optimize=True)
                    
                print(f"Generated thumbnail for {file.name}")
            except Exception as e:
                print(f"Error processing {file.name}: {str(e)}")

if __name__ == '__main__':
    generate_thumbnails() 