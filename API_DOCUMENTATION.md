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
      "message": "Email verified successfully",
      "user_id": "65c..."
    }
    ```

### Resend Verification Code
*   **Endpoint**: `POST /auth/resend-verification`
*   **Input**: `{"email": "john@example.com"}`

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
      "role": "moderator", // or "pilgrim", "admin"
      "full_name": "John Doe",
      "user_id": "65c..."
    }
    ```

### Get Current Profile
*   **Endpoint**: `GET /auth/me`
*   **Headers**: `Authorization: Bearer <token>`

### Update Profile
*   **Endpoint**: `PUT /auth/update-profile`
*   **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
*   **Input**: `full_name`, `phone_number`, `profile_picture` (file)

---

## 2. Pilgrim Features (`/pilgrim`)

*All routes require Pilgrim role login*

### Get Pilgrim Profile
*   **Endpoint**: `GET /pilgrim/profile` (Returns self profile)

### Get My Group
*   **Endpoint**: `GET /pilgrim/my-group`
*   **Output**: Group details, moderators list, fellow pilgrims count.

### Update Location
*   **Endpoint**: `PUT /pilgrim/location`
*   **Input**:
    ```json
    {
      "latitude": 21.4225,
      "longitude": 39.8262,
      "battery_percent": 85
    }
    ```

### Trigger SOS
*   **Endpoint**: `POST /pilgrim/sos`
*   **Description**: Sends immediate emergency alert to all group moderators.

---

## 3. Groups (`/groups`)

*Requires Moderator or Admin role*

### Create Group
*   **Endpoint**: `POST /groups/create`
*   **Input**: `{"group_name": "Hajj Group 2024"}`

### Get My Groups (Dashboard)
*   **Endpoint**: `GET /groups/dashboard`
*   **Output**: List of groups created by or moderating the user.

### Add Pilgrim to Group (Manual)
*   **Endpoint**: `POST /groups/:group_id/add-pilgrim`
*   **Input**: `{"user_id": "65d..."}` (Existing Pilgrim ID)

### Remove Pilgrim
*   **Endpoint**: `POST /groups/:group_id/remove-pilgrim`
*   **Input**: `{"user_id": "65d..."}`

### Invite Moderator/Pilgrim
*   *(See Invitation section)*

### Delete Group
*   **Endpoint**: `DELETE /groups/:group_id`

### Leave Group (as Moderator)
*   **Endpoint**: `POST /groups/:group_id/leave`

---

## 4. Invitations (`/invitation`)

### Send Invitation
*   **Endpoint**: `POST /invitation/groups/:group_id/invite`
*   **Input**:
    ```json
    {
      "email": "invitee@example.com",
      "role": "moderator" // or "pilgrim" (future)
    }
    ```

### Get My Invitations
*   **Endpoint**: `GET /invitation/invitations`

### Accept/Decline Invitation
*   **Endpoint**: `POST /invitation/invitations/:id/accept`
*   **Endpoint**: `POST /invitation/invitations/:id/decline`

---

## 5. Notifications (`/notifications`)

### Get Notifications
*   **Endpoint**: `GET /notifications`
*   **Query**: `?limit=20&page=1`

### Mark as Read
*   **Endpoint**: `PUT /notifications/:id/read`
*   **Endpoint**: `PUT /notifications/read-all`

---

## 6. Hardware (`/hardware`)

### Ping (Device)
*   **Endpoint**: `POST /hardware/ping`
*   **Input**: `serial_number`, `lat`, `lng`, `battery_percent`

### Admin Management
*   **Register Band**: `POST /hardware/register`
*   **List Bands**: `GET /hardware/bands`

---

## 7. Admin (`/admin`)

*Requires Admin role*

*   **List Users**: `GET /admin/users`
*   **Promote/Demote**: `POST /admin/users/promote-to-admin`, `demote-to-moderator`
*   **Delete User**: `DELETE /admin/users/:user_id/force`
*   **System Stats**: `GET /admin/stats`
