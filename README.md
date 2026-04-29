# FusionSpace

A real-time collaborative code editor built for teams. Open files, edit together, and stay in sync — no setup, no friction.

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/fusionspace.git
cd fusionspace

# Install dependencies for both client and server
cd client && npm install
cd ../server && npm install
```

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_KEY_ID=your_gemini_api_key
```

Create a `.env` file in the `client/` directory:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Running Locally

```bash
# Terminal 1 — start the backend
cd server && node server.js

# Terminal 2 — start the frontend
cd client && npm start
```

The app will be available at `http://localhost:3000`.

---

## Usage

### 1. Create or Join a Room

<img width="1423" height="815" alt="image" src="https://github.com/user-attachments/assets/db5e4225-e950-4416-b83a-ed46502f4d4a" />

Navigate to the app and enter a **username** and a **Room ID**.  

<img width="1372" height="798" alt="image" src="https://github.com/user-attachments/assets/18303980-ae20-4534-b14e-58a2d1d8fe31" />

Use the **Generate Room ID** button to create a unique room instantly.  
Share the Room ID with teammates — anyone with it can join.


### 2. Upload and Edit Files

Use the **Upload** button in the sidebar to open a file from your machine.  
Supported formats: `.js` `.jsx` `.html` `.cpp` `.txt` `.md` `.doc` `.gitignore`

The file content loads immediately into the editor and is saved to the shared room.

<img width="1919" height="1027" alt="image" src="https://github.com/user-attachments/assets/1df922e8-6244-492e-8d97-15a9be2e5859" />


### 3. Collaborate in Real Time

All changes sync across every connected client automatically.  
Each file maintains its own **undo / redo** history per session.  
Active collaborators are listed in the right sidebar by name.

<img width="1919" height="967" alt="image" src="https://github.com/user-attachments/assets/d98d3639-5095-438f-a61a-0e29fe179de1" />


### 4. AI Assistant

Type a prompt in the bar at the bottom of the editor and press **Ask** (or `Enter`).  
The assistant has full context of the currently open file.

<img width="1388" height="104" alt="image" src="https://github.com/user-attachments/assets/3e97e611-03cf-4127-914a-b1410c3ab1e8" />


---

## Architecture

```
client/                  # React frontend
├── src/
│   ├── context/         # Socket.IO context provider
│   ├── pages/           # Room, JoinRoom, Chatbox, Tasks
│   └── components/      # Shared UI components

server/                  # Node.js + Express backend
├── Models/              # Mongoose schemas
├── Util/                # Database connection
└── server.js            # Socket.IO events, REST endpoints
```

**Sync strategy:** Last Write Wins (LWW) — every edit carries a `Date.now()` timestamp. The server persists a change only if its timestamp is newer than the stored version, preventing stale overwrites in concurrent sessions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS, Socket.IO Client |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini 1.5 Flash |
| Deployment | Render |

---

## Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'add: your feature description'`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

Please keep commits scoped and descriptive. One feature or fix per PR.

---

## License

MIT — see [LICENSE](./LICENSE) for details.
