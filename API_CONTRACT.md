# BloodBridge API Contract Specification

**Version:** 1.0.0

**Base URL:** `/api`

**Authentication Scheme:** `Bearer <JWT_TOKEN>` in the `Authorization` header

**Default Content-Type:** `application/json`

---

## 1. General Principles & Error Envelope

All error responses use a consistent JSON structure:

```json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": [
    {
      "field": "unitsRequired",
      "message": "must be greater than or equal to 1"
    }
  ],
  "timestamp": "2026-10-09T14:30:00"
}
```

### Standard Error Status Codes

- `400 Bad Request`: Validation failure, invalid parameters, or illegal state transition.
- `401 Unauthorized`: Missing, invalid, or expired JWT.
- `403 Forbidden`: Authenticated user lacks permission.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Duplicate resource or concurrent modification.
- `500 Internal Server Error`: Unhandled server exception.

---

## 2. Standard Types & Enums

### BloodGroup

- `A_POSITIVE` — A+
- `A_NEGATIVE` — A-
- `B_POSITIVE` — B+
- `B_NEGATIVE` — B-
- `AB_POSITIVE` — AB+
- `AB_NEGATIVE` — AB-
- `O_POSITIVE` — O+
- `O_NEGATIVE` — O-

### Role

- `PATIENT`
- `DONOR`
- `HOSPITAL`
- `ADMIN`

### VerificationStatus

- `PENDING`
- `VERIFIED`
- `REJECTED`
- `UNVERIFIED`

### Urgency

- `NORMAL`
- `URGENT`
- `CRITICAL`

### RequestStatus

- `PENDING` can transition to `APPROVED`, `REJECTED`, or `CANCELLED`.
- `APPROVED` can transition to `FULFILLED` or `CANCELLED`.
- `FULFILLED`, `REJECTED`, and `CANCELLED` are terminal states.

### NotificationType

- `VERIFICATION_APPROVED`
- `VERIFICATION_REJECTED`
- `BLOOD_REQUEST_CREATED`
- `BLOOD_REQUEST_APPROVED`
- `BLOOD_REQUEST_FULFILLED`
- `BLOOD_REQUEST_REJECTED`
- `BLOOD_REQUEST_CANCELLED`
- `HOSPITAL_CREATED`
- `GENERAL`
- `ACCOUNT_UPDATE`
- `SYSTEM_ALERT`
- `STATUS_UPDATE`

---

## 3. Authentication Endpoints

Base path: `/api/auth`

### Register User

- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Access:** Public
- **Description:** Registers a `PATIENT` or `DONOR` and creates the associated profile.

Request body:

```json
{
  "fullName": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!",
  "role": "DONOR",
  "phoneNumber": "+1-555-0199"
}
```

- `fullName`: Required, maximum 100 characters.
- `email`: Required, valid email address.
- `password`: Required, 8–100 characters.
- `role`: Required; `PATIENT` or `DONOR`.
- `phoneNumber`: Optional, maximum 20 characters.

Responses: `201 Created`, `400 Bad Request`, `409 Conflict`.

### Login

- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Access:** Public

Request body:

```json
{
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!"
}
```

Successful response: `200 OK`, containing a JWT token and user details.

Invalid credentials: `401 Unauthorized`.

### Get Current User

- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Access:** Authenticated users
- **Header:** `Authorization: Bearer <TOKEN>`

Returns the authenticated user's profile summary.

---

## 4. Donor Endpoints

Base path: `/api/donors`

- `GET /api/donors/me` — Get the current donor profile.
- `PUT /api/donors/me` — Update the donor profile.
- `GET /api/donors/me/verification` — Get verification status.
- `GET /api/donors?bloodGroup=O_POSITIVE&page=0&size=20` — List verified donors.

Donor profile updates must not allow donors to modify their own verification status.

---

## 5. Patient Endpoints

Base path: `/api/patients`

- `GET /api/patients/me` — Get the current patient profile.
- `PUT /api/patients/me` — Update the patient profile.

---

## 6. Blood Request Endpoints

Base path: `/api/blood-requests`

- `POST /api/blood-requests` — Create a blood request. Patient access required.
- `GET /api/blood-requests/my?page=0&size=20` — List the patient's requests.
- `GET /api/blood-requests/{id}` — Get a request by ID, subject to access permissions.
- `PUT /api/blood-requests/{id}` — Update a request, subject to access permissions and valid state transitions.
- `PATCH /api/blood-requests/{id}/cancel` — Cancel the owner's request.
- `GET /api/blood-requests/open?page=0&size=20` — List open requests for hospitals and administrators.
- `GET /api/blood-requests/hospital?page=0&size=20` — List requests assigned to the authenticated hospital.

Blood request validation includes blood group, required units, urgency, required date, and optional notes.

---

## 7. Hospital & Inventory Endpoints

### Hospital

Base path: `/api/hospitals`

- `GET /api/hospitals/me` — Get the hospital profile.
- `PUT /api/hospitals/me` — Update the hospital profile.
- `GET /api/hospitals/me/verification` — Get hospital verification status.
- `GET /api/hospitals?page=0&size=20` — List verified hospitals.

### Inventory

Base path: `/api/inventory`

- `GET /api/inventory/my-hospital` — Get the authenticated hospital's inventory.
- `PUT /api/inventory/my-hospital` — Update inventory.
- `GET /api/inventory/search?bloodGroup=A_POSITIVE` — Search available inventory.
- `GET /api/inventory/hospital/{hospitalId}` — View a hospital's inventory.

Only verified hospitals may manage inventory. Available units cannot be negative.

---

## 8. Admin Endpoints

Base path: `/api/admin`

All admin endpoints require `ROLE_ADMIN`.

- `GET /api/admin/donors/pending?page=0&size=20` — List pending donors.
- `PATCH /api/admin/donors/{donorProfileId}/verify` — Verify a donor.
- `PATCH /api/admin/donors/{donorProfileId}/reject` — Reject a donor.
- `GET /api/admin/hospitals/pending?page=0&size=20` — List pending hospitals.
- `PATCH /api/admin/hospitals/{hospitalId}/verify` — Verify a hospital.
- `PATCH /api/admin/hospitals/{hospitalId}/unverify` — Mark a hospital unverified.
- `POST /api/admin/hospitals/accounts` — Create a hospital account.

---

## 9. Notification Endpoints

Base path: `/api/notifications`

- `GET /api/notifications?page=0&size=20` — List notifications.
- `PATCH /api/notifications/{id}/read` — Mark a notification as read.
- `PATCH /api/notifications/read-all` — Mark all notifications as read.
- `GET /api/notifications/unread-count` — Get the unread notification count.

Users may only access or update their own notifications.

---

## 10. Health & Documentation Endpoints

- `GET /actuator/health` — Health check.
- `GET /swagger-ui.html` — Swagger UI.
- `GET /api-docs` — OpenAPI JSON specification.
