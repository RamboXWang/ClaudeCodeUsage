#!/bin/bash

# Chrome Web Store Screenshot Processor
# Resizes and converts screenshots to meet Chrome Web Store requirements
# Requirements: 1280x800 or 640x400 pixels, JPEG or 24-bit PNG (no alpha)

set -e

echo "📸 Chrome Web Store Screenshot Processor"
echo "=========================================="
echo ""

# Create screenshots directory if it doesn't exist
mkdir -p screenshots
mkdir -p screenshots/processed

# Check if sips is available (macOS built-in)
if ! command -v sips &> /dev/null; then
    echo "❌ Error: 'sips' command not found."
    echo "This script requires macOS's built-in 'sips' tool."
    exit 1
fi

# Find all image files in current directory
SCREENSHOTS=($(find . -maxdepth 1 \( -name "screenshot-*.png" -o -name "screenshot-*.jpg" -o -name "screenshot-*.jpeg" \) 2>/dev/null))

if [ ${#SCREENSHOTS[@]} -eq 0 ]; then
    echo "❌ No screenshots found!"
    echo ""
    echo "Please take screenshots and save them as:"
    echo "  - screenshot-1-badge.png"
    echo "  - screenshot-2-popup.png"
    echo "  - screenshot-3-options.png"
    echo "  - etc."
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "Found ${#SCREENSHOTS[@]} screenshot(s) to process:"
for img in "${SCREENSHOTS[@]}"; do
    echo "  • $(basename "$img")"
done
echo ""

# Process each screenshot
PROCESSED_COUNT=0

for img in "${SCREENSHOTS[@]}"; do
    filename=$(basename "$img")
    name="${filename%.*}"

    echo "Processing: $filename"

    # Get original dimensions
    width=$(sips -g pixelWidth "$img" | awk '/pixelWidth:/ {print $2}')
    height=$(sips -g pixelHeight "$img" | awk '/pixelHeight:/ {print $2}')

    echo "  Original size: ${width}x${height}"

    # Calculate aspect ratio
    aspect_ratio=$(echo "scale=4; $width / $height" | bc)
    target_ratio=$(echo "scale=4; 1280 / 800" | bc)  # 1.6

    # Determine target size (1280x800 preferred)
    target_width=1280
    target_height=800

    # If image is smaller, use 640x400
    if [ $width -lt 1280 ] || [ $height -lt 800 ]; then
        target_width=640
        target_height=400
        echo "  → Using smaller size: 640x400"
    else
        echo "  → Using standard size: 1280x800"
    fi

    # Output file (convert to PNG if not already)
    output_file="screenshots/processed/${name}.png"

    # Copy original to temp location
    temp_file="screenshots/processed/${name}_temp.png"
    cp "$img" "$temp_file"

    # Remove alpha channel if present (convert to 24-bit PNG)
    sips -s format png "$temp_file" --out "$temp_file" &>/dev/null

    # Resize to target dimensions (maintaining aspect ratio, then crop if needed)
    # First, resize to fit within target dimensions
    sips -Z $(($target_width > $target_height ? $target_width : $target_height)) "$temp_file" &>/dev/null

    # Then pad or crop to exact dimensions
    sips -z $target_height $target_width "$temp_file" --out "$output_file" &>/dev/null

    # Remove temp file
    rm "$temp_file"

    # Verify output
    out_width=$(sips -g pixelWidth "$output_file" | awk '/pixelWidth:/ {print $2}')
    out_height=$(sips -g pixelHeight "$output_file" | awk '/pixelHeight:/ {print $2}')

    echo "  ✅ Processed: ${out_width}x${out_height} → $output_file"
    echo ""

    ((PROCESSED_COUNT++))
done

echo "=========================================="
echo "✅ Successfully processed $PROCESSED_COUNT screenshot(s)"
echo ""
echo "Processed files are in: screenshots/processed/"
echo ""
echo "Files ready for upload:"
ls -lh screenshots/processed/*.png | awk '{print "  • " $9 " (" $5 ")"}'
echo ""
echo "Next steps:"
echo "1. Review processed screenshots"
echo "2. Upload to Chrome Web Store"
echo "3. Submit for review"
echo ""
