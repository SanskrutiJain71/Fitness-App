# Production Setup Guide

## Live Demo
- **Shared App:** [LIVE PREVIEW](https://ais-pre-mt35sudd6rpwasltbjzxn6-130682573877.asia-southeast1.run.app)
- **Development Link:** [DEV PREVIEW](https://ais-dev-mt35sudd6rpwasltbjzxn6-130682573877.asia-southeast1.run.app)

This project includes a complete fitness tracking application setup. 

## 1. Project Structure
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
