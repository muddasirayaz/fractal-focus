import os
from PIL import Image

def generate_icons(source_path='master_icon.png', output_folder='icons'):
    if not os.path.exists(source_path):
        print(f"Error: {source_path} not found. Please provide a 1024x1024 master icon.")
        return

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    try:
        master = Image.open(source_path)
        if master.size != (1024, 1024):
            print(f"Warning: Source icon is {master.size}, recommended size is 1024x1024.")

        # Definition of sizes (name, size)
        icons = [
            ("icon-192.png", (192, 192)),
            ("icon-512.png", (512, 512)),
            ("apple-touch-icon-180.png", (180, 180)),
            ("apple-touch-icon-120.png", (120, 120)),
            ("apple-store-1024.png", (1024, 1024)),
            ("android-store-512.png", (512, 512)),
            ("android-launcher-192.png", (192, 192)),
        ]

        for name, size in icons:
            out_path = os.path.join(output_folder, name)
            # Use Resampling.LANCZOS for high-quality downscaling
            resized = master.resize(size, Image.Resampling.LANCZOS)
            resized.save(out_path, "PNG")
            print(f"Generated: {out_path} ({size[0]}x{size[1]})")

        print("\nIcon generation complete.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    generate_icons()
