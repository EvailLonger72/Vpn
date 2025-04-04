# 🍓 Strawberry VPN

A responsive VPN web application with a modern UI, 3D Earth visualization, and simulated VPN functionality.

## Features

- **Clean, Modern UI**: Strawberry-inspired design with a responsive layout that works on all devices
- **Login/Register System**: User authentication with localStorage
- **Interactive 3D Earth Globe**: Visualize server locations around the world
- **VPN Server Selection**: Choose from multiple server locations
- **Premium Features**: Special servers optimized for gaming, downloads, and uploads
- **Connection Statistics**: Track speeds, ping, and data usage
- **Simulated VPN Connection**: Realistic connection state management

## Demo Credentials

You can use these special demo credentials to access the premium features:
- Email: `one`
- Password: `two`

## Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Visual Studio Code or another code editor
- Live Server extension for VS Code (or any local server)

## Setup Instructions

1. **Clone or download this repository**

2. **Open the project in Visual Studio Code**

3. **Install the Live Server extension**
   - Open VS Code Extensions panel (Ctrl+Shift+X or Cmd+Shift+X)
   - Search for "Live Server"
   - Install the extension by Ritwick Dey

4. **Launch the application**
   - Right-click on `index.html` in the file explorer
   - Select "Open with Live Server"
   - The application should open in your default browser

5. **Create an account or use demo credentials**
   - Register a new account, selecting either Free or Premium
   - Or use the demo credentials (Email: `one`, Password: `two`) for premium access

## Project Structure

```
strawberry-vpn/
├── css/
│   └── styles.css       # Main stylesheet
├── js/
│   ├── auth.js          # Authentication functionality
│   ├── dashboard.js     # Main dashboard functionality
│   ├── premium.js       # Premium dashboard features
│   └── globe.js         # 3D Earth visualization
├── index.html           # Login page
├── register.html        # Registration page
├── dashboard.html       # Free user dashboard
├── premium.html         # Premium user dashboard
└── README.md            # Project documentation
```

## Technology Stack

- **HTML5**: Semantic structure and content
- **CSS3**: Styling with responsive design principles
- **JavaScript**: Interactive functionality
- **Three.js**: 3D Earth globe visualization
- **LocalStorage API**: Client-side data persistence

## How It Works

1. **Authentication System**: Uses browser's localStorage to simulate user accounts and authentication.

2. **VPN Connection**: Simulates a VPN connection with realistic state changes and animations.

3. **3D Globe Visualization**: Displays server locations on an interactive Earth globe with dynamic highlighting for selected servers.

4. **Responsive Design**: Adapts to different screen sizes, from mobile to desktop.

## Customization

You can easily customize the application:

1. **Colors**: Modify the CSS variables in `styles.css` to change the color scheme.

2. **Server Locations**: Edit the server data in `globe.js` to add or modify server locations.

3. **Features**: Extend the premium features by updating both the UI and JavaScript functionality.

## License

This project is created for educational purposes only.

## Author

[Your Name] - Initial work

---

Enjoy using Strawberry VPN! 🍓 