import os
import math
from PIL import Image, ImageDraw

def create_icon(size):
    # Colors
    bg_color = (8, 8, 13, 255)
    blue_color = (20, 184, 246, 255)
    orange_color = (245, 158, 11, 255)
    
    # Create image and draw object
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 1. Rounded Rectangle Background
    radius = size * 0.2
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=bg_color)
    
    # 2. Centered Circle
    margin = size * 0.15
    circle_box = [margin, margin, size - margin, size - margin]
    stroke_width = max(1, int(size * 0.015))
    draw.ellipse(circle_box, outline=blue_color, width=stroke_width)
    
    # 3. Fractal Tree
    # Calculate circle bounds for tree placement
    cx, cy = size / 2, size / 2
    cr = (size - 2 * margin) / 2
    
    # Start point (bottom of circle area)
    start_x = cx
    start_y = cy + cr * 0.6
    trunk_len = cr * 0.5
    
    def interpolate_color(color1, color2, factor):
        return tuple(int(color1[i] + (color2[i] - color1[i]) * factor) for i in range(3)) + (255,)

    def draw_branch(x, y, length, angle, depth):
        if depth > 3:
            return
        
        # Calculate color based on depth (0 to 3)
        color = interpolate_color(blue_color, orange_color, depth / 3.0)
        
        # Calculate end point
        ex = x + math.cos(math.radians(angle)) * length
        ey = y + math.sin(math.radians(angle)) * length
        
        # Draw line
        width = max(1, int(stroke_width * (1 - depth * 0.2)))
        draw.line([(x, y), (ex, ey)], fill=color, width=width)
        
        # Recursive branches
        new_len = length * 0.7
        draw_branch(ex, ey, new_len, angle - 25, depth + 1)
        draw_branch(ex, ey, new_len, angle + 25, depth + 1)

    # Draw the tree starting with the trunk
    draw_branch(start_x, start_y, trunk_len, -90, 0)
    
    return img

def main():
    if not os.path.exists('icons'):
        os.makedirs('icons')
        
    sizes = [192, 512, 1024]
    for size in sizes:
        icon = create_icon(size)
        icon.save(f'icons/icon-{size}.png')
        print(f"Generated: icons/icon-{size}.png")

if __name__ == "__main__":
    main()
