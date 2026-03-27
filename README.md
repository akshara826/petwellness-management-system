# Pet Wellness App Backend

Spring Boot backend for OTP-based onboarding, profile registration, admin approval/rejection, and JWT login.

## Tech Stack
- Java + Spring Boot
- Spring Security (JWT)
- Spring Data JPA (MySQL)
- Spring Mail (SMTP)
- Springdoc OpenAPI (Swagger)

## Base URLs
- App: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Auth & Security Rules
- Public APIs:
  - `/api/auth/send-otp`
  - `/api/auth/verify-otp`
  - `/api/auth/registration`
  - `/api/auth/login`
  - Swagger endpoints (`/v3/api-docs/**`, `/swagger-ui/**`, `/swagger-ui.html`)
- Authenticated user API:
  - `/api/auth/set-password` (requires JWT)
- Admin-only APIs:
  - `/api/admin/**` (requires JWT with `ROLE_ADMIN`)
- JWT header format:
  - `Authorization: Bearer <token>`

If token is missing/invalid for protected APIs:
- `401` JSON: `{"message":"Unauthorized","status":401}`
- `403` JSON: `{"message":"Forbidden","status":403}`

## Core User Lifecycle (Current Backend Behavior)
1. User requests OTP.
2. User verifies OTP.
3. User submits registration form + files.
4. Backend creates user with `status=PENDING`.
5. Admin either:
   - Approves -> `status=APPROVED`, temporary password emailed.
   - Rejects -> `status=REJECTED`, rejection reason saved + emailed.
6. Approved user logs in and receives JWT.
7. First login requires setting a new password (`firstLogin=true` -> false after set).

Note:
- `status` can be `null` only before user record is created.
- Once registration request is submitted, status becomes `PENDING`.

## Data Model Summary (Frontend-Relevant)
### User
- `id: Long`
- `email: String` (unique)
- `role: ADMIN | OWNER`
- `status: PENDING | APPROVED | REJECTED`
- `rejectionReason: String?`
- `firstLogin: boolean`
- `emailVerified: boolean`
- `profileCompleted: boolean`
- `fullName, firstName`
- `idProofPath, idProofType, profileImagePath`

### PersonalInfo
- `fullName`
- `phoneNumber`
- `gender`
- `fatherName`, `motherName`
- `highestQualification`
- `occupation`
- `dateOfBirth: LocalDate`

### Address
- `street`, `city`, `state`
- `pincode: String` (exactly 6 digits)

## Validation Rules (Important for Frontend)
- Email: valid format
- OTP: exactly 6 digits
- Pincode: exactly 6 digits
- Date of birth: required and must be a past date
- Rejection reason (admin reject): mandatory

## API Contract for Frontend Integration

## 1) Send OTP
- Method: `POST`
- URL: `/api/auth/send-otp`
- Body (JSON):
```json
{
  "email": "user@example.com"
}
```
- Success: `200 OK`
```text
OTP sent successfully
```

## 2) Verify OTP
- Method: `POST`
- URL: `/api/auth/verify-otp`
- Body (JSON):
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
- Success: `200 OK`
```text
OTP verified successfully
```

## 3) Registration (multipart)
- Method: `POST`
- URL: `/api/auth/registration`
- Content type: `multipart/form-data`
- Form fields:
  - `email`
  - `fullName`
  - `phoneNumber`
  - `highestQualification`
  - `occupation`
  - `street`
  - `city`
  - `state`
  - `pincode` (6 digits)
  - `idProofType`
  - `gender` (enum value from backend)
  - `fatherName` (optional)
  - `motherName` (optional)
  - `dateOfBirth` (`yyyy-MM-dd`)
  - `idProof` (file, required)
  - `profileImage` (file, required)
- Success: `200 OK`
```text
Profile completed successfully. Await admin approval.
```

## 4) Login
- Method: `POST`
- URL: `/api/auth/login`
- Body (JSON):
```json
{
  "email": "user@example.com",
  "password": "Temp1234"
}
```
- Success: `200 OK`
```json
{
  "token": "jwt-token",
  "changePasswordRequired": true
}
```
- If pending:
```json
{
  "message": "Admin approval pending",
  "status": 500
}
```
- If rejected:
```json
{
  "message": "Application rejected: <reason>",
  "status": 500
}
```

## 5) Set Password (first login)
- Method: `POST`
- URL: `/api/auth/set-password`
- Headers:
  - `Authorization: Bearer <jwt>`
- Body (JSON):
```json
{
  "newPassword": "NewStrongPassword"
}
```
- Success: `200 OK`
```text
Password set successfully
```

## 6) Admin - Get Pending Users
- Method: `GET`
- URL: `/api/admin/pending-users`
- Auth: Admin JWT required
- Success: `200 OK`
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "fullName": "User Name"
  }
]
```

## 7) Admin - Approve User
- Method: `POST`
- URL: `/api/admin/approve/{userId}`
- Auth: Admin JWT required
- Success: `200 OK`
```text
User approved and approval email sent.
```

## 8) Admin - Reject User
- Method: `POST`
- URL: `/api/admin/reject/{userId}`
- Auth: Admin JWT required
- Body (JSON):
```json
{
  "rejectionReason": "Documents are unclear. Please re-apply with readable files."
}
```
- Success: `200 OK`
```text
User rejected and rejection email sent.
```

## Error Shape
Application exceptions are returned via a standard payload:
```json
{
  "message": "Some error message",
  "status": 400,
  "timestamp": "2026-02-14T12:34:56"
}
```

## Frontend Integration Checklist
1. Always call APIs with base path `/api/...`.
2. Store JWT after login and send it in `Authorization` header.
3. Build registration request as `multipart/form-data` (not JSON).
4. Expect admin gatekeeping:
   - pending users cannot login,
   - rejected users see rejection reason.
5. Validate pincode as 6 digits on frontend before calling backend.
6. Send DOB in `yyyy-MM-dd` format.
7. Handle both plain-text success responses and JSON error responses.

## Local Run (Backend Team Reference)
1. Create `secrets.properties` in project root (copy from `secrets.properties.example`).
2. Set DB, mail, and JWT secret values in `secrets.properties`.
3. Run app and open Swagger.

Security note:
- Do not commit `secrets.properties` to version control.
