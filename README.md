
# Real-Time Microphone Transcription Web Application

This project is a full-stack, real-time speech-to-text application that captures audio from a user's browser, streams it to a Python backend via WebSockets, transcribes it using a local, open-source AI model, and displays the results live on the frontend. The entire system is containerized with Docker for easy setup and deployment.

## Getting Started

### Prerequisites

-   [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
-   A modern web browser (e.g., Chrome, Firefox)

### Installation & Running the Application

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/AmiyoKm/transcribe.git
    cd transcribe
    ```

2.  **Build and run the services using Docker Compose:**

    ```bash
    docker compose up
    ```

3.  **Access the application:**
    -   **Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser.
    -   **Backend API Docs**: The FastAPI documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

## Database Migrations

This project uses [Alembic](https://alembic.sqlalchemy.org/) to manage database schema migrations. To apply the latest migrations, run the following command while the Docker containers are running:

```bash
docker compose exec server alembic upgrade head
```

## Running Backend Tests

The backend is tested using [Pytest](https://docs.pytest.org/). To run the test suite, which is located in `server/tests/`, execute the following command:

```bash
docker compose exec server python -m pytest
```

## API Endpoints

The backend exposes a RESTful API for authentication and session management, and a WebSocket endpoint for real-time transcription.

### Authentication (`/auth`)

-   **`POST /auth/signup`**: Creates a new user account.
    -   **Request Body**: `{"email": "user@example.com", "password": "your_password"}`
    -   **Response**: Returns a JWT `access_token` and user details upon successful registration.

-   **`POST /auth/login`**: Authenticates a user and provides a JWT token.
    -   **Request Body**: `{"email": "user@example.com", "password": "your_password"}`
    -   **Response**: Returns a JWT `access_token`.

-   **`GET /auth/me`**: Retrieves the profile of the currently authenticated user.
    -   **Authentication**: Requires a valid JWT `access_token` in the `Authorization` header (`Bearer <token>`).
    -   **Response**: Returns the authenticated user's details.

### Transcription Sessions (`/sessions`)

-   **`GET /sessions`**: Retrieves all transcription sessions for the authenticated user.
    -   **Authentication**: Requires a valid JWT `access_token`.
    -   **Response**: Returns a list of all the sessions available for the user.

-   **`GET /sessions/{session_id}`**: Retrieves a specific transcription session by its ID.
    -   **Authentication**: Requires a valid JWT `access_token`.
    -   **Response**: Returns the details of the requested session.

-   **`DELETE /sessions/{session_id}`**: Deletes a specific transcription session.
    -   **Authentication**: Requires a valid JWT `access_token`.
    -   **Response**: Returns a success message.

### Real-Time Transcription (`/ws`)

-   **`WS /ws/transcribe?token=<jwt_token>`**: The WebSocket endpoint for streaming audio.
    -   **Connection**: A JWT `access_token` must be provided as a query parameter for authentication.
    -   **Data Flow**:
        1.  Client sends binary audio chunks.
        2.  Server sends back JSON messages with transcription results.
            -   **Partial results**: `{"type": "partial", "text": "Hello world"}` (sent while recording is active).
            -   **Final result**: `{"type": "final", "text": "The complete transcription."}` (sent once recording stops).
        3.  After the client stops sending audio and receives the final payload, the WebSocket connection is closed by the server.


### Data Flow

1.  **Authentication**: The user signs up or logs in. The FastAPI backend validates the credentials, creates a user record in the PostgreSQL database, and returns a JWT token.
2.  **Real-time Transcription**:
    - The user clicks the "Record" button, and the Next.js frontend captures microphone audio using the `MediaRecorder` API.
    - A WebSocket connection is established with the FastAPI backend, authenticating with the JWT token.
    - Audio chunks are streamed to the server in real-time.
    - The backend buffers the incoming audio and uses the `faster-whisper` model to generate transcriptions.
    - Partial transcription results are sent back to the frontend as they are generated, providing a live user experience.
3.  **Session Persistence**:
    - When the recording stops, the final transcript, along with metadata (duration, word count), is saved as a "session" in the database, linked to the user's account.

## Features

-   **Real-Time Transcription**: Live speech-to-text using `faster-whisper`.
-   **User Authentication**: Secure JWT-based authentication for users.
-   **Session Management**: View and manage past transcription sessions.
-   **CPU-Only**: Designed to run on standard hardware without requiring a dedicated GPU.
-   **Containerized**: Fully dockerized for cross-platform consistency and ease of deployment.

## Tech Stack

-   **Backend**: Python, FastAPI, SQLAlchemy, `faster-whisper`
-   **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI
-   **Database**: PostgreSQL
-   **Containerization**: Docker, Docker Compose

## Database Schema

The database schema is defined in [`server/db/schema.sql`](./server/db/schema.sql).


## Project Structure

The repository is organized into two main directories: `server` and `web`.

```
/
├── server/               # FastAPI Backend
│   ├── alembic/          # Database migrations
│   ├── db/               # SQLAlchemy models and base
│   ├── lib/              # Business logic (auth, transcription)
│   ├── routes/           # API endpoint definitions
│   └── tests/            # Automated tests
├── web/                  # Next.js Frontend
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # Frontend logic (API client, auth)
│   └── ...
├── docker-compose.yml    # Docker service definitions
└── README.md
```

## Limitations

-   The transcription quality depends on the `faster-whisper` model used (currently `tiny`). Larger models would improve accuracy at the cost of higher resource usage.
-   The application is designed for single-user, single-stream transcription. It does not currently handle concurrent transcriptions from the same user.

## Future Improvements

-   **Model Selection**: Allow users to choose different `faster-whisper` models (e.g., `base`, `small`) based on their needs.
-   **Enhanced Session Management**: Add features to search, filter, and delete transcription sessions.
-   **Real-time Audio Visualization**: Display a waveform or other visual feedback during recording.
## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
