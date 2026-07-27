@echo off
echo =========================================================================
echo  Starting J.P. College of Engineering - Department ERP (3 Services)
echo =========================================================================
echo.

echo Starting Python ML Microservice (Port 8000)...
start "Python ML Microservice" cmd /k "cd ml_service && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Node.js Express Backend API (Port 5000)...
start "Node.js Express Backend" cmd /k "cd backend && node server.js"

echo Starting React Vite Frontend Dev Server (Port 5173 / 3000)...
start "React Vite Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All 3 services launched in separate windows!
echo Open your browser at: http://localhost:5173 or http://localhost:3000
echo.
echo Quick Demo Login Accounts (Password: 123)
echo - HOD:      FAC_HOD01
echo - Faculty:  FAC001
echo - Student:  953621CS001
echo.
