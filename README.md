# 📓 Journal App - Spring Boot & MongoDB REST API

A secure, robust RESTful Journaling API built using **Spring Boot 2.7**, **Spring Security**, and **MongoDB**. The application allows users to register, authenticate, and manage their personal journal entries with full data isolation and transaction management.

---

## 🚀 Features

- **User Authentication & Authorization**:
  - Stateless session management with **HTTP Basic Authentication**.
  - Passwords securely hashed using **BCrypt** with salt.
  - Role-based access control (`USER` role assigned by default).
- **Journal Entry Management**:
  - Full CRUD operations (Create, Read, Update, Delete) for journal entries.
  - User-scoped access: Users can only view, edit, or delete their own entries.
- **MongoDB Integration**:
  - Document-based persistence with Spring Data MongoDB.
  - `@DBRef` relational mapping between `User` and `JournalEntry` documents.
- **Transaction Management**:
  - Declarative `@Transactional` support with `MongoTransactionManager` ensuring atomicity during multi-document operations (e.g., adding/removing entries and updating the user reference).
- **Public & Management Endpoints**:
  - Public endpoints for user registration and application health checks.
  - User profile update and account deletion.

---

## 🛠️ Tech Stack

- **Java**: 17
- **Framework**: Spring Boot 2.7.18
  - Spring Web
  - Spring Security
  - Spring Data MongoDB
- **Database**: MongoDB (Local or MongoDB Atlas)
- **Boilerplate Reduction**: Project Lombok
- **Build Tool**: Maven

---

## 📁 Project Structure

```text
journalApp/
├── src/
│   ├── main/
│   │   ├── java/com/prince/journalApp/
│   │   │   ├── config/
│   │   │   │   └── SpringSecurity.java         # Security & PasswordEncoder configuration
│   │   │   ├── controller/
│   │   │   │   ├── JournalEntryController.java # User-authenticated journal CRUD endpoints
│   │   │   │   ├── PublicController.java       # Public endpoints (register, health-check)
│   │   │   │   └── UserController.java         # User profile update & deletion
│   │   │   ├── entity/
│   │   │   │   ├── JournalEntry.java           # JournalEntry MongoDB document model
│   │   │   │   └── User.java                   # User MongoDB document model
│   │   │   ├── repository/
│   │   │   │   ├── JournalEntryRepository.java # MongoRepository for JournalEntry
│   │   │   │   └── UserRepository.java         # MongoRepository for User
│   │   │   ├── service/
│   │   │   │   ├── JournalEntryService.java    # Business logic & transactional operations for entries
│   │   │   │   ├── UserDetailsServiceImpl.java # Custom UserDetailsService for Spring Security
│   │   │   │   └── UserService.java            # User business logic & password encryption
│   │   │   └── JournalAppApplication.java      # Main application class & MongoTransactionManager
│   │   └── resources/
│   │       └── application.properties          # MongoDB & application configuration
│   └── test/
│       └── java/com/prince/journalApp/
│           └── JournalAppApplicationTests.java # Context loading tests
├── .gitignore                                  # Git ignore rules for build artifacts & IDEs
├── pom.xml                                     # Maven dependencies and build plugins
└── README.md                                   # Project documentation
```

---

## 📡 API Endpoints

### 1. Public Endpoints (No Authentication Required)

| Method | Endpoint | Description | Request Body | Response Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/public/health-check` | Application health check | *None* | `200 OK` |
| `POST` | `/public/create-user` | Register a new user | `User` (JSON) | `201 CREATED` |

#### Create User Request Body:
```json
{
  "userName": "john_doe",
  "password": "secretPassword123"
}
```

---

### 2. Journal Entry Endpoints (HTTP Basic Auth Required)

| Method | Endpoint | Description | Request Body | Response Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/journal` | Get all journal entries of authenticated user | *None* | `200 OK` / `404 NOT FOUND` |
| `POST` | `/journal` | Create a new journal entry for authenticated user | `JournalEntry` (JSON) | `201 CREATED` / `400 BAD REQUEST` |
| `GET` | `/journal/id/{id}` | Get specific journal entry by ID | *None* | `200 OK` / `404 NOT FOUND` |
| `PUT` | `/journal/id/{id}` | Update journal entry by ID | `JournalEntry` (JSON) | `200 OK` / `404 NOT FOUND` |
| `DELETE`| `/journal/id/{id}` | Delete journal entry by ID | *None* | `204 NO CONTENT` / `404 NOT FOUND` |

