// routes.js - Hash-based router for Pesona Alam SPA

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.defaultRoute = null;
    
    // Listen for hash changes
    window.addEventListener('hashchange', this.handleRouteChange.bind(this));
    
    // Handle initial route on page load
    window.addEventListener('DOMContentLoaded', () => {
      this.handleRouteChange();
    });
  }
  
  // Register a route
  addRoute(path, controller) {
    this.routes[path] = controller;
    return this; // For chaining
  }
  
  // Set a default route
  setDefault(path) {
    this.defaultRoute = path;
    return this; // For chaining
  }
  
  // Navigate to a specific route
  navigateTo(path) {
    window.location.hash = path;
  }
  
  // Get current hash path
  getPath() {
    // Remove the # symbol and get the path
    return window.location.hash.slice(1) || '/';
  }
  
  // Handle route changes
  handleRouteChange() {
    const path = this.getPath();
    
    // Hide all route containers
    document.querySelectorAll('[data-route]').forEach(el => {
      el.classList.add('hidden');
    });
    
    // Find the route handler
    const route = this.routes[path];
    
    if (route) {
      // Run the controller function for this route
      route();
      this.currentRoute = path;
    } else if (this.defaultRoute) {
      // Redirect to default route if no match
      this.navigateTo(this.defaultRoute);
    }
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }
  
  // Initialize the router
  init() {
    // If no hash on initial load and we have a default route, navigate to it
    if (!window.location.hash && this.defaultRoute) {
      this.navigateTo(this.defaultRoute);
    } else {
      this.handleRouteChange();
    }
    return this;
  }
}

// Create router instance
const router = new Router();

// Define route handlers
function setupRoutes() {
  router
    .addRoute('/home', showHomePage)
    .addRoute('/dashboard', showDashboard)
    .addRoute('/stories', showStories)
    .addRoute('/create', showCreateStory)
    .addRoute('/profile', showProfile)
    .setDefault('/home')
    .init();
}

// Route controllers
function showHomePage() {
  document.querySelector('[data-route="home"]').classList.remove('hidden');
  checkAuthStatus(); // Make sure we show login/logout buttons correctly
}

function showDashboard() {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to home if not logged in
    router.navigateTo('/');
    Swal.fire({
      icon: 'warning',
      title: 'Login Required',
      text: 'Please login to access the dashboard'
    });
    return;
  }
  
  document.querySelector('[data-route="dashboard"]').classList.remove('hidden');
  initializeDashboard(); // Make sure dashboard is properly initialized
}

function showStories() {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to home if not logged in
    router.navigateTo('/');
    Swal.fire({
      icon: 'warning',
      title: 'Login Required',
      text: 'Please login to view stories'
    });
    return;
  }
  
  document.querySelector('[data-route="stories"]').classList.remove('hidden');
  fetchStories(); // Fetch stories to display
}

function showCreateStory() {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to home if not logged in
    router.navigateTo('/');
    Swal.fire({
      icon: 'warning',
      title: 'Login Required',
      text: 'Please login to create a story'
    });
    return;
  }
  
  document.querySelector('[data-route="create"]').classList.remove('hidden');
  // Ensure map is initialized properly when this section becomes visible
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 100);
}

function showProfile() {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to home if not logged in
    router.navigateTo('/');
    Swal.fire({
      icon: 'warning',
      title: 'Login Required',
      text: 'Please login to view your profile'
    });
    return;
  }
  
  document.querySelector('[data-route="profile"]').classList.remove('hidden');
  // Load profile data if needed
}

// Export the router and setup function
export { router, setupRoutes };