# BloodBridge Backend

Production-ready backend for **BloodBridge**, a blood donation and blood request management platform built with Java 21, Spring Boot 3.3.5, Spring Security 6, Spring Data JPA, PostgreSQL, and Flyway.

---

## 1. Technology Stack

- **Language & Runtime:** Java 21 LTS
- **Framework:** Spring Boot 3.3.5
- **Security:** Spring Security 6 (Stateless JWT authentication with BCrypt hashing)
- **JWT Library:** `io.jsonwebtoken` (JJWT 0.12.6)
- **Persistence:** Spring Data JPA / Hibernate 6
- **Database:** PostgreSQL (with Flyway migration management)
- **Validation:** Jakarta Bean Validation (Hibernate Validator)
- **API Documentation:** Springdoc OpenAPI 2.6.0 / Swagger UI
- **Monitoring:** Spring Boot Actuator (`/actuator/health`)
- **Build Tool:** Apache Maven with Maven Wrapper (`./mvnw`)
- **Testing:** JUnit 5, Spring Boot Test, MockMvc, H2 (PostgreSQL compatibility mode)

---

## 2. Architecture & Project Layout

```
src/main/java/com/bloodbridge/
├── BloodBridgeApplication.java       # Spring Boot Application entrypoint
├── admin/                            # Administrator workflows (verify/reject donors, hospitals, account creation)
│   ├── AdminController.java
│   ├── AdminService.java
│   └── dto/
├── auth/                             # User registration, login, current user summary
│   ├── AuthController.java
│   ├── AuthService.java
│   └── dto/
├── bloodrequest/                     # Blood donation requests and legal lifecycle management
│   ├── BloodRequest.java
│   ├── BloodRequestController.java
│   ├── BloodRequestRepository.java
│   ├── BloodRequestService.java
│   └── dto/
├── common/                           # Enums: BloodGroup, Role, VerificationStatus, Urgency, RequestStatus, NotificationType, Gender
├── config/                           # SecurityConfig, CorsConfig, OpenApiConfig
├── donor/                            # Donor profiles, directory listings, availability tracking
│   ├── DonorController.java
│   ├── DonorProfile.java
│   ├── DonorProfileRepository.java
│   ├── DonorService.java
│   └── dto/
├── exception/                        # Centralized GlobalExceptionHandler and ApiError records
├── hospital/                         # Hospital entity, profile management, verification
│   ├── Hospital.java
│   ├── HospitalController.java
│   ├── HospitalRepository.java
│   ├── HospitalService.java
│   └── dto/
├── inventory/                        # Hospital blood inventory tracking, optimistic locking concurrency control
│   ├── BloodInventory.java
│   ├── BloodInventoryController.java
│   ├── BloodInventoryRepository.java
│   ├── InventoryService.java
│   └── dto/
├── notification/                     # User notification system
│   ├── Notification.java
│   ├── NotificationController.java
│   ├── NotificationRepository.java
│   ├── NotificationService.java
│   └── dto/
├── patient/                          # Patient profile management
│   ├── PatientController.java
│   ├── PatientProfile.java
│   ├── PatientProfileRepository.java
│   ├── PatientService.java
│   └── dto/
├── security/                         # JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal, CustomUserDetailsService
└── user/                             # User entity and UserRepository
```

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env` or configure these environment variables in your deployment environment:

| Variable | Description | Local Default (MySQL) | Railway / Production (PostgreSQL) |
|---|---|---|---|
| `PORT` | HTTP Server port | `8080` | Assigned by Railway |
| `SPRING_DATASOURCE_URL` | JDBC connection URL | `jdbc:mysql://localhost:3306/bloodbridge_app` | `jdbc:postgresql://HOST:PORT/DB` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `root` | Railway Postgres username |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `abhilash@123` | Railway Postgres password |
| `SPRING_FLYWAY_LOCATIONS` | Flyway migrations folder | `classpath:db/mysql-migration` | `classpath:db/migration` |
| `APP_JWT_SECRET` | Base64-encoded JWT secret (>= 256 bits) | Auto development secret | `openssl rand -base64 64` |
| `APP_CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `http://localhost:3000,http://localhost:5173` | `https://your-frontend.vercel.app` |

---

## 4. Local Build & Run Instructions

### Prerequisites
- JDK 21+ installed (`java -version`)
- Maven Wrapper (`.\mvnw.cmd` on Windows, `./mvnw` on Linux/macOS)
- Local MySQL running (configured by default for port 3306, user `root`, password `abhilash@123`)

### Running on Windows PowerShell

The project comes pre-configured with local MySQL defaults (`root` / `abhilash@123` on `bloodbridge_app`), so you can run it immediately without setting any environment variables:

```powershell
# 1. Navigate to project directory
cd "c:\Users\abhilash reddy\OneDrive\Desktop\BLOODBRIDGE"

# 2. Run all automated tests
.\mvnw.cmd test

# 3. Start the Spring Boot application
java -jar target\bloodbridge-backend-1.0.0.jar
# or via Maven:
.\mvnw.cmd spring-boot:run
```

