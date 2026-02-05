# Munawwara Care API Documentation

This document outlines the available API endpoints in the `mc_backend_app`, including expected inputs and outputs.

**Base URL**: `http://<server-ip>:5000/api`

## 1. Authentication (`/auth`)

### Register User (Moderator)
*   **Endpoint**: `POST /auth/register`
*   **Description**: Registers a new moderator. Sends a verification email.
*   **Input**:
    ```json
    {
      "full_name": "John Doe",
      "email": "john@example.com",
      "password": "securepassword123",
      "phone_number": "+966501234567"
    }
    ```
*   **Output (200)**:
    ```json
    {
      "success": true,
      "message": "Verification code sent to email",
      "email": "john@example.com"
    }
    ```

### Verify Email
*   **Endpoint**: `POST /auth/verify-email`
*   **Input**:
    ```json
    {
      "email": "john@example.com",
      "code": "123456"
    }
    ```
*   **Output (201)**:
    ```json
    {
      "success": true,
      "message": "Email verified successfully. You can now login.",
      "user_id": "65c..."
    }
    ```

### Login
*   **Endpoint**: `POST /auth/login`
*   **Input**:
    ```json
    {
      "email": "john@example.com",
      "password": "securepassword123"
    }
    ```
*   **Output (200)**:
    ```json
    {
      "token": "eyJhbG...",
      "role": "moderator",
      "full_name": "John Doe",
      "user_id": "65c..."
    }
    ```

### Get Current Profile
*   **Endpoint**: `GET /auth/me`
*   **Headers**: `Authorization: Bearer <token>`
*   **Output (200)**:
    ```json
    {
      "_id": "65c...",
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "moderator",
      "phone_number": "+966501234567",
      "created_at": "2024-02-05T..."
    }
    ```

### Register Pilgrim (Create Account)
*   **Endpoint**: `POST /auth/register-pilgrim`
*   **Description**: Creates a pilgrim account (can be done without password).
*   **Input**:
    ```json
    {
      "full_name": "Ali Ahmed",
      "national_id": "1122334455",
      "phone_number": "+966501234567",
      "age": 45,
      "gender": "male",
      "medical_history": "None"
    }
    ```
*   **Output (201)**:
    ```json
    {
      "message": "Pilgrim registered successfully",
      "pilgrim_id": "65d...",
      "national_id": "1122334455"
    }
    ```

---

## 2. Groups (`/groups`)

### Create Group
*   **Endpoint**: `POST /groups/create`
*   **Headers**: `Authorization: Bearer <token>`
*   **Input**:
    ```json
    {
      "group_name": "Hajj Group 2024"
    }
    ```
*   **Output (201)**:
    ```json
    {
      "_id": "65e...",
      "group_name": "Hajj Group 2024",
      "moderator_ids": ["65c..."],
      "created_by": "65c..."
    }
    ```

### Get My Groups (Dashboard)
*   **Endpoint**: `GET /groups/dashboard`
*   **Headers**: `Authorization: Bearer <token>`
*   **Output (200)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "65e...",
          "group_name": "Hajj Group 2024",
          "pilgrims": [
             {
                "_id": "65d...",
                "full_name": "Ali Ahmed",
                "location": { "lat": 21.4, "lng": 39.8 },
                "battery_percent": 85
             }
          ]
        }
      ]
    }
    ```

### Add Pilgrim to Group
*   **Endpoint**: `POST /groups/:group_id/add-pilgrim`
*   **Headers**: `Authorization: Bearer <token>`
*   **Input**:
    ```json
    {
      "user_id": "65d..."
    }
    ```
*   **Output (200)**:
    ```json
    {
      "message": "Pilgrim added to group",
      "group": { ... }
    }
    ```

### Get Single Group
*   **Endpoint**: `GET /groups/:group_id`
*   **Headers**: `Authorization: Bearer <token>`
*   **Output (200)**: Similar to Dashboard item, but single object.

---

## 3. Hardware / Location (`/hardware`)

### Hardware Ping
*   **Endpoint**: `POST /hardware/ping`
*   **Description**: Smart band sends location update.
*   **Input**:
    ```json
    {
      "serial_number": "MC-BAND-001",
      "lat": 21.4225,
      "lng": 39.8262,
      "battery_percent": 75
    }
    ```
*   **Output (200)**:
    ```json
    {
      "message": "Location updated",
      "server_timestamp": "2024-02-05T..."
    }
    ```

---

## 4. Notifications (`/notifications`)

### Get Notifications
*   **Endpoint**: `GET /notifications`
*   **Headers**: `Authorization: Bearer <token>`
*   **Output (200)**:
    ```json
    {
      "success": true,
      "data": [
         {
            "_id": "...",
            "title": "Battery Low",
            "message": "Pilgrim Ali has 10% battery",
            "read": false
         }
      ]
    }
    ```
