# Basic Ticket Management System

## Project Overview
Ticket Management System built with **React (Vite)** on the frontend and **Node.js (Express)** with **PostgreSQL** on the backend.  
It features user authentication, ticket and template management, and state handling using custom React hooks.

---

## Technologies Used
- **Frontend:** React (Vite)
- **Backend:** Node.js (Express)
- **Database:** PostgreSQL
- **State Management:** React Hooks
- **Authentication:** JWT
- **Containerization:** Docker

---

## How to Run with Docker

### 1. **Clone the repository**
```bash
git clone https://github.com/signekreicere/mikrotik
```

### 2. **Navigate to the project folder**
```bash
cd mikrotik
```

### 3. **Create a `.env` file**
Create a `.env` file in the root folder and add the following:

```plaintext
SECRET_KEY=f71cbb9e3ab7c9f1528a2ef71b3491d95b6cb8b11db1dbbd44c3f2fa1a1e828e
DB_USER=user
DB_HOST=db
DB_NAME=taskdb
DB_PASSWORD=password
DB_PORT=5432
```

---

### 4. **Build and start the containers**
Use Docker Compose to build and start the containers:

```bash
docker-compose up --build
```

---

### 5. **Apply the database schema**
The `dump.sql` file is included to initialize the database. To import it, follow these steps:

1. First, find the container name:
```bash
docker ps
```

---

### 6. **Access the app**
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:8000](http://localhost:8000)

---

### 7. **Login Credentials**
You can use the following credentials to log in:

- **Admin:**
    - Email: `test@example.com`
    - Password: `password`

- **Regular User:**
    - Email: `user@example.com`
    - Password: `password`

---

## Features
User authentication (JWT)  
Create, update, delete tickets  
Create and modify templates  
Archive tickets and templates
Filter functionality  
Custom fields in tickets