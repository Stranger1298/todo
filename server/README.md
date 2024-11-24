# Todo App Backend

This is the backend server for the Todo application, providing API endpoints and real-time updates using Socket.IO.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a .env file with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=your-secret-key
PORT=5000
```

3. Start MongoDB locally or update MONGODB_URI with your MongoDB connection string.

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user
- POST /api/auth/logout - Logout user

### Todos
- GET /api/todos - Get all todos
- GET /api/todos/my - Get user's todos
- POST /api/todos - Create new todo
- PATCH /api/todos/:id - Update todo
- DELETE /api/todos/:id - Delete todo
- PATCH /api/todos/:id/toggle - Toggle todo completion

## Real-time Events

The server uses Socket.IO for real-time updates:

### Emitted Events
- newTodo - When a new todo is created
- updateTodo - When a todo is updated
- deleteTodo - When a todo is deleted

## Environment Variables

- MONGODB_URI - MongoDB connection string
- JWT_SECRET - Secret key for JWT tokens
- PORT - Server port (default: 5000)

## Security

- JWT authentication
- Password hashing with bcrypt
- CORS enabled
- Input validation
- Error handling middleware
