import os
from PIL import Image, ImageDraw, ImageFilter

def create_convertly_icon(size=512):
    # Create canvas with transparency
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    
    # Draw drop shadow
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    margin = int(size * 0.05)
    shadow_box = [margin, margin + int(size * 0.03), size - margin, size - margin + int(size * 0.03)]
    radius = int((size - 2 * margin) / 2)
    shadow_draw.rounded_rectangle(shadow_box, radius=radius, fill=(0, 0, 0, 80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(size * 0.04)))
    
    # Merge shadow
    img = Image.alpha_composite(img, shadow)
    
    # Draw gradient background squircle
    squircle = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sq_draw = ImageDraw.Draw(squircle)
    box = [margin, margin, size - margin, size - margin]
    
    # Draw lines of gradient from top to bottom
    for y in range(margin, size - margin):
        ratio = (y - margin) / float(size - 2 * margin)
        r = int(0 + ratio * (0 - 0))
        g = int(110 - ratio * (70))  # 0x6E down to 0x28
        b = int(101 - ratio * (65))  # 0x65 down to 0x24
        sq_draw.line([(margin, y), (size - margin, y)], fill=(r, g, b, 255), width=1)
        
    # Mask to rounded rectangle
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(box, radius=radius, fill=255)
    
    # Draw subtle inner border
    mask_draw.rounded_rectangle(box, radius=radius, outline=200, width=int(size * 0.012))
    
    squircle.putalpha(mask)
    img = Image.alpha_composite(img, squircle)
    
    # Draw 3 isometric stacked diamonds/layers in white
    draw = ImageDraw.Draw(img)
    center_x, center_y = size // 2, size // 2
    
    w = int(size * 0.28) # half width of diamond
    h = int(size * 0.13) # half height of diamond
    gap = int(size * 0.085) # vertical gap between layers
    line_w = max(4, int(size * 0.038))
    
    # We draw 3 layers from bottom to top
    for idx, y_offset in enumerate([gap * 1.2, 0, -gap * 1.2]):
        cy = center_y + y_offset
        # Diamond points: top, right, bottom, left
        pts = [
            (center_x, cy - h),
            (center_x + w, cy),
            (center_x, cy + h),
            (center_x - w, cy),
            (center_x, cy - h)
        ]
        if idx == 2:
            # Top layer is closed polygon
            draw.line(pts, fill=(255, 255, 255, 255), width=line_w, joint="curve")
        else:
            # Lower layers only show left and right bottom edges (V shape)
            v_pts = [
                (center_x - w, cy - h * 0.2),
                (center_x, cy + h * 0.8),
                (center_x + w, cy - h * 0.2)
            ]
            draw.line(v_pts, fill=(255, 255, 255, 255), width=line_w, joint="curve")
            
    return img

if __name__ == "__main__":
    icon = create_convertly_icon(512)
    os.makedirs("frontend/src/app", exist_ok=True)
    os.makedirs("frontend/public", exist_ok=True)
    
    # Save high-res PNGs
    icon.save("frontend/src/app/icon.png", "PNG")
    icon.save("frontend/public/icon.png", "PNG")
    icon.save("frontend/public/apple-icon.png", "PNG")
    
    # Save multi-size ICOs
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    icon.save("frontend/src/app/favicon.ico", format="ICO", sizes=sizes)
    icon.save("frontend/public/favicon.ico", format="ICO", sizes=sizes)
    print("SUCCESS_GENERATED_ICONS")
