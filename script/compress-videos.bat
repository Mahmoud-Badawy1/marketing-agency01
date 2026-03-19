@echo off
REM Video Compression Script for Windows using FFmpeg
REM This script compresses hero videos using H.265 codec
REM 
REM INSTALLATION:
REM   1. Install FFmpeg via Chocolatey: choco install ffmpeg
REM   2. OR Download from https://ffmpeg.org/download.html
REM   3. Add FFmpeg to system PATH
REM
REM Run this script from the project root directory

echo.
echo ========================================
echo    Video Compression Script (Windows)
echo ========================================
echo.

REM Check if FFmpeg is installed
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] FFmpeg not found. Please install FFmpeg:
    echo.
    echo   Option 1: Chocolatey (recommended)
    echo   - choco install ffmpeg
    echo.
    echo   Option 2: Manual Download
    echo   - https://ffmpeg.org/download.html
    echo   - Add installation folder to system PATH
    echo.
    pause
    exit /b 1
)

echo [OK] FFmpeg is installed
echo.

REM Define directories
set INPUT_DIR=attached_assets\videos
set OUTPUT_DIR=attached_assets\videos\compressed

REM Create output directory
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

REM Video files to compress
set VIDEOS[0]=hero-slide-1.mp4
set VIDEOS[1]=hero-slide-2.mp4
set VIDEOS[2]=hero-slide-3.mp4

REM FFmpeg parameters
set CODEC=libx265
set CRF=28
set PRESET=medium
set RESOLUTION=1920x1080
set AUDIO_BITRATE=96k

echo Compression Settings:
echo   Codec: H.265 (HEVC)
echo   Quality: CRF %CRF% (better quality = lower number)
echo   Preset: %PRESET% (faster = less compression)
echo   Resolution: %RESOLUTION%
echo   Audio Bitrate: %AUDIO_BITRATE%
echo.

REM Process each video
for %%V in (hero-slide-1.mp4 hero-slide-2.mp4 hero-slide-3.mp4) do (
    set INPUT_FILE=%INPUT_DIR%\%%V
    set OUTPUT_FILE=%OUTPUT_DIR%\%%~nV

    if exist "!INPUT_FILE!" (
        echo.
        echo [PROCESSING] %%V
        echo   Input:  !INPUT_FILE!
        echo   Output: !OUTPUT_FILE!
        echo.
        
        ffmpeg -i "!INPUT_FILE!" ^
            -c:v %CODEC% ^
            -crf %CRF% ^
            -preset %PRESET% ^
            -s %RESOLUTION% ^
            -c:a aac ^
            -b:a %AUDIO_BITRATE% ^
            -y ^
            "!OUTPUT_FILE!"
        
        if !errorlevel! equ 0 (
            echo [SUCCESS] Compression complete
            REM Calculate reduction
            for %%A in ("!INPUT_FILE!") do set INPUT_SIZE=%%~zA
            for %%B in ("!OUTPUT_FILE!") do set OUTPUT_SIZE=%%~zB
            set /a REDUCTION=(!INPUT_SIZE! - !OUTPUT_SIZE!) * 100 / !INPUT_SIZE!
            echo   File size reduced by ~!REDUCTION!%%
        ) else (
            echo [ERROR] Compression failed for %%V
        )
    ) else (
        echo [WARNING] Not found: !INPUT_FILE!
    )
)

echo.
echo ========================================
echo Compression Complete
echo ========================================
echo.
echo Next Steps:
echo   1. Check compressed videos in: %OUTPUT_DIR%
echo   2. Verify quality by playing videos
echo   3. If satisfied, replace originals:
echo      - Move %OUTPUT_DIR%\* to %INPUT_DIR%\
echo      - Delete originals
echo   4. Run "npm run build" to rebuild
echo.
pause
