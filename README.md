# Team Task Manager

A full-stack Team Task Manager application built with the MERN stack (MongoDB, Express, React, Node.js). 

## Features
- **Role-Based Access Control**: Admins can create projects and assign tasks; Members can track and update statuses.
- **Authentication**: JWT-based secure login and registration.
- **Advanced Task Management**: Filter tasks by project or status, and search by title. Manage task priorities (Low, Medium, High).
- **Dashboard Overview**: Key metrics including total tasks, progress metrics, and overdue tasks.
- **Modern UI**: Dark mode theme with Royal Blue and Emerald Green accents (glassmorphism design).
- **UX & Feedback**: Skeleton loaders for seamless data fetching and custom Toast notifications for success/error feedback.

## Why I Built It This Way (Architecture Decisions)
- **Custom Toasts & Modals**: Rather than relying on heavy third-party UI libraries like Material-UI or external toast libraries, I built lightweight, custom React Contexts (`ToastContext`) and components (`ConfirmModal`). This keeps the bundle size minimal and allows for pixel-perfect integration with the Emerald/Royal Blue theme.
- **Tailwind CSS v4**: Utilized the latest version of Tailwind with Vite's `@tailwindcss/vite` plugin for lightning-fast compilation and an elegant configuration-free design system.
- **Cascading Deletes**: Implemented cascading deletes on the backend. When an Admin deletes a Project, all associated Tasks are automatically cleaned up from the database to prevent orphaned data.
- **List View Over Kanban**: Chose a streamlined list view with inline status dropdowns to ensure maximum efficiency and readability, avoiding the clutter sometimes associated with drag-and-drop boards on smaller screens.

## Future Roadmap
- **Drag-and-Drop Interface**: Introduce a Kanban board view using something like `dnd-kit` for users who prefer visual task progression.
- **Email Notifications**: Integrate SendGrid or Nodemailer to notify assigned members when a new task is created or its status is updated.
- **Activity Logs**: Track changes to task statuses and assignments to maintain an audit trail for teams.
- **Rich Text Descriptions**: Allow markdown or rich text (using a lightweight editor) in task descriptions.

## Project Structure
- `/server`: Node.js, Express, and MongoDB (Backend)
- `/client`: React, Vite, and Tailwind CSS (Frontend)

## Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)

## Local Setup

### 1. Backend Setup
1. Open terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Ensure you have a `.env` file in the `server` directory with the following variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The frontend will typically run on `http://localhost:5173`. It will automatically connect to the backend running on `http://localhost:5000`.

## Railway Deployment Instructions
This repository is structured to be easily deployed on Railway.

### Backend Deployment
1. Create a new service in Railway and select the `server` directory.
2. In the Railway dashboard, navigate to the Variables tab and add your `.env` variables (`MONGO_URI`, `JWT_SECRET`).
3. Railway will automatically detect `package.json` and start the Node.js server.

### Frontend Deployment
1. Create another service in Railway and select the `client` directory.
2. Add a build command in Railway settings: `npm run build`
3. Set the start command: `npm run preview` or use a static site hosting option on Railway pointing to the `dist` folder.
4. Add an environment variable to the frontend: `VITE_API_URL=https://your-backend-railway-url.app/api`.
