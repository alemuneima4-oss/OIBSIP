
"use strict";

// ========================================
// 1. LOCAL STORAGE FUNCTIONS
// ========================================

function getUsers() {
    try {
        const users = localStorage.getItem("authUsers");
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error("Unable to load users:", error);
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem("authUsers", JSON.stringify(users));
}

function getSession() {
    try {
        const session = localStorage.getItem("loggedInUser");
        return session ? JSON.parse(session) : null;
    } catch (error) {
        return null;
    }
}

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`;
}


// ========================================
// 2. REGISTRATION
// ========================================

const registerForm = document.getElementById("register-form");

if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        const message = document.getElementById("message");

        // Check empty fields
        if (!username || !email || !password || !confirmPassword) {
            showMessage(message, "Please fill in all fields.", "error");
            return;
        }

        // Password must have at least 8 characters and one number
        const passwordPattern = /^(?=.*[0-9]).{8,}$/;

        if (!passwordPattern.test(password)) {
            showMessage(
                message,
                "Password must be at least 8 characters and contain one number.",
                "error"
            );
            return;
        }

        // Confirm password
        if (password !== confirmPassword) {
            showMessage(message, "Passwords do not match.", "error");
            return;
        }

        const users = getUsers();

        // Check duplicate username or email
        const existingUser = users.find(user =>
            user.username.toLowerCase() === username.toLowerCase() ||
            user.email.toLowerCase() === email
        );

        if (existingUser) {
            showMessage(
                message,
                "Username or email already exists.",
                "error"
            );
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            password: password
        };

        users.push(newUser);

        saveUsers(users);

        showMessage(
            message,
            "Registration successful! Redirecting to login...",
            "success"
        );

        registerForm.reset();

        setTimeout(() => {
            window.location.href = "./index.html";
        }, 1200);
    });
}


// ========================================
// 3. LOGIN
// ========================================

const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const identifier = document
            .getElementById("login-identifier")
            .value.trim().toLowerCase();

        const password = document
            .getElementById("login-password")
            .value;

        const message = document.getElementById("message");

        if (!identifier || !password) {
            showMessage(
                message,
                "Please enter your username/email and password.",
                "error"
            );
            return;
        }

        const users = getUsers();

        // Find account using username or email
        const user = users.find(account =>
            account.username.toLowerCase() === identifier ||
            account.email.toLowerCase() === identifier
        );

        // Validate both credentials together
        if (!user || user.password !== password) {
            showMessage(
                message,
                "Invalid username/email or password.",
                "error"
            );
            return;
        }

        // Create session
        const session = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        localStorage.setItem("loggedInUser", JSON.stringify(session));

        // Redirect to dashboard
        window.location.href = "./dashboard.html";
    });
}


// ========================================
// 4. PROTECT DASHBOARD
// ========================================

const userNameElement = document.getElementById("user-name");

if (userNameElement) {

    const session = getSession();

    if (!session || !session.id || !session.username) {

        window.location.replace("./index.html");

    } else {

        userNameElement.textContent = session.username;
    }
}


// ========================================
// 5. LOGOUT
// ========================================

const logoutButton = document.getElementById("logout-btn");

if (logoutButton) {

    logoutButton.addEventListener("click", function () {

        localStorage.removeItem("loggedInUser");

        window.location.replace("./index.html");
    });
}
