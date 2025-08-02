// Enhanced Configuration file for UNO QR Menu System

// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://ihldevmojpxjxkgivppb.supabase.co', // Replace with actual Supabase URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobGRldm1vanB4anhrZ2l2cHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTA4NDksImV4cCI6MjA2OTcyNjg0OX0.b8MwkDKkPdgGZzs5BQVUu4UUk-fylc9KjwfMPABMeqk' // Replace with actual Supabase anon key
};

// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
    cloudName: 'dezvuqqrl',
    uploadPreset: 'unsigned_preset'
};

// Application Settings
const APP_CONFIG = {
    defaultLanguage: 'ar',
    supportedLanguages: ['en', 'ar'],
    soundAlerts: {
        newOrder: 'assets/sounds/new-order.mp3',
        quickAction: 'assets/sounds/quick-action.mp3',
        orderUpdate: 'assets/sounds/order-update.mp3',
        notification: 'assets/sounds/notification.mp3'
    },
    orderStatuses: {
        pending: { en: 'Pending', ar: 'في الانتظار', color: '#fbbf24' },
        confirmed: { en: 'Confirmed', ar: 'مؤكد', color: '#3b82f6' },
        preparing: { en: 'Preparing', ar: 'قيد التحضير', color: '#f59e0b' },
        ready: { en: 'Ready', ar: 'جاهز', color: '#10b981' },
        served: { en: 'Served', ar: 'تم التقديم', color: '#059669' },
        cancelled: { en: 'Cancelled', ar: 'ملغي', color: '#ef4444' }
    },
    quickActionStatuses: {
        pending: { en: 'Pending', ar: 'في الانتظار', color: '#fbbf24' },
        acknowledged: { en: 'Acknowledged', ar: 'تم الاستلام', color: '#3b82f6' },
        in_progress: { en: 'In Progress', ar: 'قيد التنفيذ', color: '#f59e0b' },
        completed: { en: 'Completed', ar: 'مكتمل', color: '#10b981' },
        cancelled: { en: 'Cancelled', ar: 'ملغي', color: '#ef4444' }
    },
    tableStatuses: {
        available: { en: 'Available', ar: 'متاح', color: '#10b981' },
        occupied: { en: 'Occupied', ar: 'مشغول', color: '#f59e0b' },
        reserved: { en: 'Reserved', ar: 'محجوز', color: '#3b82f6' },
        cleaning: { en: 'Cleaning', ar: 'تنظيف', color: '#6b7280' }
    },
    sessionStatuses: {
        active: { en: 'Active', ar: 'نشط', color: '#10b981' },
        completed: { en: 'Completed', ar: 'مكتمل', color: '#6b7280' },
        abandoned: { en: 'Abandoned', ar: 'متروك', color: '#ef4444' }
    },
    currency: {
        symbol: 'JOR',
        position: 'after', // 'before' or 'after'
        decimals: 2
    },
    taxation: {
        taxRate: 0.00, // 0% VAT
        serviceChargeRate: 0.10, // 10% service charge
        includeServiceCharge: true // Include service charge in totals
    },
    features: {
        enableCustomerSessions: true,
        enableOrderModifications: true,
        enableRealTimeUpdates: true,
        enableSoundAlerts: true,
        enableCustomerFeedback: true,
        enableAnalytics: true,
        enableMultiLanguage: true,
        enablePWA: true
    },
    ui: {
        theme: {
            primary: '#dc2626', // Red
            secondary: '#059669', // Green
            accent: '#f59e0b', // Amber
            neutral: '#374151', // Gray
            background: '#f9fafb',
            surface: '#ffffff'
        },
        animations: {
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        breakpoints: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px'
        }
    },
    api: {
        timeout: 10000, // 10 seconds
        retryAttempts: 3,
        retryDelay: 1000 // 1 second
    }
};

// Utility functions
const Utils = {
    // Generate unique session token
    generateSessionToken() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Format currency
    formatCurrency(amount) {
        const formatted = parseFloat(amount).toFixed(APP_CONFIG.currency.decimals);
        return APP_CONFIG.currency.position === 'before' 
            ? `${APP_CONFIG.currency.symbol} ${formatted}`
            : `${formatted} ${APP_CONFIG.currency.symbol}`;
    },

    // Get current language
    getCurrentLanguage() {
        return localStorage.getItem('language') || APP_CONFIG.defaultLanguage;
    },

    // Set language
    setLanguage(lang) {
        if (APP_CONFIG.supportedLanguages.includes(lang)) {
            localStorage.setItem('language', lang);
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
            return true;
        }
        return false;
    },

    // Get localized text
    getLocalizedText(textObj) {
        const lang = this.getCurrentLanguage();
        return textObj[lang] || textObj[APP_CONFIG.defaultLanguage] || '';
    },

    // Format date/time
    formatDateTime(dateTime, options = {}) {
        const lang = this.getCurrentLanguage();
        const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
        return new Date(dateTime).toLocaleString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        });
    },

    // Get URL parameters
    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return Object.fromEntries(params.entries());
    },

    // Show toast notification
    showToast(message, type = 'info', duration = 3000) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} position-fixed top-0 end-0 m-3`;
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">${type === 'error' ? 'خطأ' : type === 'success' ? 'نجح' : 'إشعار'}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">${message}</div>
        `;

        document.body.appendChild(toast);
        
        // Initialize Bootstrap toast
        const bsToast = new bootstrap.Toast(toast, { delay: duration });
        bsToast.show();

        // Remove toast after it's hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    },

    // Play sound alert
    playSound(soundKey) {
        if (!APP_CONFIG.features.enableSoundAlerts) return;
        
        const soundFile = APP_CONFIG.soundAlerts[soundKey];
        if (soundFile) {
            const audio = new Audio(soundFile);
            audio.volume = 0.5;
            audio.play().catch(console.error);
        }
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Calculate order totals
    calculateOrderTotals(subtotal) {
        const taxAmount = subtotal * APP_CONFIG.taxation.taxRate;
        const serviceCharge = APP_CONFIG.taxation.includeServiceCharge 
            ? subtotal * APP_CONFIG.taxation.serviceChargeRate 
            : 0;
        const total = subtotal + taxAmount + serviceCharge;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            serviceCharge: parseFloat(serviceCharge.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
    }
};

// Export configurations for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, CLOUDINARY_CONFIG, APP_CONFIG, Utils };
}

