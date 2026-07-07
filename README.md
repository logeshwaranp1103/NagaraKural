# Nagarakural Desktop App

This project converts the Nagarakural PWA into a standalone Windows desktop application using Electron and `electron-builder`.

## Project Structure

- `app/`: Contains the website source files.
- `assets/`: Contains the application icon.
- `main.js`: Electron main process.
- `preload.js`: Preload script.
- `splash.html`: Splash screen shown on launch.
- `package.json`: Project configuration and build settings.
- `convert_icon.py`: Helper script to convert PNG icon to ICO format.

## Prerequisites

1.  **Node.js & npm**: Install from [nodejs.org](https://nodejs.org/).
2.  **Python & Pillow** (for icon conversion):
    ```bash
    pip install Pillow
    ```

## Build Instructions

### 1. Preparation
If you haven't already, convert the icon using the provided Python script:
```bash
python convert_icon.py
```
This will generate `assets/icon.ico`.

### 2. Install Dependencies
Run the following command in the project root:
```bash
npm install
```

### 3. Run the App (Development)
To test the application without building an installer:
```bash
npm start
```

### 4. Build Windows Installer (.exe)
To generate the NSIS installer:
```bash
npm run dist
```
The installer will be created in the `dist/` directory.

## Features implemented
- **Splash Screen**: Shows for 2 seconds on launch.
- **Window Persistence**: Remembers size and position using `electron-store`.
- **Geolocation**: Enabled in `webPreferences`.
- **Offline Support**: Loads from local files.
- **Installer**: Generates a Windows `.exe` with Desktop and Start Menu shortcuts.
