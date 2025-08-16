# ProjectFlow: A Collaborative Project Management Tool

ProjectFlow is a modern, full-stack project management application designed to help teams efficiently manage tasks and projects. It features a modular architecture, real-time updates, and role-based access control, providing a seamless and collaborative environment.

This application is built with the **NESTJS** framework for the backend and **Next.js (React)** for the frontend, showcasing best practices in modern web development.

![ProjectFlow Screenshot](https://i.ibb.co/XYZ/your-screenshot-url.png) 
<!-- Replace this with a nice screenshot of your app's dashboard -->

---

## ✨ Features

This project is packed with features that make it a powerful tool for any development team:

**Core Functionalities:**
- **User Authentication:** Secure user registration and login system using JWT (JSON Web Tokens). Includes password reset functionality via email.
- **Project Management:** Create, read, update, and delete projects. Assign members to specific projects.
- **Task Management:** Full CRUD operations for tasks within projects.
- **Role-Based Access Control (RBAC):**
    - **Admin:** Can manage all projects, tasks, and users.
    - **Project Manager:** Can create new projects, manage their own projects, and create/assign tasks within them.
    - **Developer:** Can only view and update tasks they are assigned to.
- **Multi-User Assignment:** Assign multiple team members to a single task.

**Advanced Features:**
- **Real-time Updates:** Utilizes **WebSockets (Socket.IO)** to provide real-time updates. When a task is updated, all members of that project see the changes instantly without a page refresh.
- **Commenting System:** A dedicated page for each task to view details and collaborate through comments.
- **Activity Logging:** Every significant action on a task (creation, status change) is logged and displayed.
- **Project Timeline (Gantt Chart):** A visual Gantt chart representation of the project's timeline, showing task durations and dependencies.
- **Full-Text Search:** A powerful search bar in the header to find any project or task you have access to.

---

## 🛠️ Tech Stack

**Backend:**
- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [TypeORM](https://typeorm.io/)
- **Authentication:** [Passport.js](http://www.passportjs.org/) (JWT & Local Strategies)
- **Real-time:** [Socket.IO](https://socket.io/)
- **Email:** [Nodemailer](https://nodemailer.com/)

**Frontend:**
- **Framework:** [Next.js](https://nextjs.org/) (React)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Real-time:** [Socket.IO Client](https://socket.io/docs/v4/client-installation/)
- **Timeline:** [dhtmlx-gantt](https://dhtmlx.com/gantt/)

**DevOps:**
- **Containerization:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later recommended)
- [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/install/)
- A running [PostgreSQL](https://www.postgresql.org/download/) instance (or you can use the one from Docker Compose)
- A code editor like [VS Code](https://code.visualstudio.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Setup Backend Environment Variables:**
    - Navigate to the backend directory: `cd project-management-backend`
    - Create a `.env` file by copying the example: `cp .env.example .env` (or create it manually).
    - Open the `.env` file and fill in your configuration details:
      ```env
      # Database
      DATABASE_HOST=localhost # or 'db' if using Docker Compose
      DATABASE_PORT=5432
      DATABASE_USER=postgres
      DATABASE_PASSWORD=your_db_password
      DATABASE_NAME=projectflow_dev

      # JWT
      JWT_SECRET=generate_a_strong_secret_key

      # Mailer (for password reset)
      MAIL_HOST=smtp.gmail.com
      MAIL_USER=your-email@gmail.com
      MAIL_PASSWORD=your-gmail-app-password
      MAIL_FROM="ProjectFlow" <your-email@gmail.com>
      ```

3.  **Install Backend Dependencies:**
    ```bash
    npm install
    ```

4.  **Setup Frontend Environment Variables:**
    - Navigate to the frontend directory: `cd ../project-management-frontend`
    - Create a `.env.local` file.
    - Add the API URL:
      ```env
      NEXT_PUBLIC_API_URL=http://localhost:3001
      ```

5.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

### Running the Application

You need two separate terminals to run the backend and frontend servers.

1.  **Run the Backend Server:**
    ```bash
    # In the project-management-backend directory
    npm run start:dev
    ```
    The backend server will be running on `http://localhost:3001`.

2.  **Run the Frontend Server:**
    ```bash
    # In the project-management-frontend directory
    npm run dev
    ```
    The frontend application will be available at `http://localhost:3000`.

---

## 🐳 Running with Docker

You can also run the entire application stack (Frontend, Backend, and Database) using Docker Compose.

1.  **Create a Root `.env` file:**
    - In the project's root directory, create a `.env` file.
    - Add your database and JWT secret variables:
      ```env
      POSTGRES_USER=postgres
      POSTGRES_PASSWORD=your_super_secret_password
      POSTGRES_DB=projectflow_docker
      JWT_SECRET=your_docker_jwt_secret
      ```

2.  **Build and Run the Containers:**
    - Make sure Docker Desktop is running.
    - In the root directory, run:
      ```bash
      docker-compose up --build
      ```
    - To run in detached mode: `docker-compose up --build -d`

3.  **Access the Application:**
    - Frontend: `http://localhost:3000`
    - Backend: `http://localhost:3001`
    - PostgreSQL Database: `localhost:5432`

---

## ☁️ Deployment

This application is ready to be deployed on any cloud platform that supports Node.js and PostgreSQL, or Docker containers. The guide below is for **Render.com**, which offers a generous free tier.

1.  **Push your code** to a GitHub or GitLab repository.
2.  **Create a PostgreSQL Database** on Render. Copy the **Internal Connection URL**.
3.  **Create a Backend Web Service:**
    - Connect your repository.
    - **Root Directory:** `project-management-backend`
    - **Build Command:** `npm install && npm run build`
    - **Start Command:** `node dist/main`
    - Add all necessary environment variables (Database credentials from Render, JWT secret, etc.) in the "Environment" tab.
4.  **Create a Frontend Web Service:**
    - Connect the same repository.
    - **Root Directory:** `project-management-frontend`
    - Render will auto-detect Next.js settings.
    - Add the environment variable `NEXT_PUBLIC_API_URL` with the URL of your deployed backend service (e.g., `https://your-backend.onrender.com`).
5.  **Update CORS:** In your backend service's environment variables, set `FRONTEND_URL` to your deployed frontend URL. Ensure your NestJS CORS configuration uses this variable.

Congratulations! Your application is now live.