// globe.js - Handles 3D Earth globe visualization using Three.js

document.addEventListener('DOMContentLoaded', function() {
    const globeContainer = document.getElementById('globe');
    if (!globeContainer) return;
    
    // Set up scene
    const scene = new THREE.Scene();
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, globeContainer.clientWidth / globeContainer.clientHeight, 0.1, 1000);
    camera.position.z = 200;
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    globeContainer.appendChild(renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', function() {
        camera.aspect = globeContainer.clientWidth / globeContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
    });
    
    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(100, 64, 64);
    
    // Load Earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg');
    const earthBumpMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg');
    const earthSpecularMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg');
    
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: earthBumpMap,
        bumpScale: 0.5,
        specularMap: earthSpecularMap,
        specular: new THREE.Color('grey'),
        shininess: 5
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Server locations (latitude, longitude)
    const serverLocations = {
        'us': { lat: 37.0902, lng: -95.7129 }, // USA
        'uk': { lat: 55.3781, lng: -3.4360 },  // UK
        'jp': { lat: 36.2048, lng: 138.2529 }, // Japan
        'sg': { lat: 1.3521, lng: 103.8198 },  // Singapore
        'gaming-us': { lat: 40.7128, lng: -74.0060 }, // New York
        'gaming-eu': { lat: 48.8566, lng: 2.3522 },   // Paris
        'gaming-asia': { lat: 35.6762, lng: 139.6503 }, // Tokyo
        'gaming-au': { lat: -33.8688, lng: 151.2093 },  // Sydney
        'gaming-sa': { lat: -23.5505, lng: -46.6333 },  // São Paulo
        'dl-us': { lat: 34.0522, lng: -118.2437 },     // Los Angeles
        'dl-eu': { lat: 52.5200, lng: 13.4050 },       // Berlin
        'dl-asia': { lat: 22.3193, lng: 114.1694 },    // Hong Kong
        'dl-au': { lat: -37.8136, lng: 144.9631 },     // Melbourne
        'dl-sa': { lat: -34.6037, lng: -58.3816 },     // Buenos Aires
        'ul-us': { lat: 41.8781, lng: -87.6298 },      // Chicago
        'ul-eu': { lat: 51.5074, lng: -0.1278 },       // London
        'ul-asia': { lat: 31.2304, lng: 121.4737 },    // Shanghai
        'ul-au': { lat: -31.9505, lng: 115.8605 },     // Perth
        'ul-sa': { lat: -33.4489, lng: -70.6693 }      // Santiago
    };
    
    // Create server markers
    const serverMarkers = {};
    const markerGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    
    // Create markers for each server location
    Object.keys(serverLocations).forEach(server => {
        const { lat, lng } = serverLocations[server];
        
        // Convert lat/lng to 3D coordinates
        const position = latLngToVector3(lat, lng, 102); // Slightly above Earth's surface
        
        // Determine marker color based on server type
        let markerColor;
        if (server.includes('gaming')) {
            markerColor = 0x00FF00; // Green for gaming servers
        } else if (server.includes('dl')) {
            markerColor = 0x0000FF; // Blue for download servers
        } else if (server.includes('ul')) {
            markerColor = 0xFFFF00; // Yellow for upload servers
        } else {
            markerColor = 0xFF1744; // Strawberry red for standard servers
        }
        
        const markerMaterial = new THREE.MeshBasicMaterial({ color: markerColor });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(position);
        scene.add(marker);
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(2.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: markerColor,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(position);
        scene.add(glow);
        
        // Store marker and glow for later reference
        serverMarkers[server] = {
            marker,
            glow,
            position
        };
    });
    
    // Connection line
    let connectionLine = null;
    let activeServer = null;
    let pulseEffect = null;
    
    // Function to update connection visualization
    window.updateGlobeConnection = function(server, isConnected) {
        // Remove existing connection line
        if (connectionLine) {
            scene.remove(connectionLine);
            connectionLine = null;
        }
        
        // Remove existing pulse effect
        if (pulseEffect) {
            scene.remove(pulseEffect);
            pulseEffect = null;
        }
        
        // Reset all markers to normal size
        Object.values(serverMarkers).forEach(({ marker, glow }) => {
            marker.scale.set(1, 1, 1);
            glow.scale.set(1, 1, 1);
        });
        
        // If not connected or no server specified, return
        if (!isConnected || !server) {
            activeServer = null;
            return;
        }
        
        // Get server marker
        const serverMarker = serverMarkers[server];
        if (!serverMarker) return;
        
        // Highlight selected server
        serverMarker.marker.scale.set(1.5, 1.5, 1.5);
        serverMarker.glow.scale.set(1.5, 1.5, 1.5);
        
        // Create connection line
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xFF1744,
            linewidth: 2,
            transparent: true,
            opacity: 0.7
        });
        
        // Create curved line from center to server
        const curvePoints = [];
        const startPoint = new THREE.Vector3(0, 0, 0);
        const endPoint = serverMarker.position.clone();
        const midPoint = startPoint.clone().add(endPoint).multiplyScalar(0.5);
        
        // Add some height to the midpoint to create a curve
        const distance = startPoint.distanceTo(endPoint);
        midPoint.normalize().multiplyScalar(distance * 0.6);
        
        // Create curve
        const curve = new THREE.QuadraticBezierCurve3(
            startPoint,
            midPoint,
            endPoint
        );
        
        // Sample points along the curve
        const points = curve.getPoints(50);
        lineGeometry.setFromPoints(points);
        
        // Create line
        connectionLine = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(connectionLine);
        
        // Create pulse effect
        const pulseGeometry = new THREE.SphereGeometry(3, 16, 16);
        const pulseMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF1744,
            transparent: true,
            opacity: 0.7
        });
        pulseEffect = new THREE.Mesh(pulseGeometry, pulseMaterial);
        pulseEffect.position.copy(serverMarker.position);
        scene.add(pulseEffect);
        
        // Store active server
        activeServer = server;
    };
    
    // Animation variables
    let pulseScale = 1;
    let pulseDirection = 0.01;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate Earth
        earth.rotation.y += 0.001;
        
        // Animate pulse effect if active
        if (pulseEffect) {
            pulseScale += pulseDirection;
            
            if (pulseScale > 1.3) {
                pulseDirection = -0.01;
            } else if (pulseScale < 0.7) {
                pulseDirection = 0.01;
            }
            
            pulseEffect.scale.set(pulseScale, pulseScale, pulseScale);
        }
        
        // Render scene
        renderer.render(scene, camera);
    }
    
    // Start animation
    animate();
    
    // Helper function to convert latitude and longitude to 3D coordinates
    function latLngToVector3(lat, lng, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        return new THREE.Vector3(x, y, z);
    }
});