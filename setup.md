# ET Finance — Setup Guide

Follow these steps to set up and run the ET Finance SPA on your local machine.

## Prerequisites
- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **Groq API Key**: Get one from [Groq Console](https://console.groq.com/)

---

## 1. Installation

### Clone the Repository
```bash
git clone https://github.com/Vivekkrguptajio/ET.git
cd ET
```

### Install Backend Dependencies
```bash
cd backend
npm install
```

### Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 2. Environment Configuration

Create a `.env` file in the **`backend/`** directory:

```env
PORT=3001
JWT_SECRET=your_random_secret_here
GROQ_API_KEY=your_groq_api_key_here
```

> [!IMPORTANT]
> Keep your `GROQ_API_KEY` private. Never commit the `.env` file to version control (as already configured in `.gitignore`).

---

## 3. Development Commands

### Start the Backend Server
Open a terminal in the `backend/` directory:
```bash
npm run dev
```
*The server will run on `http://localhost:3001`*

### Start the Frontend App
Open a second terminal in the `frontend/` directory:
```bash
npm run dev
```
*The app will be available at `http://localhost:5174`*

---

## 4. Project Structure

- **`/frontend`**: React + Vite application with custom CSS design system.
- **`/backend`**: Express.js server with Groq AI integration and PDF parsing.
- **`aiService.js`**: Core frontend utility for interacting with the AI advisor.

---

## 5. Troubleshooting

- **CORS Issues**: Ensure the backend is running on port 3001, as the frontend proxy is configured for it.
- **AI Response Errors**: Verify your `GROQ_API_KEY` is valid and has sufficient quota.
- **PDF Upload**: Ensure your Form 16 is a valid PDF file.
