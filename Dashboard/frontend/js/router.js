// ============================================================
// router.js — Client-Side Router
// ============================================================
// Hash-based routing for single-page navigation
// ============================================================

const Router = {
    routes: {},
    currentRoute: '/',

    init() {
        // Register routes
        this.addRoute('/', () => renderHomePage());
        this.addRoute('/pipeline', () => renderPipelinePage());
        this.addRoute('/analytics', () => renderAnalyticsPage());

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());

        // Handle initial route
        this.handleRoute();
    },

    addRoute(path, handler) {
        this.routes[path] = handler;
    },

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        this.currentRoute = hash;

        // Update active nav links
        this.updateActiveLinks();

        // Execute route handler
        const handler = this.routes[hash];
        if (handler) {
            handler();
        } else {
            // Default to home
            this.navigate('/');
        }
    },

    navigate(path) {
        window.location.hash = path;
    },

    updateActiveLinks() {
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${this.currentRoute}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
};
