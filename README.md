# Journal App

A RESTful backend service for managing personal journal entries, built with Spring Boot, Spring Security, and MongoDB. The application provides secure user authentication, role-based access control, and user-isolated journal management.

---

## Features

- **User Authentication**: HTTP Basic Authentication with BCrypt password hashing.
- **Data Isolation**: Journal entries are associated with specific users; users can only access and manage their own entries.
- **Database Mapping**: MongoDB document persistence using Spring Data MongoDB and `@DBRef` mapping between users and journal entries.
- **Transaction Support**: Declarative `@Transactional` support with `MongoTransactionManager` for atomic operations across collections.
- **RESTful Endpoints**: Clean API design for public user registration, user profile management, and journal entry CRUD operations.

---

## Tech Stack

- **Java**: 17
- **Framework**: Spring Boot 2.7.18
  - Spring Web
  - Spring Security
  - Spring Data MongoDB
- **Database**: MongoDB
- **Utilities**: Lombok
- **Build Tool**: Maven

---

## Project Structure

```text
src/
├── main/
│   ├── java/com/prince/journalApp/
│   │   ├── config/
│   │   │   └── SpringSecurity.java         # Security and password encoder configuration
│   │   ├── controller/
│   │   │   ├── PublicController.java       # Public endpoints (registration, health-check)
│   │   │   ├── UserController.java         # User management endpoints
│   │   │   └── JournalEntryController.java # Authenticated journal entry endpoints
│   │   ├── entity/
│   │   │   ├── User.java                   # User document entity
│   │   │   └── JournalEntry.java           # JournalEntry document entity
│   │   ├── repository/
│   │   │   ├── UserRepository.java         # MongoDB repository for users
│   │   │   └── JournalEntryRepository.java # MongoDB repository for journal entries
│   │   ├── service/
│   │   │   ├── UserService.java            # User service and password hashing
│   │   │   ├── UserDetailsServiceImpl.java # Custom UserDetailsService implementation
│   │   │   └── JournalEntryService.java    # Journal service with transaction handling
│   │   └── JournalAppApplication.java      # Application entry point and transaction manager
│   └── resources/
│       └── application.properties          # Application and database configuration
└── test/
    └── java/com/prince/journalApp/
        └── JournalAppApplicationTests.java # Context loading tests
```

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/public/health-check` | Check service health | No |
| `POST` | `/public/create-user` | Register a new user | No |

#### Create User Payload
```json
{
  "userName": "prince",
  "password": "mypassword"
}
```

---

### User Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/user` | Get authenticated user profile | Yes (HTTP Basic) |
| `PUT` | `/user` | Update username or password | Yes (HTTP Basic) |
| `DELETE` | `/user` | Delete authenticated user account | Yes (HTTP Basic) |

---

### Journal Entry Endpoints

All journal endpoints require HTTP Basic Authentication and operate strictly on the authenticated user's entries.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/journal` | Get all journal entries for the current user | Yes (HTTP Basic) |
| `POST` | `/journal` | Create a new journal entry | Yes (HTTP Basic) |
| `GET` | `/journal/id/{id}` | Get a specific journal entry by ID | Yes (HTTP Basic) |
| `PUT` | `/journal/id/{id}` | Update a specific journal entry by ID | Yes (HTTP Basic) |
| `DELETE` | `/journal/id/{id}` | Delete a specific journal entry by ID | Yes (HTTP Basic) |

#### Journal Entry Payload
```json
{
  "title": "Project Update",
  "content": "Completed Spring Security integration and MongoDB repository layer."
}
```

---

## Configuration

The application is configured via `src/main/resources/application.properties`:

```properties
spring.application.name=journalApp

# MongoDB Configuration
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=journaldb
spring.data.mongodb.auto-index-creation=true

# MongoDB URI (Uncomment and configure for remote cluster or MongoDB Atlas)
# spring.data.mongodb.uri=mongodb+srv://<username>:<password>@cluster0.mongodb.net/journaldb?retryWrites=true&w=majority
spring.data.mongodb.uri=mongodb://localhost:27017/journaldb
```

---

## Getting Started

### Prerequisites

- Java 17 or higher
- MongoDB running locally on port 27017 (or a configured remote MongoDB instance)
- Maven 3.8+ (or use the included Maven wrapper)

### Build and Run

1. Clone the repository:
   ```bash
   git clone https://github.com/ydv-prince/Journal-App.git
   cd Journal-App
   ```

2. Compile the project:
   ```bash
   ./mvnw clean compile
   ```

3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

The application runs on `http://localhost:8080` by default.

---

## Example Usage

### 1. Register a user
```bash
curl -X POST http://localhost:8080/public/create-user \
  -H "Content-Type: application/json" \
  -d '{"userName": "prince", "password": "mypassword"}'
```

### 2. Create a journal entry
```bash
curl -X POST http://localhost:8080/journal \
  -u prince:mypassword \
  -H "Content-Type: application/json" \
  -d '{"title": "Day 1", "content": "Set up project architecture and database schemas."}'
```

### 3. Fetch journal entries
```bash
curl -X GET http://localhost:8080/journal \
  -u prince:mypassword
```

### 4. Update a journal entry
```bash
curl -X PUT http://localhost:8080/journal/id/<ENTRY_ID> \
  -u prince:mypassword \
  -H "Content-Type: application/json" \
  -d '{"title": "Day 1 (Updated)", "content": "Added security and transactions."}'
```

### 5. Delete a journal entry
```bash
curl -X DELETE http://localhost:8080/journal/id/<ENTRY_ID> \
  -u prince:mypassword
```
