# Feather

Lightweight chat interface for experimenting with AI models. A minimalist alternative to Open WebUI or LibreChat.


## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure backend:**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Start development servers:**
   ```bash
   # From project root
   npm run dev
   ```

4. **Open browser:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## Environment Variables

### Server (`.env`)

```env
PORT=3001
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GOOGLE_API_KEY=your_google_key_here
```

### Client (`.env`)

```env
VITE_API_URL=http://localhost:3001
```

## Architecture

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Zustand
- **Backend:** Express + Vercel AI SDK 

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build Tool | Vite |
| Framework | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | Shadcn/UI |
| State | Zustand + useChat hook (messages) |
| Backend Framework | Express |
| AI Integration | Vercel AI SDK |

## Project Structure

```
/feather
├── /client                 # React frontend
│   ├── /src
│   │   ├── /components
│   │   │   ├── /ui         # Shadcn primitives
│   │   │   └── /chat       # Chat components
│   │   ├── /lib            # Utilities & types
│   │   ├── /store          # Zustand config store
│   │   └── App.tsx         # Main app with useChat
│   └── package.json
│
├── /server                 # Express proxy
│   ├── /src
│   │   ├── index.ts        # Main server
│   │   ├── providers.ts    # AI SDK provider registry
│   │   ├── config.ts       # Environment config
│   │   └── types.ts        # TypeScript interfaces
│   └── package.json
│
└── package.json            # Root orchestrator
```

## Development

### Requirements

- Node.js 18+
- npm or yarn
- At least one LLM provider API key

### Running the Project

```bash
# Install all dependencies
npm install

# Start both client and server
npm run dev
```

### Building for Production

```bash
npm run build
```

## API Providers

### OpenAI

Get your API key from [platform.openai.com](https://platform.openai.com)

### Anthropic

Get your API key from [console.anthropic.com](https://console.anthropic.com)

### Google

Get your API key from [makersuite.google.com](https://makersuite.google.com)

## License

MIT
