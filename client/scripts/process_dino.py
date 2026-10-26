import numpy as np
from PIL import Image, ImageFilter
from collections import deque

def clean_cutout(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    h, w, _ = arr.shape
    
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    # Luminance / brightness
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    max_c = np.maximum(np.maximum(r, g), b)
    
    # 1. Flood fill from borders to identify true background
    # Higher threshold for background floodfill to catch dark shadows on the floor/backdrop
    visited = np.zeros((h, w), dtype=bool)
    is_bg = np.zeros((h, w), dtype=bool)
    queue = deque()
    
    # Seed all border pixels
    for x in range(w):
        for y in [0, 1, h-2, h-1]:
            if max_c[y, x] < 70 and not visited[y, x]:
                visited[y, x] = True
                queue.append((y, x))
    for y in range(h):
        for x in [0, 1, w-2, w-1]:
            if max_c[y, x] < 70 and not visited[y, x]:
                visited[y, x] = True
                queue.append((y, x))
                
    while queue:
        cy, cx = queue.popleft()
        is_bg[cy, cx] = True
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                visited[ny, nx] = True
                # Continue flood fill into dark pixels (shadows and backdrop)
                if max_c[ny, nx] < 75:
                    queue.append((ny, nx))
                    
    # 2. Compute smooth alpha for the background
    alpha = np.ones((h, w), dtype=np.float32) * 255.0
    alpha[is_bg] = 0.0
    
    # 3. For the boundary transition zone (dilate background by 3 pixels and blend)
    bg_mask = Image.fromarray((is_bg * 255).astype(np.uint8))
    expanded_bg = np.array(bg_mask.filter(ImageFilter.MaxFilter(7))) > 0
    transition = expanded_bg & (~is_bg)
    
    # In transition zone, alpha is proportional to brightness above black
    for y, x in zip(*np.where(transition)):
        val = max_c[y, x]
        if val <= 18:
            alpha[y, x] = 0.0
        elif val < 85:
            # Smooth ramp
            alpha[y, x] = ((val - 18) / (85 - 18)) * 255.0
            
    # Unmultiply black background color in semi-transparent fringe
    norm_alpha = np.clip(alpha / 255.0, 0.001, 1.0)
    for c in range(3):
        arr[:, :, c] = np.clip(arr[:, :, c] / norm_alpha, 0, 255)
        
    arr[:, :, 3] = np.clip(alpha, 0, 255)
    
    # Crop tightly to non-empty bounding box with 10px margin
    non_empty = np.where(alpha > 10)
    if len(non_empty[0]) > 0:
        min_y, max_y = np.min(non_empty[0]), np.max(non_empty[0])
        min_x, max_x = np.min(non_empty[1]), np.max(non_empty[1])
        
        pad = 8
        min_y = max(0, min_y - pad)
        max_y = min(h, max_y + pad)
        min_x = max(0, min_x - pad)
        max_x = min(w, max_x + pad)
        
        arr = arr[min_y:max_y, min_x:max_x]
        
    result = Image.fromarray(arr.astype(np.uint8))
    result.save(output_path, "PNG")
    print(f"Clean cutout saved to {output_path}, size {result.size}")

if __name__ == "__main__":
    in_file = r"C:\Users\sujal\.gemini\antigravity-ide\brain\be0c14c8-fe2e-4ea1-bb2c-cdfb4469be83\dino_mascot_3d_1792988308218.jpg"
    out_file1 = r"e:\VELoop-Assignment Task 2\client\public\assets\dino_mascot.png"
    out_file2 = r"e:\VELoop-Assignment Task 2\client\src\assets\dino_mascot.png"
    clean_cutout(in_file, out_file1)
    clean_cutout(in_file, out_file2)
