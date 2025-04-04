// Strawberry VPN - 3D Earth Globe Visualization

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the globe if the container exists
    const globeContainer = document.getElementById('earthGlobe');
    if (globeContainer) {
        const globe = new Globe(globeContainer);
        globe.init();
        
        // Make globe controls available globally
        window.globeControl = {
            highlightSelectedServer: function(serverCode) {
                globe.highlightServer(serverCode);
            },
            updateHighlightedServers: function(tabId) {
                globe.updateServerGroup(tabId);
            },
            toggleTrafficVisualization: function(enabled) {
                globe.toggleTrafficVisualization(enabled);
            },
            toggleScanningMode: function(enabled) {
                globe.toggleScanningMode(enabled);
            },
            simulateThreats: function() {
                globe.simulateThreats();
            }
        };
    }
});

// Globe class for Earth visualization
class Globe {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.earth = null;
        this.clouds = null;
        this.serverPoints = {};
        this.pointsGroup = null;
        this.raycaster = null;
        this.mouse = null;
        this.activeServer = null;
        this.activeServerGroup = 'standard';
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.trafficEnabled = false;
        this.scanningEnabled = false;
        this.trafficLines = [];
        this.scanRadius = 1.3;
        this.scanningRing = null;
        this.threatPoints = [];
        
        // Server locations (lat, long)
        this.serverLocations = {
            // Standard servers
            'us': { lat: 37.7749, lng: -122.4194, name: 'United States', group: 'standard' },
            'uk': { lat: 51.5074, lng: -0.1278, name: 'United Kingdom', group: 'standard' },
            'jp': { lat: 35.6762, lng: 139.6503, name: 'Japan', group: 'standard' },
            'sg': { lat: 1.3521, lng: 103.8198, name: 'Singapore', group: 'standard' },
            
            // Gaming servers
            'gaming-us': { lat: 40.7128, lng: -74.0060, name: 'US Gaming', group: 'gaming' },
            'gaming-de': { lat: 52.5200, lng: 13.4050, name: 'Germany Gaming', group: 'gaming' },
            'gaming-jp': { lat: 34.6937, lng: 135.5022, name: 'Japan Gaming', group: 'gaming' },
            'gaming-sg': { lat: 1.3521, lng: 103.8198, name: 'Singapore Gaming', group: 'gaming' },
            'gaming-br': { lat: -23.5505, lng: -46.6333, name: 'Brazil Gaming', group: 'gaming' },
            
            // Download servers
            'dl-us': { lat: 37.7749, lng: -122.4194, name: 'US Download', group: 'download' },
            'dl-uk': { lat: 51.5074, lng: -0.1278, name: 'UK Download', group: 'download' },
            'dl-nl': { lat: 52.3676, lng: 4.9041, name: 'Netherlands Download', group: 'download' },
            'dl-fr': { lat: 48.8566, lng: 2.3522, name: 'France Download', group: 'download' },
            'dl-ca': { lat: 43.6532, lng: -79.3832, name: 'Canada Download', group: 'download' },
            
            // Upload servers
            'ul-us': { lat: 37.7749, lng: -122.4194, name: 'US Upload', group: 'upload' },
            'ul-uk': { lat: 51.5074, lng: -0.1278, name: 'UK Upload', group: 'upload' },
            'ul-de': { lat: 52.5200, lng: 13.4050, name: 'Germany Upload', group: 'upload' },
            'ul-sg': { lat: 1.3521, lng: 103.8198, name: 'Singapore Upload', group: 'upload' },
            'ul-au': { lat: -33.8688, lng: 151.2093, name: 'Australia Upload', group: 'upload' }
        };
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 3.5;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // Create Earth
        this.createEarth();
        
        // Create clouds
        this.createClouds();
        
        // Create server points
        this.createServerPoints();
        
        // Setup raycaster for interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Add event listeners for interaction
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.container.addEventListener('touchstart', this.onTouchStart.bind(this));
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Create scanning ring (initially hidden)
        this.createScanningRing();
        
        // Start animation loop
        this.animate();
        
