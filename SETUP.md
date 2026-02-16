# AI Meal Coach Project Setup

This project consists of three parts:
1.  **Frontend**: `ai-meal-coach` (React/Vite)
2.  **Chatbot Backend**: `chatbot` (Flask)
3.  **Food Detection Backend**: `FoodDetectionBackend` (Flask/YOLO)

## Prerequisites
- **Node.js** (v18 or higher recommended)
- **Python** (v3.10 or higher recommended)

## 1. Setup Food Detection Backend (Port 5001)

1.  Navigate to the folder:
    ```bash
    cd FoodDetectionBackend
    ```
2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # Mac/Linux:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: If `requirements.txt` is missing, install manually as above)*
4.  Run the server:
    ```bash
    python app.py
    ```
    *Server should start on http://localhost:5001*

## 2. Setup Chatbot Backend (Port 5000)

1.  Open a new terminal and navigate to the folder:
    ```bash
    cd chatbot
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the server:
    ```bash
    python app.py
    ```
    *Server should start on http://localhost:5000*

## 3. Setup Frontend (Port 5173 or similar)

1.  Open a new terminal and navigate to the folder:
    ```bash
    cd ai-meal-coach
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open the link shown in the terminal (usually http://localhost:5173).

## Notes
- Ensure both backend servers are running for full functionality.
- The **Chatbot** runs on port **5000**.
- The **Food Detection** service runs on port **5001**.
