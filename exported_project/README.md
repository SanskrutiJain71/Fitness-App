# Production Setup Guide (Spring Boot + Angular)

This project has been migrated to a modern Enterprise stack:
- **Backend:** Spring Boot (Java 17+)
- **Frontend:** Angular (v17+)

## Prerequisites
- **Java JDK 17** or higher
- **Node.js** (v18+) and **npm**
- **Maven** (optional, wrapper included)

## 1. Backend (Spring Boot) Setup
1. Open VS Code and open the `backend` folder.
2. Install the **Extension Pack for Java** in VS Code.
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The server will start on `http://localhost:8080`.*

## 2. Frontend (Angular) Setup
1. Open a new terminal in the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   npm start
   ```
   *The app will open on `http://localhost:4200`.*

## 3. Real-time Features
The application uses **Spring WebSockets (STOMP)** to provide real-time biometric pulse data. You don't need any extra configuration; it works out of the box as long as both servers are running.

## 4. Database
By default, it uses an H2 in-memory database. You can configure MySQL or PostgreSQL in `src/main/resources/application.properties`.
- **/frontend**: Angular application using Tailwind CSS and Chart.js.
- **/backend**: Spring Boot application with JWT and Google Fit integration.
- **/database**: SQL schema for MySQL.

## 2. Setting Up Google Fit API
To enable Google Fit integration:
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable 'Fitness API'.
4. Create OAuth 2.0 Credentials.
5. Add Authorized Redirect URIs:
   - `http://localhost:8080/auth/callback`
6. Copy `Client ID` and `Client Secret` to `application.properties`.

## 3. Backend (Spring Boot)
### Prerequisites
- JDK 17+
- Maven
- MySQL

### Configuration
Update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fitedge
spring.datasource.username=root
spring.datasource.password=your_password
google.client.id=YOUR_CLIENT_ID
google.client.secret=YOUR_CLIENT_SECRET
jwt.secret=YOUR_JWT_SECRET
```

### Run
```bash
cd backend
mvn spring-boot:run
```

## 4. Frontend (Angular)
### Prerequisites
- Node.js 18+
- Angular CLI

### Run
```bash
cd frontend
npm install
ng serve
```

## 5. Deployment
For production deployment, use Docker. A `Dockerfile` is provided in each sub-directory.
