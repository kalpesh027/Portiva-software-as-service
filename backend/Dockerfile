# =====================================================================
# Portiva Backend — Multi-stage Dockerfile
# Stage 1: Build JAR with Maven
# Stage 2: Minimal JRE runtime image
# =====================================================================

# ---------- Stage 1: Build ----------
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy pom first for layer caching (dependencies won't re-download unless pom changes)
COPY pom.xml .
RUN mvn dependency:go-offline -B -q

# Copy source and build
COPY src ./src
RUN mvn package -DskipTests -B -q

# ---------- Stage 2: Runtime ----------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Non-root user for security
RUN addgroup -S portiva && adduser -S portiva -G portiva

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/backend-1.0.0.jar app.jar

USER portiva

EXPOSE 5000

# JVM tuning for containerized environments
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
