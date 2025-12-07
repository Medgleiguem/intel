# 🚀 Moussadar - Lightweight AI Assistant for Public Services

**Moussadar** (مساعد - "Assistant" in Arabic) is an ultra-lightweight AI-powered assistant designed to help citizens access digital public services even with poor internet connectivity.

## 🌟 Features

- **Ultra-lightweight**: &lt; 5MB PWA + 70MB AI model
- **Offline-first**: Complete functionality without internet
- **Bilingual**: French & Arabic with RTL support
- **AI-powered**: Smart recommendations and assistance
- **Low-bandwidth**: Optimized for 2G/3G connections
- **Accessible**: WCAG 2.1 compliant, voice support
- **Progressive**: Works on any device with a browser

## 🛠️ Technology Stack

### Frontend

- **Vue.js 3** with Vite for fast builds
- **Tailwind CSS** for responsive design
- **PWA** with service workers for offline functionality
- **IndexedDB** for local data storage

### Backend

- **Node.js** with Express.js
- **SQLite** for lightweight database
- **ONNX Runtime** for AI model inference
- **Better-sqlite3** for efficient database operations

### AI Model

- **SmolLM2-135M** quantized to INT4
- **ONNX format** for cross-platform compatibility
- **Local inference** for privacy and offline operation

## 📦 Installation

### Prerequisites

- Node.js 18+
- Python 3.8+ (for AI model service)
- 100MB free disk space

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/your-org/moussadar.git
cd moussadar
```
