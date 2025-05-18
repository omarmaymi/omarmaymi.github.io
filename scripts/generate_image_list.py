import os
import json

def generate_image_list(webp_dir):
    # Get all webp files
    webp_files = [f for f in os.listdir(webp_dir) if f.lower().endswith('.webp')]
    
    # Create image list
    images = []
    for webp_file in webp_files:
        # Remove file extension and any copy indicators for the alt text
        alt_text = webp_file.replace('.webp', '').replace('+copy', '').replace('-2', '')
        images.append({
            'src': f'../assets/photography_webp/{webp_file}',
            'alt': f'Photograph {alt_text}'
        })
    
    # Generate JavaScript code
    js_code = 'const images = ' + json.dumps(images, indent=4) + ';'
    
    # Write to a JavaScript file
    with open('image-list.js', 'w') as f:
        f.write(js_code)

if __name__ == '__main__':
    webp_directory = '../assets/photography_webp'
    generate_image_list(webp_directory) 