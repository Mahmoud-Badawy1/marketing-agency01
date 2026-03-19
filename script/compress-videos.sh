#!/bin/bash
# Video Compression Script using FFmpeg
# This script compresses hero videos to reduce bundle size while maintaining quality
# Installation: 
#   Windows: choco install ffmpeg
#   macOS: brew install ffmpeg
#   Linux: sudo apt-get install ffmpeg

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🎬 Video Compression Script${NC}"
echo ""

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ FFmpeg not found. Please install FFmpeg:${NC}"
    echo "   Windows: choco install ffmpeg"
    echo "   macOS: brew install ffmpeg"
    echo "   Linux: sudo apt-get install ffmpeg"
    exit 1
fi

echo -e "${GREEN}✓ FFmpeg found${NC}"
echo ""

# Define input and output directories
INPUT_DIR="attached_assets/videos"
OUTPUT_DIR="attached_assets/videos/compressed"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Video files to compress
VIDEOS=("hero-slide-1.mp4" "hero-slide-2.mp4" "hero-slide-3.mp4")

# FFmpeg compression settings
# -c:v libx265: Use H.265 codec (better compression than H.264)
# -crf 28: Quality (0=lossless, 28=good quality with high compression, 51=worst quality)
# -preset medium: Encoding preset (ultrafast, fast, medium, slow, slower)
# -s 1920x1080: Resolution (1080p max for web)
# -b:a 96k: Audio bitrate (96 kbps is sufficient for speech)

echo -e "${YELLOW}Compression Settings:${NC}"
echo "  Codec: H.265 (HEVC)"
echo "  Quality: CRF 28 (good balance)"
echo "  Preset: medium (quality/speed)"
echo "  Resolution: 1920x1080 (max)"
echo "  Audio Bitrate: 96 kbps"
echo ""

for video in "${VIDEOS[@]}"; do
    INPUT_FILE="$INPUT_DIR/$video"
    OUTPUT_FILE="$OUTPUT_DIR/${video%.mp4}-compressed.mp4"
    
    if [ ! -f "$INPUT_FILE" ]; then
        echo -e "${YELLOW}⚠️  $INPUT_FILE not found${NC}"
        continue
    fi
    
    # Get original file size
    ORIGINAL_SIZE=$(du -h "$INPUT_FILE" | cut -f1)
    
    echo -e "${GREEN}Compressing: $video${NC}"
    echo "  Input: $ORIGINAL_SIZE"
    echo "  Output: $OUTPUT_FILE"
    echo ""
    
    # Run FFmpeg compression
    ffmpeg -i "$INPUT_FILE" \
        -c:v libx265 \
        -crf 28 \
        -preset medium \
        -s 1920x1080 \
        -c:a aac \
        -b:a 96k \
        -y \
        "$OUTPUT_FILE"
    
    if [ $? -eq 0 ]; then
        COMPRESSED_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
        ORIGINAL_BYTES=$(stat -f%z "$INPUT_FILE" 2>/dev/null || stat -c%s "$INPUT_FILE" 2>/dev/null)
        COMPRESSED_BYTES=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null)
        REDUCTION=$((($ORIGINAL_BYTES - $COMPRESSED_BYTES) * 100 / $ORIGINAL_BYTES))
        
        echo -e "${GREEN}✓ Compression successful${NC}"
        echo "  Compressed: $COMPRESSED_SIZE"
        echo "  Reduction: ~${REDUCTION}%"
        echo ""
    else
        echo -e "${RED}✗ Compression failed for $video${NC}"
        echo ""
    fi
done

echo -e "${GREEN}📝 Next Steps:${NC}"
echo "  1. Review compressed videos in: $OUTPUT_DIR"
echo "  2. Replace original videos with compressed versions"
echo "  3. Update video sources in HeroSection component"
echo "  4. Run 'npm run build' to rebuild"
echo ""
