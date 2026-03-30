# Vercel Serverless To-Do App

A beginner-friendly cloud-native serverless to-do web application built for direct deployment on Vercel.

## Tech Stack

- Vercel Serverless Functions with Node.js
- Static frontend using HTML, CSS, and JavaScript
- In-memory storage for demo purposes
- `uuid` for task IDs

## Project Structure

```text
vercel-serverless-todo-app/
|-- api/
|   |-- tasks.js
|-- index.html
|-- package.json
|-- README.md
|-- script.js
|-- style.css
|-- vercel.json
```

## API Endpoints

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks?id=TASK_ID`
- `DELETE /api/tasks?id=TASK_ID`

## Important Demo Note

This project uses **in-memory storage** inside the serverless function.

That means:

- tasks are available during the life of the running serverless instance
- data can reset after redeploys or cold starts
- this is good for demos and viva explanations
- this is not meant for production persistence

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Install Vercel CLI if needed:

```bash
npm install -g vercel
```

3. Start the Vercel development server:

```bash
npm run dev
```

4. Open the local URL shown by Vercel, usually `http://localhost:3000`

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Vercel will detect the project automatically.
4. Click **Deploy**.

After that, every new push to GitHub will trigger Vercel's built-in CI/CD deployment.

## Viva-Friendly Explanation

- The frontend is a static website.
- The backend is a Vercel Serverless Function inside `api/tasks.js`.
- One API file handles `GET`, `POST`, `PUT`, and `DELETE`.
- The browser uses `fetch()` to call `/api/tasks`.
- Task data is stored in memory for demo simplicity.
