# 🚀 PORTIVA — AI-Powered Portfolio Generation SaaS

![License](https://img.shields.io/badge/license-MIT-blue)
![Backend](https://img.shields.io/badge/backend-Spring%20Boot-green)
![Frontend](https://img.shields.io/badge/frontend-React-blue)
![AI](https://img.shields.io/badge/AI-LLM-orange)
![Docker](https://img.shields.io/badge/deployment-Docker-blue)

PORTIVA is a **Full-Stack SaaS Platform** that allows users to create and launch **live portfolio websites automatically after onboarding**.
The platform leverages **AI-powered content generation** and dynamic template rendering to help users build professional portfolios without coding or design knowledge.

---

# 🌍 Problem PORTIVA Solves

Many developers and students want portfolio websites but struggle with:

* Design skills
* Content writing
* Website hosting
* Deployment complexity

PORTIVA solves this by providing:

AI + Templates + Auto Deployment

---

# ⚡ Key Features

✔ AI-powered portfolio content generation
✔ Live portfolio website deployment after onboarding
✔ Multi-template portfolio rendering system
✔ Real-time preview dashboard
✔ Secure authentication with JWT
✔ Role-based access control
✔ Subscription management with Razorpay
✔ Email notifications system
✔ Scalable microservices architecture
✔ Fully responsive mobile-first design

---

# 🧠 AI Content Generation

PORTIVA uses **fine-tuned LLMs** to generate:

* Professional summaries
* About sections
* Skills descriptions
* Project content

### AI Stack

* FastAPI
* Hugging Face Transformers
* PEFT (LoRA Fine-tuning)
* Ollama

---

# 🏗️ System Architecture

```
User
 │
 ▼
Frontend (React + Vite)
 │
 ▼
Backend API (Spring Boot)
 │
 ├── PostgreSQL (Relational Data)
 ├── Redis (Caching / Sessions)
 ├── MongoDB (Portfolio Content)
 │
 ▼
AI Engine (FastAPI + LLMs)
 │
 ▼
Portfolio Generation Service
 │
 ▼
Live Portfolio Website
```

---

# 🛠 Tech Stack

## Backend

* Spring Boot 3
* Spring Security
* JWT Authentication
* Spring Data JPA
* Bucket4j Rate Limiter
* Spring Boot Actuator

## Frontend

* React 19
* Vite
* Redux Toolkit
* Tailwind CSS
* Material UI
* React Router

## AI / ML

* FastAPI
* Hugging Face Transformers
* PEFT (LoRA)
* Ollama

## Databases

* PostgreSQL
* MongoDB
* Redis

## DevOps

* Docker
* Docker Compose
* Nginx

## Infrastructure

* Razorpay API
* Gmail SMTP
* REST APIs

---

# 📦 Project Structure

```
portiva
 ┣ frontend
 ┃ ┗ React Application
 ┣ backend
 ┃ ┗ Spring Boot API
 ┣ ai-engine
 ┃ ┗ FastAPI LLM Service
 ┣ nginx
 ┣ docker-compose.yml
 ┗ README.md
```
---

# 🔐 Authentication Flow

1 User registers
2 JWT token generated
3 Token used for API access
4 Role-based authorization applied

---

# 💳 Payment Integration

PORTIVA supports subscription-based access using:

* Razorpay Payment Gateway
* Secure transaction handling
* Subscription validation

---

# 📊 Platform Capabilities

* Multi-template portfolio engine
* Dynamic portfolio generation
* AI-assisted onboarding
* Image fallback services
* Analytics dashboard
* Scalable architecture

---

# 📷 Screenshots

(Add these images)
Portfolio Builder
<img width="1856" height="906" alt="Screenshot 2026-03-24 213644" src="https://github.com/user-attachments/assets/83977925-4825-4cd9-89b9-3c06ba2717b0" />
Dashboard
<img width="1878" height="905" alt="Screenshot 2026-03-24 215031" src="https://github.com/user-attachments/assets/9098a996-7c60-4122-881d-d9b21319e484" />

---

# 🚀 Future Improvements

* Custom domain support
* Portfolio analytics insights
* More AI content generation features
* Template marketplace
* Drag & drop portfolio editor

---

# 👨‍💻 Author

**Kalpesh Ghodekar**

GitHub
https://github.com/kalpesh027

LinkedIn
https://linkedin.com/in/kalpesh-ghodekar

LeetCode
https://leetcode.com/u/Kalpesh027/

---

# ⭐ Support

If you like this project, consider giving it a **star ⭐ on GitHub**.
