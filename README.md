
# Ifham WebSockets Playground

Learning project for Spring Boot WebSockets + React (SockJS + stompjs).

## Structure
- `/backend` — Spring Boot server (WebSocket, STOMP)
- `/frontend` — React app (Socket client)
- `/docs` — notes and tasks

## Goal (roadmap)
1. Phase 1: Basic connection — "Hello" example
2. Phase 2: Chat between clients
3. Phase 3: Progress updates + file handling
4. Phase 4: Integrate OCR pipeline + auto-fill forms

## How to start
### Backend
- Use Spring Initializr to create project with:
  - Spring Web
  - WebSocket (spring-boot-starter-websocket)
  - Lombok (optional)
  - Validation (optional)

### Frontend
- Use Vite or Create React App.
- Install `sockjs-client` and `stompjs`.

## Branching
- `main` — production-ready
- `dev` — development integration
- feature branches: `phase1-basic`, `phase2-chat`, etc.

## Contributing
Open issues for each phase and create PRs from feature branches into `dev`.
