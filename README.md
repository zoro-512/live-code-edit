#  Collaborative Code Editor (CBC)

[![Java Version](https://img.shields.io/badge/Java-17%20%2F%2021-orange.svg?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1+-brightgreen.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

An interactive, browser-native real-time collaborative development workspace. The platform integrates Conflict-Free Replicated Data Types (CRDTs) to facilitate concurrent code editing and provides isolated, multi-language execution sandboxes.

**🟢 Live Demo:** [https://live-code-edit.onrender.com/](https://live-code-edit.onrender.com/)

---

## 🚀 Key Features

* **Real-time CRDT Document Synchronization**: Employs **Yjs** and **y-monaco** for peer-to-peer real-time document synchronization. Transmits optimized Base64-encoded binary delta updates over STOMP WebSockets to resolve concurrent edit conflicts.
* **Isolated Multi-Runtime Compilation Sandboxes**:
  * **Server-Side Runtime (Java)**: Executes Java programs securely in isolated, resource-constrained container environments (`128MB RAM / 1 CPU`) using Docker-out-of-Docker (DooD) socket communication. *(Note: Java execution is disabled on the free cloud deployment due to Docker constraints).*
  * **Client-Side Runtime (JS, HTML, CSS)**: Compiles and runs browser-native execution profiles locally using sandboxed HTML `<iframe>` windows. Intercepts console logging outputs using window event messaging and provides an interactive visual web preview panel.
* **Unified Console Output & Live Previews**: Integrates a dark console panel capturing standard output stream, standard error, process exit codes, and millisecond execution times.
* **Stateless Security & RBAC**: API endpoints and WebSocket channels secured using stateless JWT authentication with Spring Security filtering.
* **Workspace Management Dashboard**: Modern workspace panel providing real-time peer presence status, shared room creation, and dynamic join token authorization.

---

## 📂 Project Directory Structure

```text
cbc/
├── frontend/                  # React (Vite) Single Page Application
│   ├── src/
│   │   ├── components/        # Reusable UI containers
│   │   ├── hooks/             # Custom React hooks (WebSockets, Code Execution)
│   │   └── pages/             # Auth portal, Dashboard explorer, Workspace page
├── src/                       # Spring Boot Backend API Server
│   └── main/java/com/cbc/
│       ├── config/            # JWT & Security config
│       ├── controller/        # Auth, Room, & Execution API controllers
│       ├── dto/               # Data Transfer Objects
│       ├── entity/            # Hibernate database entity mapping
│       ├── repository/        # Spring Data JPA repositories
│       └── service/           # Core logic (Code execution, Rooms)
├── docker-runner/             # Sandboxed Java compiler Docker configurations
├── docker-compose.yml         # Network & services orchestration for local dev
├── .env.example               # Environment variables template
└── README.md                  # System Documentation
```

---

## ☁️ Cloud Deployment (Render)

This application is fully compatible with Render's Free Tier using PostgreSQL as the database.

### Frontend Deployment
1. Connect your GitHub repository to a **Static Site** on Render.
2. Build Command: `npm install && npm run build`
3. Publish Directory: `dist`
4. Add Environment Variable:
   * `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com`

### Backend Deployment
1. Create a **PostgreSQL** database on Render.
2. Connect your GitHub repository to a **Web Service** on Render.
3. Select Docker or Java as the runtime.
4. Add Environment Variables:
   * `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<internal-db-host>/<db-name>`
   * `SPRING_DATASOURCE_USERNAME`: `<db-user>`
   * `SPRING_DATASOURCE_PASSWORD`: `<db-password>`
   * `CORS_ALLOWED_ORIGINS`: `https://your-frontend-url.onrender.com`
   * `RENDER`: `true`

---

## 📥 Local Development Setup

### 1. Configure the Environment
Clone the repository and copy the `.env.example` file to create your local `.env` configuration:
```bash
cp .env.example .env
```

> [!IMPORTANT]  
> If using Java execution locally, update **`EXECUTION_HOST_PATH`** to point to the absolute path of the `temp/` folder on your local machine (e.g. `C:/Users/name/Downloads/cbc/temp`). Use forward slashes `/`.

### 2. Database Setup
Ensure you have MySQL or PostgreSQL running locally, and update `application.properties` with your database credentials. Alternatively, you can use the provided `docker-compose.yml` to spin up a local MySQL instance:
```bash
docker compose up -d mysql
```

### 3. Run the Backend (Spring Boot)
Run the application using Maven wrapper or your IDE:
```bash
mvn spring-boot:run
```
The backend API will start on `http://localhost:8081`.

### 4. Run the Frontend (React / Vite)
Open a new terminal, navigate to the `frontend` folder, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`.

---

## 🔌 API Endpoints Reference

### 🔐 Authentication (`/auth`)
* `POST /auth/signup` - Registers a new user. Accepts JSON: `{ "name", "email", "password" }`.
* `POST /auth/login` - Authenticates a user. Returns JSON: `{ "accessToken", "refreshToken", "email" }`.

### 🏠 Rooms (`/room`)
* `POST /room/create` - Creates a new room. Accepts JSON: `{ "roomName" }`.
* `POST /room/join` - Joins an existing room using a code. Accepts JSON: `{ "roomCode" }`.
* `GET /room/myRooms` - Fetches all workspaces joined/created by the authenticated user.
* `GET /room/{roomId}/code` - Retrieves the currently saved code.
* `POST /room/{roomId}/save` - Auto-saves active edits.

### 💻 Code Execution (`/execute`)
* `POST /execute/run` - Triggers compiler sandbox (Local only). Accepts JSON: `{ "files": { "Main.java": "..." }, "language", "roomId" }`.
