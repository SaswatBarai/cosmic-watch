# AI-LOG: Cosmic Watch (Perilux)

**Project:** Cosmic Watch — Near-Earth Asteroid Tracking & Alert System  
**Tech Stack:** React 19, Vite, Tailwind CSS 4, Three.js, Express 5, MongoDB, Socket.io  
**Date:** February 2026

---

## AI Tools Used

We used multiple AI tools throughout the development of this project:

| AI Tool | Usage Areas |
|---------|-------------|
| **Google Gemini** | Code generation, debugging, architecture planning, API integration logic |
| **ChatGPT (OpenAI)** | Feature design, code reviews, problem-solving, documentation drafting |
| **Cursor AI (Claude)** | In-editor code assistance, refactoring, real-time suggestions, linting fixes |

---

## Frontend Dashboard & 3D Visualization

**AI Tools Used:** Gemini, ChatGPT, Cursor AI

- **Dashboard UI:** AI tools helped build the main Dashboard page with asteroid cards, stat cards, filtering controls, and search functionality using Tailwind CSS.
- **Responsive design:** ChatGPT helped ensure mobile-responsive layouts across all pages.
- **Framer Motion animations:** Used AI to add smooth animations to page transitions and interactive elements.

---

## Real-Time Chat & Socket.io

**AI Tools Used:** Gemini, ChatGPT, Cursor AI

- **Socket.io architecture:** Used ChatGPT to design the real-time chat system where users can discuss specific asteroids in live chat rooms.
- **Chat persistence:** Gemini assisted in building the `asteroidChatStore.js` service and `Chat` MongoDB model to persist chat messages with `asteroidId`, `userId`, `userName`, and `text`.


---

## How AI Was Used (General Patterns)
1. **Debugging:** When encountering errors (CORS issues, Socket.io connection failures, cookie authentication problems in production), AI tools helped diagnose root causes and suggest fixes.
2. **Code review:** AI was used to audit code for security vulnerabilities, performance issues, and best practices.

---

