# TaskDefender API Documentation

## Overview

The TaskDefender API provides RESTful endpoints for managing tasks, users, teams, and productivity analytics. All endpoints require authentication except for registration and login.

## Authentication

### JWT Token Authentication
All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

## Tasks API

### Get Tasks
```http
GET /api/tasks?status=todo&priority=high&limit=50&offset=0
Authorization: Bearer <token>
```

### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project proposal",
  "description": "Write and review the Q4 project proposal",
  "priority": "high",
  "dueDate": "2024-01-15T10:00:00Z",
  "estimatedTime": 120,
  "tags": ["work", "proposal"]
}
```

### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in-progress",
  "actualTime": 45
}
```

## Teams API

### Create Team
```http
POST /api/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Development Team",
  "description": "Frontend development team"
}
```

### Join Team
```http
POST /api/teams/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "inviteCode": "ABC123"
}
```

## Analytics API

### Get User Analytics
```http
GET /api/analytics/user?period=week
Authorization: Bearer <token>
```

### Get Team Analytics
```http
GET /api/analytics/team/:teamId?period=month
Authorization: Bearer <token>
```

## Error Responses

All errors follow this format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Email format is invalid"
    }
  }
}
```

## Rate Limiting

- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated endpoints
- 1000 requests per hour for premium users

## Webhooks

### Task Completion Webhook
```http
POST /your-webhook-url
Content-Type: application/json

{
  "event": "task.completed",
  "data": {
    "taskId": "123",
    "userId": "456",
    "completedAt": "2024-01-15T10:30:00Z"
  }
}
```