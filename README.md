# 🍓 Strawberry VPN

A fully responsive VPN Web Application built with HTML, CSS, and JavaScript.

## Features

- **Responsive Design**: Works on all devices from mobile to desktop
- **Authentication**: Login and registration system with account types (Free/Premium)
- **VPN Dashboard**: Connect/disconnect functionality with server selection
- **Premium Features**: Special servers optimized for gaming, downloads, and uploads
- **3D Earth Visualization**: Interactive globe showing server locations
- **Modern UI/UX**: Strawberry-inspired design with smooth animations

## Demo Credentials

For demo purposes, you can use the following credentials to access the premium dashboard directly:
- Email: `one`
- Password: `two`

## Project Structure

```
Strawberry-VPN/
├── index.html              # Landing page
├── login.html              # Login page
├── register.html           # Registration page
├── dashboard.html          # Free user dashboard
├── premium.html            # Premium user dashboard
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   ├── main.js             # General functionality
│   ├── auth.js             # Authentication functionality
│   ├── dashboard.js        # Dashboard functionality
│   ├── premium.js          # Premium dashboard functionality
│   └── globe.js            # 3D Earth visualization
└── img/                    # Image assets
```

## How to Run the Project

### Prerequisites

- Visual Studio Code (or any code editor)
- Live Server extension for VS Code (or any local server)

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/strawberry-vpn.git
   cd strawberry-vpn
   ```

2. **Open the project in Visual Studio Code**

   ```bash
   code .
   ```

3. **Install the Live Server extension**

   - Go to Extensions in VS Code (or press `Ctrl+Shift+X`)
   - Search for "Live Server"
   - Install the extension by Ritwick Dey

4. **Run the project**

   - Right-click on `index.html`
   - Select "Open with Live Server"
   - The project will open in your default browser

### Firebase Setup (Optional)

If you want to implement real authentication with Firebase:

1. **Create a Firebase project**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup steps

2. **Enable Authentication**

   - In your Firebase project, go to "Authentication" > "Sign-in method"
   - Enable "Email/Password" authentication

3. **Add Firebase to your web app**

   - In your Firebase project, click on the web icon (</>) to add a web app
   - Register your app with a nickname
   - Copy the Firebase configuration

4. **Create a firebase-config.js file**

   ```javascript
   // Add this file to your js directory
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   // Initialize Firebase
   firebase.initializeApp(firebaseConfig);
   ```

5. **Update your HTML files**

   Add the Firebase SDK to your HTML files before your other scripts:

   ```html
   <!-- Firebase App (the core Firebase SDK) -->
   <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js"></script>
   <!-- Firebase Authentication -->
   <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"></script>
   <!-- Your Firebase configuration -->
   <script src="js/firebase-config.js"></script>
   ```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Credits

- Three.js for 3D Earth visualization
- Font Awesome for icons
- Google Fonts for typography

## License

This project is licensed under the MIT License - see the LICENSE file for details.