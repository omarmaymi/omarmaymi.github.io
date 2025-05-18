import os
import json
from PIL import Image
import piexif
from datetime import datetime

def get_image_orientation(image_path):
    try:
        exif_dict = piexif.load(image_path)
        if piexif.ImageIFD.Orientation in exif_dict["0th"]:
            return exif_dict["0th"][piexif.ImageIFD.Orientation]
    except:
        pass
    return 1

def create_thumbnail(image_path, output_path, max_size=1080, quality=90):
    try:
        # Open the image
        with Image.open(image_path) as img:
            # Get original orientation
            orientation = get_image_orientation(image_path)
            
            # Rotate image if needed
            if orientation == 3:
                img = img.rotate(180, expand=True)
            elif orientation == 6:
                img = img.rotate(270, expand=True)
            elif orientation == 8:
                img = img.rotate(90, expand=True)
            
            # Convert to RGB if needed
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Calculate new dimensions while maintaining aspect ratio
            width, height = img.size
            if width > height:
                if width > max_size:
                    new_width = max_size
                    new_height = int(height * (max_size / width))
                else:
                    new_width = width
                    new_height = height
            else:
                if height > max_size:
                    new_height = max_size
                    new_width = int(width * (max_size / height))
                else:
                    new_width = width
                    new_height = height
            
            # Resize image using LANCZOS resampling for best quality
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Save as WebP with high quality
            img.save(output_path, 'WEBP', quality=quality, method=6)
            return True
    except Exception as e:
        print(f"Error processing {image_path}: {str(e)}")
        return False

def generate_image_list():
    # Define paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    images_dir = os.path.join(base_dir, 'assets', 'photography')
    thumbnails_dir = os.path.join(base_dir, 'assets', 'photography', 'thumbnails')
    output_file = os.path.join(base_dir, 'scripts', 'image-list.js')
    
    # Create thumbnails directory if it doesn't exist
    os.makedirs(thumbnails_dir, exist_ok=True)
    
    # Get list of image files
    image_files = [f for f in os.listdir(images_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    
    # Sort files by name
    image_files.sort()
    
    # Generate thumbnails and create image list
    images = []
    for filename in image_files:
        # Get file info
        file_path = os.path.join(images_dir, filename)
        file_stats = os.stat(file_path)
        created_date = datetime.fromtimestamp(file_stats.st_ctime)
        
        # Create thumbnail
        thumbnail_filename = f"thumb_{os.path.splitext(filename)[0]}.webp"
        thumbnail_path = os.path.join(thumbnails_dir, thumbnail_filename)
        
        if create_thumbnail(file_path, thumbnail_path):
            # Add to images list
            images.append({
                'src': f'/assets/photography/thumbnails/{thumbnail_filename}',
                'fullsize': f'/assets/photography/{filename}',
                'alt': os.path.splitext(filename)[0].replace('_', ' ').title(),
                'date': created_date.strftime('%Y-%m-%d')
            })
    
    # Write to JavaScript file
    with open(output_file, 'w') as f:
        f.write('const images = ')
        json.dump(images, f, indent=2)
        f.write(';')

if __name__ == '__main__':
    generate_image_list() 