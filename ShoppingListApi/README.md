# Shopping List API

A Spring Boot REST API for managing user accounts, shopping lists, list sharing,
shopping list items, JWT sessions, and archived lists.

## Features

- User registration, login, logout, profile lookup, and password recovery
- HS256 JWT authentication with persistent active sessions
- Owned and shared shopping lists
- Editor and viewer list permissions
- Shopping list items
- 30-day soft-delete archive with scheduled cleanup
- H2 database with H2 web console
- Swagger/OpenAPI documentation

## Technology

- Java 25
- Spring Boot 4.1.2
- Spring Web, Data JPA, Security, OAuth2 Resource Server, Validation
- H2
- Maven
- springdoc OpenAPI

## Prerequisites

- JDK 25
- No separate Maven installation is required; use the included Maven wrapper

Verify Java:

```powershell
java -version
```

## Start the API

1. Open a terminal in this directory.
2. Optionally set a stable JWT signing secret (recommended outside local development):

```powershell
$env:JWT_SECRET = "replace-with-at-least-32-utf8-byte-secret"
```

The secret must contain at least 32 UTF-8 bytes. If it is omitted, the application
generates a temporary secret at startup and existing JWTs become invalid after a restart.

3. Start the application:

```powershell
.\mvnw.cmd spring-boot:run
```

The API is available at `http://localhost:8080`.

## Local helper

Register a user and inspect the returned JWT with PowerShell:

```powershell
$body = @{
    username = "alex_1"
    password = "secure-pass"
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Method Post `
    -Uri "http://localhost:8080/api/users/register" `
    -ContentType "application/json" `
    -Body $body

$response
$response.accessToken
```

Use the returned token for protected endpoints:

```powershell
$headers = @{ Authorization = "Bearer $($response.accessToken)" }

Invoke-RestMethod `
    -Method Get `
    -Uri "http://localhost:8080/api/users/me" `
    -Headers $headers
```

Create a shopping list:

```powershell
$list = @{ title = "Groceries" } | ConvertTo-Json

$createdList = Invoke-RestMethod `
    -Method Post `
    -Uri "http://localhost:8080/api/lists" `
    -ContentType "application/json" `
    -Headers $headers `
    -Body $list

$createdList
```

## API documentation

- Swagger UI: http://localhost:8080/api-docs
- OpenAPI JSON: http://localhost:8080/v3/api-docs
- H2 console: http://localhost:8080/h2-console

The H2 console is preconfigured for local database administration. By default,
the console's JDBC URL should be `jdbc:h2:~/shoppingList`, with username `sa`
and an empty password.

In Swagger UI, copy `accessToken` from a register or login response, choose
**Authorize**, and enter only the token without the `Bearer ` prefix.

## Database

The H2 database is configured in `src/main/resources/application.properties`.
The application initializes it from `src/main/resources/scheme.sql` on startup,
and Hibernate validates entity mappings against the schema.

The schema contains:

- `users`
- `lists`
- `list_shares`
- `items`
- `sessions`

## Main API routes

| Area | Route | Methods |
|---|---|---|
| Users | `/api/users/register` | `POST` |
| Users | `/api/users/login` | `POST` |
| Users | `/api/users/me` | `GET` |
| Users | `/api/users/logout` | `POST` |
| Users | `/api/users/password/reset` | `POST` |
| Lists | `/api/lists` | `POST`, `GET` |
| Lists | `/api/lists/{listId}` | `GET`, `PATCH`, `DELETE` |
| Archive | `/api/lists/archive` | `GET` |
| Archive | `/api/lists/{listId}/restore` | `POST` |
| Items | `/api/lists/{listId}/items` | `POST` |
| Items | `/api/lists/{listId}/items/{itemId}` | `DELETE` |
| Shares | `/api/lists/{listId}/shares` | `GET` |
| Shares | `/api/lists/{listId}/shares/{username}` | `PUT`, `DELETE` |

Most routes require `Authorization: Bearer <accessToken>`. See
`docs/ApiDocumentation.txt` for request and response examples.

## Tests

Run the test suite:

```powershell
.\mvnw.cmd test
```

Build an executable JAR:

```powershell
.\mvnw.cmd clean package
```
