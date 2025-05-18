import os
import json
from pathlib import Path

def generate_image_list(webp_dir):
    # Get all webp files
    webp_files = [f for f in os.listdir(webp_dir) if f.lower().endswith('.webp')]
    
    # Create image list
    images = []
    for webp_file in webp_files:
        # Remove file extension and any copy indicators for the alt text
        alt_text = webp_file.replace('.webp', '').replace('+copy', '').replace('-2', '')
        images.append({
            'src': f'../../assets/photography_webp/{webp_file}',
            'alt': f'Photograph {alt_text}'
        })
    
    # Generate JavaScript code
    js_code = 'const images = ' + json.dumps(images, indent=4) + ';'
    
    # Create scripts directory if it doesn't exist
    scripts_dir = Path('scripts')
    scripts_dir.mkdir(exist_ok=True)
    
    # Write to a JavaScript file
    output_path = scripts_dir / 'image-list.js'
    with open(output_path, 'w') as f:
        f.write(js_code)
    
    print(f'Generated image list at: {output_path}')

if __name__ == '__main__':
    webp_directory = '../assets/photography_webp'
    generate_image_list(webp_directory) 