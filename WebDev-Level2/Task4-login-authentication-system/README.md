# Login Authentication System

A client-side authentication application built using HTML, CSS, and Vanilla JavaScript.

## Features

- User registration with username and email.
- Password validation: minimum 8 characters and at least one number.
- Duplicate username and email detection.
- Password confirmation.
- Login using username or email.
- Generic incorrect-credentials error message.
- Protected dashboard page.
- Logout functionality.
- Session persistence using localStorage.
- Responsive design.

## Technologies

- HTML5
- CSS3
- JavaScript
- Browser localStorage

## Project Structure

```text
Task4-login-authentication-system/
├── index.html
├── register.html
├── dashboard.html
├── css/
│   └── style.css
├── js/
│   └── auth.js
└── README.md
```

## How to Run

1. Clone the repository:

   ```bash
   git clone https://github.com/alemuneima4-oss/OIBSIP.git
   ```

2. Navigate to the project folder:

   ```bash
   cd OIBSIP/WebDev-Level2/Task4-login-authentication-system
   ```

3. Open `index.html` using VS Code Live Server.

4. Register an account and log in.

## Security Note

This is an educational demonstration. Passwords are stored in plain text in localStorage. Client-side authentication is not suitable for protecting real accounts or sensitive information. Real applications should use server-side authentication, password hashing, and secure sessions.