### Running on Linux / macOS Terminal

```bash
# Make wrapper executable
chmod +x ./mvnw

# Build and test
./mvnw clean test

# Run application
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/bloodbridge"
export SPRING_DATASOURCE_USERNAME="postgres"
export SPRING_DATASOURCE_PASSWORD="password"
export APP_JWT_SECRET="dGVzdC1zZWNyZXQta2V5LWZvci1ibG9vZGJyaWRnZS1hcHBsaWNhdGlvbi10aGF0LWlzLWxvbmctZW5vdWdo"
export APP_CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"

./mvnw spring-boot:run
```

---

## 5. Automated Test Suite

All 22 integration tests execute automatically against an in-memory database with zero external dependencies:

```
[INFO] Running com.bloodbridge.AuthIntegrationTest
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.bloodbridge.RoleBasedAccessIntegrationTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.bloodbridge.DonorAndHospitalVerificationIntegrationTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.bloodbridge.BloodRequestAndInventoryIntegrationTest
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.bloodbridge.FlywayMigrationTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] Results:
[INFO] Tests run: 22, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### Scenarios Covered
1. **Patient Registration:** Successful registration and automatic profile creation.
2. **Donor Registration:** Successful registration and automatic donor profile creation.
3. **Duplicate Email Rejection:** HTTP 409 Conflict with normalized lowercase email matching.
4. **Public Admin Prevention:** Rejects attempts to self-assign `ADMIN` or `HOSPITAL` roles with HTTP 400.
5. **Authentication & Login:** Successful JWT generation, invalid credentials rejection (HTTP 401).
6. **JWT Protected Endpoints:** Verification of valid JWT extraction and unauthorized blocking.
7. **Role-Based Access Control (RBAC):** Patients/donors blocked from admin endpoints with HTTP 403.
8. **CORS Preflight:** Validates HTTP OPTIONS response with allowlist headers and credentials.
9. **Admin Donor Verification:** Pending donor listing, approval, and rejection with reason.
10. **Admin Hospital Management:** Hospital creation with linked user, verification, and unverification.
11. **Self-Verification Prevention:** Donors cannot alter their verification status via profile updates.
12. **Blood Request Lifecycle:** Request creation, patient ownership check, cancellation.
13. **Validation Constraints:** Reject zero units, past dates, and invalid fields with HTTP 400.
14. **State Transition Guard:** Enforces legal transitions (`PENDING` -> `APPROVED` / `CANCELLED`), blocks illegal transitions with HTTP 400.
15. **Hospital Inventory Management:** Verified hospitals can update inventory; unverified hospitals receive HTTP 403; negative inventory quantities rejected.
16. **Database Migrations:** Flyway schema `V1__initial_schema.sql` applied cleanly and repeatedly without errors.

---

## 6. Railway Deployment Guide

BloodBridge backend is structured for seamless zero-downtime deployment on Railway:

### Step 1: Provision PostgreSQL on Railway
1. Go to your [Railway Dashboard](https://railway.com/) and create a new project.
2. Click **+ New Service** -> **Database** -> **Add PostgreSQL**.
3. Once provisioned, click the PostgreSQL service, go to the **Variables** tab, and observe the database connection parameters (`DATABASE_URL`, `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGPORT`, `PGDATABASE`).

### Step 2: Deploy the Backend Service
1. In the same project, click **+ New Service** -> **GitHub Repo** (select this repository).
2. Go to the backend service **Settings**:
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/bloodbridge-backend-1.0.0.jar`
3. Go to the **Variables** tab and add the environment variables:
   - `PORT`: `${{PORT}}` (Railway automatically sets this)
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}`
   - `SPRING_DATASOURCE_USERNAME`: `${{Postgres.PGUSER}}`
   - `SPRING_DATASOURCE_PASSWORD`: `${{Postgres.PGPASSWORD}}`
   - `APP_JWT_SECRET`: Generate a secure 64-char key using `openssl rand -base64 64`
   - `APP_CORS_ALLOWED_ORIGINS`: `https://your-frontend-app.vercel.app` (add your React frontend Vercel domain)
4. Trigger deployment. Railway will build using the Maven Wrapper and start the Spring Boot service.
5. In the backend service **Networking** settings, click **Generate Domain** to get your public HTTPS URL (e.g. `https://bloodbridge-backend-production.up.railway.app`).

### Step 3: Verify Deployment
- Health check: `https://your-domain.up.railway.app/actuator/health` -> `{"status":"UP"}`
- Swagger Documentation: `https://your-domain.up.railway.app/swagger-ui.html`

---

## 7. Connecting the React Frontend

The companion React frontend should configure its API client with:
```env
VITE_API_BASE_URL=https://your-backend.up.railway.app/api
```

Refer to [`API_CONTRACT.md`](./API_CONTRACT.md) for complete endpoint schemas, payload specifications, and role mappings.
