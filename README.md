## Ventura Connect: <a href="https://ventura-connect.vercel.app">Visit Here</a>
<div align="center">
 <a href="https://ventura-connect.vercel.app">
 <img src="https://github.com/jjbcasas/ventura-connect/blob/main/ventura-connect.gif"
 </a>
</div>
   A social media app enabling users to connect and share content. It features user authentication (email/password and Google OAuth) for secure account creation and log in. Allows users to browse posts, upload photos for profiles and new posts, and interact with others by following profiles, liking and commenting on posts.
   
# 💻 Tech Stack:
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-F7DF1E?style=for-the-badge&logo=ejs&logoColor=black) <br>
  My initial objective was to foster local community connections around shared interests and county-specific topics. To achieve this, the application should allow users to create personalized profiles, upload photos, and interact securely through authentication. Early features include 'Like' and 'Follow' functionalities to promote engagement.

# Optimizations
  I plan to enhance the app by expanding user customization options, enabling cross-user posting, integrating diverse media types for richer content, and adding chat functionality.

# Lesson Learned
   Through this process, I gained significant experience in backend development, particularly in designing and implementing CRUD operations. My proficiency in asynchronous programming with async/await improved considerably, and I deepened my knowledge of database querying for efficient and powerful feature creation.

# Install
  run `npm install` <br>
  run `npm start` or `node server.js`

# Things to add
  - Create a '.env' file in config folder and add the following `key = value`
    - PORT = any port number
    - DB_STRING = `your database URI`
    - CLOUD NAME = `your cloudinary cloud name`
    - API KEY = `your cloudinary api key`
    - API SECRET = `your cloudinary api secret`
    - GOOGLE_CLIENT_ID = `your google client id`
    - GOOGLE_CLIENT_SECRET = `your google client secret`
