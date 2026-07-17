# 📄 ResumeBuilder

A modern, responsive Resume Builder web application that enables users to create professional resumes through an intuitive interface. Users can securely manage their resume data, preview changes in real time, customize themes, and generate print-ready resumes.

---

## 🚀 Features

- 🔐 Secure User Authentication (JWT)
- 👤 User Registration & Login
- 📝 Create and Edit Resume
- 💾 Save Resume Data
- 👀 Live Resume Preview
- 🎨 Multiple Resume Themes
- 📥 Print & Download Resume
- 📱 Responsive Design
- ⚡ Fast and User-Friendly Interface

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JSON Web Token (JWT)
- Bcrypt.js

---

## 📂 Project Structure

```
ResumeBuilder/
│
├── client/                 # React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                 # Express Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── README.md
└── package.json
```

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/OmkarMundhe04/Resumebuilder.git
```

### Navigate to the project

```bash
cd Resumebuilder
```

### Install backend dependencies

```bash
cd server
npm install
```

### Install frontend dependencies

```bash
cd ../client
npm install
```

---

## ▶️ Run the Project

### Start Backend

```bash
cd server
npm start
```

### Start Frontend

```bash
cd client
npm start
```

The application will be available at:

```
http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env` file inside the **server** folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
```

---

## 📸 Screenshots

Add screenshots here.

Example:

```
screenshots/
    home.png
    login.png
    dashboard.png
    resume-preview.png
```

---

## 🎯 Future Improvements

- Multiple Resume Templates
- PDF Download
- AI Resume Suggestions
- Resume Score Analyzer
- ATS Compatibility Checker
- Cover Letter Generator
- Drag-and-Drop Section Reordering
- Profile Image Upload
- Dark Mode

---

## 📚 Learning Outcomes

This project helped in understanding:

- Full Stack Web Development
- REST API Development
- JWT Authentication
- MongoDB CRUD Operations
- React Component Architecture
- State Management
- Client-Server Communication
- Secure Password Hashing
- Responsive UI Design

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature-name
```

5. Create a Pull Request

---

## 👨‍💻 Author

**Omkar Mundhe**

- GitHub: https://github.com/OmkarMundhe04
- LinkedIn: *(Add your LinkedIn URL)*

---

## ⭐ Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.

It motivates further development and helps others discover the project.

---

## 📄 License

This project is licensed under the MIT License.