#### Create / Update Journal Entry Request Body:
```json
{
  "title": "My First Entry",
  "content": "Today was a productive day building Spring Boot applications!"
}
```

---

### 3. User Endpoints (HTTP Basic Auth Required)

| Method | Endpoint | Description | Request Body | Response Code |
| :--- | :--- | :--- | :--- | :--- |
| `PUT` | `/user` | Update authenticated user credentials | `User` (JSON) | `204 NO CONTENT` / `404 NOT FOUND` |
| `DELETE`| `/user` | Delete authenticated user account | *None* | `204 NO CONTENT` |
| `GET` | `/user/{userName}`| Get user details by username | *None* | `200 OK` |

---

## ⚙️ Configuration & Setup

### Prerequisites

- **Java Development Kit (JDK)**: Version 17 or higher
- **MongoDB**: Local MongoDB community server (port `27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **Maven**: 3.8+ (or use the included `./mvnw` wrapper)

### Application Configuration (`src/main/resources/application.properties`)

```properties
spring.application.name=journalApp

# MongoDB Configuration (Local)
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=journaldb
spring.data.mongodb.auto-index-creation=true

# MongoDB URI (Uncomment and configure for MongoDB Atlas / Remote Cluster)
# spring.data.mongodb.uri=mongodb+srv://<username>:<password>@cluster0.mongodb.net/journaldb?retryWrites=true&w=majority
spring.data.mongodb.uri=mongodb://localhost:27017/journaldb
```

---

## 🏃 Running the Application

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ydv-prince/Journal-App.git
   cd Journal-App
   ```

2. **Ensure MongoDB is running**:
   - For local MongoDB:
     ```bash
     mongod
     ```

3. **Build the project**:
   ```bash
   ./mvnw clean compile
   ```

4. **Run the application**:
   ```bash
   ./mvnw spring-boot:run
   ```
   The application will start on `http://localhost:8080`.

---

## 🧪 Sample cURL Commands

### 1. Register a new user:
```bash
curl -X POST http://localhost:8080/public/create-user \
  -H "Content-Type: application/json" \
  -d '{"userName": "prince", "password": "mypassword"}'
```

### 2. Create a journal entry:
```bash
curl -X POST http://localhost:8080/journal \
  -u prince:mypassword \
  -H "Content-Type: application/json" \
  -d '{"title": "Day 1", "content": "Started learning Spring Boot!"}'
```

### 3. Get all entries for logged-in user:
```bash
curl -X GET http://localhost:8080/journal \
  -u prince:mypassword
```

### 4. Update an entry:
```bash
curl -X PUT http://localhost:8080/journal/id/<ENTRY_OBJECT_ID> \
  -u prince:mypassword \
  -H "Content-Type: application/json" \
  -d '{"title": "Day 1 (Updated)", "content": "Mastered Spring Security & MongoDB!"}'
```

### 5. Delete an entry:
```bash
curl -X DELETE http://localhost:8080/journal/id/<ENTRY_OBJECT_ID> \
  -u prince:mypassword
```

---

## 🔒 Security Highlights

- **Stateless Architecture**: No HTTP session is created (`SessionCreationPolicy.STATELESS`), ensuring API scalability.
- **CSRF Disabled**: Suitable for stateless REST APIs using HTTP Basic authentication.
- **BCrypt Hashing**: Passwords are never stored in plain text and are hashed before persisting to MongoDB.
- **Data Isolation**: Endpoints verify entry ownership against authenticated user context to prevent unauthorized access.

---

## 📝 License

This project is licensed under the Apache 2.0 License.
