# 🏠 California Housing Price Predictor: Full-Stack ML App

A full-stack, cloud-connected machine learning web application that predicts California housing prices in real-time based on custom user inputs. 

This project demonstrates a modern, decoupled architecture using a **Next.js** frontend communicating with a containerized **FastAPI** machine learning backend.
## 🚀 Core Engineering Highlights

* **🐳 Dockerized Architecture:** The FastAPI machine learning backend is completely containerized. It runs inside a custom Docker environment on Hugging Face Spaces, ensuring absolute consistency between development and production.
* **⚙️ Automated CI/CD Pipeline:** Built with GitHub Actions, the pipeline automatically packages and deploys backend updates. It uses Git Large File Storage (LFS) to safely push heavy `.pkl` models and strictly triggers only when the `backend/` directory is modified, optimizing server compute time.
* **🔗 Decoupled Systems:** A modern separation of concerns featuring a serverless Next.js edge frontend securely fetching data from the dedicated Python backend.

[![Frontend Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://housing-predictor-nine.vercel.app/)
[![Backend API](https://img.shields.io/badge/API-Hugging_Face-yellow?style=for-the-badge&logo=huggingface)](https://huggingface.co/spaces/vishwansh01/housing-api)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-blue?style=for-the-badge&logo=githubactions)](#)

---

## 🚀 Live Demo & API
* **Frontend Application:** [https://housing-predictor-nine.vercel.app/](https://housing-predictor-nine.vercel.app/)
* **Backend API Base URL:** `https://vishwansh01-housing-api.hf.space`
* **Hugging Face Space:** [https://huggingface.co/spaces/vishwansh01/housing-api](https://huggingface.co/spaces/vishwansh01/housing-api)

---

## 🏗️ Architecture & Tech Stack

This project is split into two distinct environments to ensure scalability, security, and separation of concerns.

### 💻 Frontend (Client)
* **Framework:** Next.js / React
* **Hosting:** Vercel (Serverless Edge Network)
* **Integration:** Uses environment variables (`NEXT_PUBLIC_API_URL`) to securely route fetch requests to the cloud API.

### 🧠 Backend (API & Machine Learning)
* **Framework:** Python & FastAPI
* **Model:** Scikit-learn Random Forest model (`housing_model.pkl`)
* **Server:** Uvicorn (Configured strictly for port 7860)
* **Hosting:** Hugging Face Spaces (Docker Container)
* **Storage:** Git Large File Storage (LFS) for handling heavy binary ML models.

### ⚙️ CI/CD Pipeline
* **GitHub Actions:** Automated deployment pipeline configured via `.github/workflows/deploy.yml`.
* **Smart Triggers:** Deployments execute automatically only when changes are pushed to the `backend/` folder, optimizing compute resources.

---

## 🛠️ Local Development Setup

To run this application locally, you must start both the backend machine learning server and the frontend development environment.

### ⚠️ Prerequisite: Git LFS
Because the `.pkl` model file is a large binary, standard Git will not pull it correctly. You must have Git LFS installed before cloning.
```bash
git lfs install
```

### 1. Clone the Repository
```bash
git clone [https://github.com/vishwansh01/housing-predictor.git](https://github.com/vishwansh01/housing-predictor.git)
cd housing-predictor

### 2. Start the Backend API
Ensure you have Python 3.9+ installed.
```bash
cd backend

# Install the required ML and API libraries
pip install -r requirements.txt

# Start the FastAPI server (Runs on localhost:8000 locally)
uvicorn app:app --reload
```
*The API is now listening at `http://localhost:8000`.*

### 3. Start the Frontend App
Open a new, separate terminal window.
```bash
cd frontend

# Install Node dependencies
npm install

# Create a local environment file to point to your local API
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the Next.js development server
npm run dev
```
*The application is now running locally at `http://localhost:3000`.*

---

## ☁️ Deployment Guide

This project is fully automated. Here is how the cloud infrastructure is configured:

### 1. Backend Deployment (Hugging Face)
The backend is continuously deployed using GitHub Actions.
1. Any push to the `main` branch that modifies files in the `backend/` directory triggers the workflow.
2. A temporary Ubuntu runner checks out the code, configures Git LFS, and force-pushes the `backend` subfolder to Hugging Face.
3. Hugging Face reads the configuration `README.md` and the `Dockerfile`, provisions a virtual machine, installs the `requirements.txt`, and boots the FastAPI server on port 7860.

### 2. Frontend Deployment (Vercel)
The frontend is continuously deployed via Vercel's GitHub integration.
1. Vercel monitors the `main` branch specifically for changes within the `frontend/` root directory.
2. Upon detecting changes, Vercel pulls the code, installs NPM packages, injects the `NEXT_PUBLIC_API_URL` environment variable, and builds the static assets.
3. The site is instantly deployed to Vercel's global edge network.

---

## 🐛 Known Troubleshooting & Fixes Documented

* **Hugging Face LFS Rejection:** Hugging Face rejects large binary pushes from standard Git. Fixed by injecting `git lfs install` and `git lfs track "*.pkl"` directly into the GitHub Actions workflow.
* **Port Mismatch Timeout:** Hugging Face Spaces strictly monitor Port `7860` for health checks. Fixed by explicitly defining `--port 7860` in the Dockerfile to prevent the 30-minute startup loop.