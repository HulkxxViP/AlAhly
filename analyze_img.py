from PIL import Image
img = Image.open('D:/Al-Ahly-Tracker/public/players/1.png')
w, h = img.size

# Detailed horizontal brightness profile - every 10px
print("=== HORIZONTAL PROFILE (every 50px, R+G+B brightness) ===")
for x in range(0, w, 50):
    strip = img.crop((x, 0, min(x+50, w), h))
    r, g, b = 0, 0, 0
    n = 0
    for py in range(strip.height):
        for px in range(strip.width):
            p = strip.getpixel((px, py))
            if p[3] > 200:
                r += p[0]; g += p[1]; b += p[2]; n += 1
    if n > 0:
        avg = (r/n + g/n + b/n) / 3
    else:
        avg = 0
    bar = '#' * int(avg / 4)
    print(f"x={x:4d}: {bar}")

# Sample pixel colors at specific positions
print("\n=== COLOR SAMPLES AT KEY POINTS ===")
points = [
    ("Center player face area", w//2 - 40, h//3, w//2 + 40, h//2),
    ("Center player body", w//2 - 50, h//2, w//2 + 50, int(h*0.7)),
    ("Left player 1", int(w*0.15), h//3, int(w*0.25), int(h*0.7)),
    ("Left player 2", int(w*0.05), h//3, int(w*0.15), int(h*0.7)),
    ("Right player 1", int(w*0.75), h//3, int(w*0.85), int(h*0.7)),
    ("Right player 2", int(w*0.85), h//3, int(w*0.95), int(h*0.7)),
    ("Center bottom (gold text)", w//2 - 100, int(h*0.85), w//2 + 100, int(h*0.95)),
    ("Center bottom (white text)", w//2 - 100, int(h*0.92), w//2 + 100, h),
    ("Left arrow area", 10, h//3, 50, 2*h//3),
    ("Right arrow area", w-50, h//3, w-10, 2*h//3),
]

for name, x1, y1, x2, y2 in points:
    region = img.crop((x1, y1, x2, y2))
    r, g, b, a = 0, 0, 0, 0
    n = 0
    for px in range(region.width):
        for py in range(region.height):
            p = region.getpixel((px, py))
            r += p[0]; g += p[1]; b += p[2]; a += p[3]; n += 1
    print(f"{name}: avg=({r//n:3d},{g//n:3d},{b//n:3d})")

# Check the player size ratio - center vs side
print("\n=== PLAYER SIZE RATIO ===")
# Center player bounding box (based on brightness)
center_region = img.crop((w//3, h//4, 2*w//3, 3*h//4))
c_pixels = list(center_region.getdata())
c_bright = sum(1 for p in c_pixels if p[0] > 100)
print(f"Center third bright pixels: {c_bright}/{len(c_pixels)} ({c_bright/len(c_pixels)*100:.1f}%)")

left_region = img.crop((w//8, h//4, w//3, 3*h//4))
l_pixels = list(left_region.getdata())
l_bright = sum(1 for p in l_pixels if p[0] > 100)
print(f"Left player region bright pixels: {l_bright}/{len(l_pixels)} ({l_bright/len(l_pixels)*100:.1f}%)")

# Check for border/edge between center and side players
print("\n=== OVERLAP/BORDER CHECK ===")
# Check if side players overlap with center
overlap_left = img.crop((w//3 - 30, h//4, w//3 + 30, 3*h//4))
ol_pixels = list(overlap_left.getdata())
ol_bright = sum(1 for p in ol_pixels if p[0] > 100 and p[3] > 200)
print(f"Left-overlap zone bright: {ol_bright}/{len(ol_pixels)} ({ol_bright/len(ol_pixels)*100:.1f}%)")

# Check for gradient masks/edges at player borders
print("\n=== EDGE/GRADIENT DETECTION BETWEEN PLAYERS ===")
gap_zones = [(int(w*0.28), int(w*0.33)), (int(w*0.38), int(w*0.43))]
for x1, x2 in gap_zones:
    gap = img.crop((x1, h//4, x2, 3*h//4))
    bright = sum(1 for p in gap.getdata() if p[0] > 100 and p[3] > 200)
    total = gap.size[0] * gap.size[1]
    print(f"Gap x={x1}-{x2}: {bright}/{total} ({bright/total*100:.1f}%) bright")