        // Expose additional functions to global control
        if (window.globeControl) {
            window.globeControl.toggleTrafficVisualization = this.toggleTrafficVisualization.bind(this);
            window.globeControl.toggleScanningMode = this.toggleScanningMode.bind(this);
            window.globeControl.simulateThreats = this.simulateThreats.bind(this);
        }
    }
    
    createEarth() {
        // Create Earth geometry
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Load Earth texture
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load('https://unpkg.com/three-globe@2.24.13/example/img/earth-blue-marble.jpg');
        const bumpMap = textureLoader.load('https://unpkg.com/three-globe@2.24.13/example/img/earth-topology.png');
        const specularMap = textureLoader.load('https://unpkg.com/three-globe@2.24.13/example/img/earth-water.png');
        
        // Create material with textures
        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpMap: bumpMap,
            bumpScale: 0.05,
            specularMap: specularMap,
            specular: new THREE.Color('grey'),
            shininess: 10
        });
        
        // Create mesh and add to scene
        this.earth = new THREE.Mesh(geometry, material);
        this.earth.rotation.y = Math.PI; // Initial rotation
        this.earth.classList = ['earth-animation']; // Add animation class
        this.scene.add(this.earth);
    }
    
    createClouds() {
        // Create clouds geometry
        const geometry = new THREE.SphereGeometry(1.01, 64, 64);
        
        // Load clouds texture
        const textureLoader = new THREE.TextureLoader();
        const cloudsTexture = textureLoader.load('https://unpkg.com/three-globe@2.24.13/example/img/earth-clouds.png');
        
        // Create material with transparency
        const material = new THREE.MeshPhongMaterial({
            map: cloudsTexture,
            transparent: true,
            opacity: 0.4
        });
        
        // Create mesh and add to scene
        this.clouds = new THREE.Mesh(geometry, material);
        this.scene.add(this.clouds);
    }
    
    createServerPoints() {
        // Create a group to hold all points
        this.pointsGroup = new THREE.Group();
        this.scene.add(this.pointsGroup);
        
        // Create server points
        for (const [serverId, serverData] of Object.entries(this.serverLocations)) {
            // Create point geometry
            const geometry = new THREE.SphereGeometry(0.02, 16, 16);
            
            // Set color based on server group
            let color;
            switch (serverData.group) {
                case 'gaming':
                    color = 0x7B1FA2; // Purple
                    break;
                case 'download':
                    color = 0x0288D1; // Blue
                    break;
                case 'upload':
                    color = 0x388E3C; // Green
                    break;
                default:
                    color = 0xFF1744; // Strawberry red
            }
            
            // Create material
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: serverData.group === 'standard' ? 0.8 : 0.4 // Non-standard servers start dimmed
            });
            
            // Create mesh
            const point = new THREE.Mesh(geometry, material);
            
            // Convert lat, long to 3D position
            const position = this.latLongToVector3(serverData.lat, serverData.lng, 1.02);
            point.position.copy(position);
            
            // Add point to group
            this.pointsGroup.add(point);
            
            // Store reference to the point
            this.serverPoints[serverId] = {
                mesh: point,
                data: serverData,
                originalScale: point.scale.clone(),
                pulseAnimation: null,
                originalColor: color
            };
            
            // Create connection beam (initially invisible)
            const beamGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0, 8);
            const beamMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0
            });
            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            beam.visible = false;
            this.scene.add(beam);
            this.serverPoints[serverId].beam = beam;
        }
        
        // Initially show only standard servers
        this.updateServerGroup('standard');
    }
    
    latLongToVector3(lat, lng, radius) {
        // Convert latitude and longitude to 3D position
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        return new THREE.Vector3(x, y, z);
    }
    
    highlightServer(serverCode) {
        // If we had a previous active server, reset it
        if (this.activeServer) {
            const server = this.serverPoints[this.activeServer];
            if (server) {
                // Reset point
                server.mesh.scale.copy(server.originalScale);
                server.mesh.material.color.setHex(server.originalColor);
                server.mesh.material.opacity = 0.8;
                
                // Hide beam
                server.beam.visible = false;
                server.beam.material.opacity = 0;
                
                // Cancel pulse animation
                if (server.pulseAnimation) {
                    clearInterval(server.pulseAnimation);
                    server.pulseAnimation = null;
                }
            }
        }
        
        // Set new active server
        this.activeServer = serverCode;
        
        // Highlight the new active server
        if (serverCode && this.serverPoints[serverCode]) {
            const server = this.serverPoints[serverCode];
            
            // Enlarge point
            server.mesh.scale.set(1.5, 1.5, 1.5);
            
            // Change color and make fully opaque
            server.mesh.material.color.setHex(0xFFCA28); // Accent yellow
            server.mesh.material.opacity = 1;
            
            // Create beam from Earth to server
            const beamStart = new THREE.Vector3(0, 0, 0);
            const beamEnd = server.mesh.position.clone();
            const beamLength = beamEnd.length();
            
            // Position and orient beam
            server.beam.scale.set(1, beamLength, 1);
            server.beam.position.copy(beamEnd.clone().multiplyScalar(0.5));
            server.beam.lookAt(beamEnd);
            server.beam.rotation.x = Math.PI / 2;
            
            // Show beam with animation
            server.beam.visible = true;
            let opacity = 0;
            const fadeIn = setInterval(() => {
                opacity += 0.05;
                if (opacity >= 0.7) {
                    clearInterval(fadeIn);
                    opacity = 0.7;
                }
                server.beam.material.opacity = opacity;
            }, 50);
            
            // Add pulse animation
            let scale = 1.5;
            let growing = false;
            server.pulseAnimation = setInterval(() => {
                if (growing) {
                    scale += 0.03;
                    if (scale >= 1.8) {
                        growing = false;
                    }
                } else {
                    scale -= 0.03;
                    if (scale <= 1.5) {
                        growing = true;
                    }
                }
                server.mesh.scale.set(scale, scale, scale);
            }, 50);
        }
    }
    
    updateServerGroup(groupId) {
        this.activeServerGroup = groupId;
        
        // Update visibility of server points based on group
        for (const [serverId, server] of Object.entries(this.serverPoints)) {
            // Default opacity
            let opacity = 0.3;
            
            // If server is in current group or is standard, make it visible
            if (server.data.group === groupId || (groupId === 'standard' && server.data.group === 'standard')) {
                opacity = 0.8;
            }
            
            // Update opacity
            server.mesh.material.opacity = opacity;
        }
    }
    
    onMouseDown(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.height) * 2 + 1;
        
        this.checkIntersection();
    }
    
    onTouchStart(event) {
        if (event.touches.length > 0) {
            // Prevent default behavior to avoid scrolling
            event.preventDefault();
            
            // Calculate touch position
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = ((event.touches[0].clientX - rect.left) / this.width) * 2 - 1;
            this.mouse.y = -((event.touches[0].clientY - rect.top) / this.height) * 2 + 1;
            
            this.checkIntersection();
        }
    }
    
    checkIntersection() {
        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects(this.pointsGroup.children);
        
        if (intersects.length > 0) {
            // Find which server was clicked
            for (const [serverId, server] of Object.entries(this.serverPoints)) {
                if (server.mesh === intersects[0].object) {
                    // If server is in current group or is standard, select it
                    if (server.data.group === this.activeServerGroup || 
                        (this.activeServerGroup === 'standard' && server.data.group === 'standard')) {
                        // Find and click the corresponding server option in the UI
                        const serverOption = document.querySelector(`.server-option[data-server="${serverId}"]`);
                        if (serverOption) {
                            serverOption.click();
                        } else {
                            // If no UI element, just highlight the server
                            this.highlightServer(serverId);
                        }
                    }
                    break;
                }
            }
        }
    }
    
    onWindowResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.width, this.height);
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Rotate Earth
        if (this.earth) {
            this.earth.rotation.y += 0.0007;
        }
        
        // Rotate clouds slightly faster
        if (this.clouds) {
            this.clouds.rotation.y += 0.0009;
        }
        
        // Rotate server points with Earth
        if (this.pointsGroup) {
            this.pointsGroup.rotation.y = this.earth.rotation.y;
        }
        
        // Update beam position if there's an active server
        if (this.activeServer && this.serverPoints[this.activeServer]) {
            const server = this.serverPoints[this.activeServer];
            
            // Update beam position based on rotating point
            if (server.beam && server.beam.visible) {
                const worldPosition = new THREE.Vector3();
                server.mesh.getWorldPosition(worldPosition);
                
                const beamEnd = worldPosition;
                const beamLength = beamEnd.length();
                
                // Position and orient beam
                server.beam.scale.set(1, beamLength, 1);
                server.beam.position.copy(beamEnd.clone().multiplyScalar(0.5));
                server.beam.lookAt(beamEnd);
                server.beam.rotation.x = Math.PI / 2;
            }
        }
        
        // Animate traffic lines
        if (this.trafficEnabled && this.trafficLines.length > 0) {
            this.animateTrafficLines();
        }
        
        // Animate scanning ring
        if (this.scanningEnabled) {
            this.animateScanningRing();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Create scanning ring for threat detection visualization
    createScanningRing() {
        const ringGeometry = new THREE.RingGeometry(this.scanRadius, this.scanRadius + 0.02, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        this.scanningRing = new THREE.Mesh(ringGeometry, ringMaterial);
        this.scanningRing.rotation.x = Math.PI / 2;
        this.scanningRing.visible = false;
        this.scene.add(this.scanningRing);
    }
    
    // Toggle traffic visualization
    toggleTrafficVisualization(enabled) {
        this.trafficEnabled = enabled === undefined ? !this.trafficEnabled : enabled;
        
        if (this.trafficEnabled) {
            this.createTrafficLines();
        } else {
            this.clearTrafficLines();
        }
        
        return this.trafficEnabled;
    }
    
    // Create traffic lines between random points
    createTrafficLines() {
        this.clearTrafficLines();
        
        // Only create traffic for visible servers
        const visibleServers = Object.entries(this.serverPoints)
            .filter(([_, server]) => server.mesh.material.opacity > 0.5)
            .map(([id, _]) => id);
        
        if (visibleServers.length < 2) return;
        
        // Create 5-10 traffic lines
        const numLines = Math.floor(Math.random() * 6) + 5;
        
        for (let i = 0; i < numLines; i++) {
            // Select two random servers
            const server1Id = visibleServers[Math.floor(Math.random() * visibleServers.length)];
            let server2Id = visibleServers[Math.floor(Math.random() * visibleServers.length)];
            
            // Make sure we don't connect a server to itself
            while (server2Id === server1Id) {
                server2Id = visibleServers[Math.floor(Math.random() * visibleServers.length)];
            }
            
            const server1 = this.serverPoints[server1Id];
            const server2 = this.serverPoints[server2Id];
            
            // Create curved line between servers
            const curvePoints = this.createCurvedLineBetweenPoints(
                server1.mesh.position.clone(),
                server2.mesh.position.clone()
            );
            
            // Create line geometry
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
            
            // Random color based on server group
            let color;
            const serverGroup = server1.data.group;
            switch (serverGroup) {
                case 'gaming':
                    color = 0x7B1FA2; // Purple
                    break;
                case 'download':
                    color = 0x0288D1; // Blue
                    break;
                case 'upload':
                    color = 0x388E3C; // Green
                    break;
                default:
                    color = 0xFF1744; // Strawberry red
            }
            
            // Create line material
            const lineMaterial = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.5,
                linewidth: 1
            });
            
            // Create line and add to scene
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
            
            // Store reference to line
            this.trafficLines.push({
                line: line,
                progress: 0,
                speed: Math.random() * 0.01 + 0.005, // Random speed
                points: curvePoints
            });
        }
    }
    
    // Create a curved line between two points
    createCurvedLineBetweenPoints(point1, point2) {
        // Calculate mid point
        const midPoint = point1.clone().add(point2).multiplyScalar(0.5);
        
        // Push mid point outward from center of Earth
        const midPointNormalized = midPoint.clone().normalize();
        midPoint.add(midPointNormalized.multiplyScalar(Math.random() * 0.3 + 0.2));
        
        // Create quadratic curve
        const curve = new THREE.QuadraticBezierCurve3(
            point1,
            midPoint,
            point2
        );
        
        // Get points along curve
        return curve.getPoints(20);
    }
    
    // Clear all traffic lines
    clearTrafficLines() {
        this.trafficLines.forEach(traffic => {
            this.scene.remove(traffic.line);
        });
        this.trafficLines = [];
    }
    
    // Toggle scanning mode
    toggleScanningMode(enabled) {
        this.scanningEnabled = enabled === undefined ? !this.scanningEnabled : enabled;
        this.scanningRing.visible = this.scanningEnabled;
        
        if (this.scanningEnabled) {
            // Reset scan position
            this.scanRadius = 1.3;
            this.scanningRing.scale.set(this.scanRadius, this.scanRadius, this.scanRadius);
            
            // Create random threat points
            this.createRandomThreats();
        } else {
            // Clear threats
            this.clearThreats();
        }
        
        return this.scanningEnabled;
    }
    
    // Create random threat points
    createRandomThreats() {
        this.clearThreats();
        
        // Create 3-8 random threat points
        const numThreats = Math.floor(Math.random() * 6) + 3;
        
        for (let i = 0; i < numThreats; i++) {
            // Random position on globe
            const lat = Math.random() * 180 - 90;
            const lng = Math.random() * 360 - 180;
            const position = this.latLongToVector3(lat, lng, 1.02);
            
            // Create threat point geometry
            const geometry = new THREE.SphereGeometry(0.02, 16, 16);
            
            // Create material
            const material = new THREE.MeshBasicMaterial({
                color: 0xFF0000,
                transparent: true,
                opacity: 0
            });
            
            // Create mesh
            const threat = new THREE.Mesh(geometry, material);
            threat.position.copy(position);
            this.scene.add(threat);
            
            // Store reference to threat
            this.threatPoints.push({
                mesh: threat,
                detected: false,
                lat: lat,
                lng: lng
            });
        }
    }
    
    // Clear all threat points
    clearThreats() {
        this.threatPoints.forEach(threat => {
            this.scene.remove(threat.mesh);
        });
        this.threatPoints = [];
    }
    
    // Simulate threats being detected (called from external button)
    simulateThreats() {
        if (!this.scanningEnabled) {
            this.toggleScanningMode(true);
        } else {
            // Reset scan
            this.scanRadius = 1.3;
            this.clearThreats();
            this.createRandomThreats();
        }
    }
    
    // Animate traffic lines
    animateTrafficLines() {
        // Update each traffic line
        this.trafficLines.forEach(traffic => {
            traffic.progress += traffic.speed;
            
            if (traffic.progress >= 1) {
                // Reset progress
                traffic.progress = 0;
                
                // Recreate traffic lines occasionally
                if (Math.random() < 0.1) {
                    this.clearTrafficLines();
                    this.createTrafficLines();
                }
            }
            
            // Update line geometry
            const lineGeometry = traffic.line.geometry;
            const positions = lineGeometry.attributes.position.array;
            
            for (let i = 0; i < positions.length / 3; i++) {
                // Only update points up to current progress
                if (i / (positions.length / 3) <= traffic.progress) {
                    const point = traffic.points[i];
                    positions[i * 3] = point.x;
                    positions[i * 3 + 1] = point.y;
                    positions[i * 3 + 2] = point.z;
                } else {
                    // Hide remaining points
                    positions[i * 3] = 0;
                    positions[i * 3 + 1] = 0;
                    positions[i * 3 + 2] = 0;
                }
            }
            
            lineGeometry.attributes.position.needsUpdate = true;
        });
    }
    
    // Animate scanning ring
    animateScanningRing() {
        // Shrink ring
        this.scanRadius -= 0.005;
        
        // If ring has reached center, restart
        if (this.scanRadius <= 0) {
            this.scanRadius = 1.3;
            
            // Create new threats
            this.clearThreats();
            this.createRandomThreats();
        }
        
        // Update ring scale
        const scale = this.scanRadius / 1.3;
        this.scanningRing.scale.set(scale, scale, scale);
        
        // Check for threat detection
        this.threatPoints.forEach(threat => {
            // Distance from center
            const distance = threat.mesh.position.length();
            
            // If scan radius is close to threat position and not yet detected
            if (Math.abs(distance - this.scanRadius) < 0.05 && !threat.detected) {
                // Mark as detected
                threat.detected = true;
                
                // Show threat with animation
                threat.mesh.material.color.set(0xFF0000);
                
                // Animate opacity
                let opacity = 0;
                const fadeIn = setInterval(() => {
                    opacity += 0.05;
                    if (opacity >= 1) {
                        clearInterval(fadeIn);
                        opacity = 1;
                        
                        // Pulse effect
                        let scale = 1;
                        let growing = true;
                        const pulse = setInterval(() => {
                            if (growing) {
                                scale += 0.1;
                                if (scale >= 1.5) growing = false;
                            } else {
                                scale -= 0.1;
                                if (scale <= 1) growing = true;
                            }
                            threat.mesh.scale.set(scale, scale, scale);
                        }, 50);
                        
                        // Store interval for cleanup
                        threat.pulseInterval = pulse;
                    }
                    threat.mesh.material.opacity = opacity;
                }, 50);
                
                // Trigger threat detected event
                if (typeof window.onThreatDetected === 'function') {
                    window.onThreatDetected(threat.lat, threat.lng);
                }
            }
        });
    }
} 