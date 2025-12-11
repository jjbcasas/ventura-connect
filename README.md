## Ventura Connect: <a href="https://ventura-connect.onrender.com">Visit Here</a>
<div align="center">
 <a href="https://ventura-connect.onrender.com">
 <img src="https://github.com/jjbcasas/react-ventura-connect/blob/main/ventura-connect.GIF"
 </a>
</div>
   A full-stack social media app with a React (via Vite) frontend and a Node.js/Express.js backend enabling users to connect and share content. It features user authentication (email/password and Google OAuth) for secure account creation and log in. Allows users to browse posts, upload photos for profiles and new posts, and interact with others by following profiles, liking and commenting on posts.
   
# 💻 Tech Stack:
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) <br>
  After building the initial version with a Node.js/Express.js backend and EJS templating, I made the strategic decision to migrate the entire frontend to React. This migration allowed me to rebuild core features to be more dynamic, reusable and modern, leveraging React's component-based architecture and state management capabilities.

# Optimizations
  I plan to enhance the app by expanding user customization options, enabling cross-user posting, integrating diverse media types for richer content, and adding chat functionality.

# Lesson Learned
   Through this project, I gained significant experience developing a React frontend. I focused on component-based architecture, state management, and data fetching from a backend API. I also utilized the Context API to efficiently manage application-wide state.

# Install dependencies:
  Run the Backend(from the root):<br>
    &nbsp;&nbsp; run `npm install` <br>
    &nbsp;&nbsp; run `npm run dev` <br>
Run the frontend:<br>
    &nbsp;&nbsp; `cd frontend` <br>
    &nbsp;&nbsp; run `npm install` <br>
    &nbsp;&nbsp; run `npm run dev` or `node server.js`

# Things to add
  - Create a '.env' file in backend/config folder and add the following `key = value`
    - PORT = any port number
    - DB_STRING = `your database URI`
    - CLOUD NAME = `your cloudinary cloud name`
    - API KEY = `your cloudinary api key`
    - API SECRET = `your cloudinary api secret`
    - GOOGLE_CLIENT_ID = `your google client id`
    - GOOGLE_CLIENT_SECRET = `your google client secret`
    - FRONTEND_URL= `your frontend port number`
    - BACKEND_URL= `your backend port number`
  - Create .env file in your frontend folder add the value of your port or host
    - VITE_REACT_APP_BACKEND_BASEURL = `your backend port number`
