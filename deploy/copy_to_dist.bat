@echo off
REM 默认目标目录为 dist
set "TARGET=%1"
if "%TARGET%"=="" set "TARGET=dist"

REM 复制 public/* 到目标目录
xcopy /E /I /Y public\* "%TARGET%\"

REM 复制 rlottie-wasm.wasm
copy /Y src\lib\rlottie\rlottie-wasm.wasm "%TARGET%\"

REM 复制 decoderWorker.min.wasm
copy /Y node_modules\opus-recorder\dist\decoderWorker.min.wasm "%TARGET%\"

REM 复制 emoji 资源
xcopy /E /I /Y node_modules\emoji-data-ios\img-apple-64 "%TARGET%\img-apple-64\"
xcopy /E /I /Y node_modules\emoji-data-ios\img-apple-160 "%TARGET%\img-apple-160\"
