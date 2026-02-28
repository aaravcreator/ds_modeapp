Here is your **README.md** file content:

---

# Node.js + FFmpeg Server

This project runs a Node.js server using FFmpeg and starts a local server at:

```
http://localhost:3000
```

The server is started with:

```
node script.js
```

---

## 📦 Requirements

- Node.js (v16 or higher recommended)
- FFmpeg installed and added to system PATH

---

## 🔧 Installation

### 1. Install Node.js

Check if installed:

```
node -v
npm -v
```

If not installed, download from: [https://nodejs.org](https://nodejs.org)

---

### 2. Install FFmpeg

**macOS (Homebrew):**

```
brew install ffmpeg
```

**Ubuntu/Debian:**

```
sudo apt update
sudo apt install ffmpeg
```

**Windows:**

- Download from [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
- Add FFmpeg to system PATH
- Verify with:

```
ffmpeg -version
```

---

## 🚀 Setup

1. Navigate to your project folder:

```
cd your-project-folder
```

2. Install dependencies:

```
npm install
```

3. Start the server:

```
node script.js
```

---

## 🌐 Open in Browser

After running the script, open:

```
http://localhost:3000
```

---

## 🛠 Troubleshooting

### Port 3000 already in use

**macOS/Linux:**

```
lsof -i :3000
kill -9 <PID>
```

**Windows:**

```
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

### FFmpeg not found

Run:

```
ffmpeg -version
```

If not recognized, reinstall and ensure it is added to your PATH.

---

## 📂 Project Structure

```
project-folder/
│
├── script.js
├── package.json
└── README.md
```

---

You can copy this directly into your `README.md` file.
