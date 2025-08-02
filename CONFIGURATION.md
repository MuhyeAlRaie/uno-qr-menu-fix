# Configuration Guide - UNO Enhanced QR Menu System

## Overview

This guide covers all configuration options available in the UNO Enhanced QR Menu System. The system is designed to be highly customizable while maintaining ease of use.

## Configuration Files

### Primary Configuration: `config.js`

This is the main configuration file that controls all aspects of the application.

```javascript
// Supabase Database Configuration
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};

// Application Configuration
const APP_CONFIG = {
    // Restaurant Information
    restaurantName: {
        en: 'UNO Restaurant & Café',
        ar: 'مطعم وكافيه أونو'
    },
    
    restaurantDescription: {
        en: 'Experience seamless dining with our advanced table ordering system',
        ar: 'استمتع بتجربة طعام سلسة مع نظام طلب الطاولات المتقدم'
    },
    
    // System Settings
    defaultLanguage: 'ar',
    supportedLanguages: ['ar', 'en'],
    
    // Feature Toggles
    features: {
        enableSoundAlerts: true,
        enablePushNotifications: true,
        enableOrderModification: true,
        enableQuickActions: true,
        enableAnalytics: true,
        enableMultiplePaymentMethods: true
    },
    
    // Order Management
    orderSettings: {
        allowOrderModification: true,
        modificationTimeLimit: 300, // 5 minutes in seconds
        autoConfirmOrders: false,
        requireApprovalForChanges: true,
        maxItemsPerOrder: 50,
        maxOrderValue: 1000 // in local currency
    },
    
    // Session Management
    sessionSettings: {
        maxSessionDuration: 14400, // 4 hours in seconds
        cleanupInterval: 3600, // 1 hour in seconds
        maxCustomersPerTable: 10,
        requireCustomerName: true,
        allowAnonymousSessions: false
    },
    
    // UI/UX Settings
    uiSettings: {
        theme: 'default',
        showPricesInMenu: true,
        showItemImages: true,
        enableItemSearch: true,
        itemsPerPage: 20,
        enableInfiniteScroll: true
    },
    
    // Notification Settings
    notifications: {
        newOrderSound: 'notification-new-order.mp3',
        statusUpdateSound: 'notification-status.mp3',
        quickActionSound: 'notification-quick-action.mp3',
        soundVolume: 0.7,
        showBrowserNotifications: true,
        notificationDuration: 5000 // 5 seconds
    },
    
    // Localized Status Labels
    orderStatuses: {
        pending: { en: 'Pending', ar: 'في الانتظار' },
        confirmed: { en: 'Confirmed', ar: 'مؤكد' },
        preparing: { en: 'Preparing', ar: 'قيد التحضير' },
        ready: { en: 'Ready', ar: 'جاهز' },
        served: { en: 'Served', ar: 'تم التقديم' },
        cancelled: { en: 'Cancelled', ar: 'ملغي' }
    },
    
    tableStatuses: {
        available: { en: 'Available', ar: 'متاح' },
        occupied: { en: 'Occupied', ar: 'مشغول' },
        reserved: { en: 'Reserved', ar: 'محجوز' },
        cleaning: { en: 'Cleaning', ar: 'قيد التنظيف' }
    }
};
```

## Detailed Configuration Options

### 1. Restaurant Information

#### Basic Information
```javascript
restaurantName: {
    en: 'Your Restaurant Name',
    ar: 'اسم مطعمك'
},

restaurantDescription: {
    en: 'Your restaurant description',
    ar: 'وصف مطعمك'
},

contactInfo: {
    phone: '+1234567890',
    email: 'info@yourrestaurant.com',
    address: {
        en: 'Your Address',
        ar: 'عنوانك'
    }
}
```

#### Branding
```javascript
branding: {
    logoUrl: '/assets/logo.png',
    faviconUrl: '/assets/favicon.ico',
    primaryColor: '#dc2626',
    secondaryColor: '#059669',
    accentColor: '#f59e0b'
}
```

### 2. Language and Localization

#### Language Settings
```javascript
defaultLanguage: 'ar', // 'ar' or 'en'
supportedLanguages: ['ar', 'en'],
rtlLanguages: ['ar'],

// Date and time formatting
dateTimeFormat: {
    ar: {
        date: 'DD/MM/YYYY',
        time: 'HH:mm',
        dateTime: 'DD/MM/YYYY HH:mm'
    },
    en: {
        date: 'MM/DD/YYYY',
        time: 'hh:mm A',
        dateTime: 'MM/DD/YYYY hh:mm A'
    }
},

// Currency formatting
currency: {
    symbol: 'ر.س',
    position: 'after', // 'before' or 'after'
    decimals: 2
}
```

### 3. Feature Configuration

#### Core Features
```javascript
features: {
    // Order Management
    enableSoundAlerts: true,
    enablePushNotifications: true,
    enableOrderModification: true,
    enableQuickActions: true,
    
    // Analytics and Reporting
    enableAnalytics: true,
    enableReporting: true,
    
    // Payment Options
    enableMultiplePaymentMethods: true,
    enableOnlinePayment: false,
    
    // Advanced Features
    enableLoyaltyProgram: false,
    enableInventoryTracking: false,
    enableKitchenDisplay: false
}
```

#### Order Management
```javascript
orderSettings: {
    // Order Modification
    allowOrderModification: true,
    modificationTimeLimit: 300, // seconds
    requireApprovalForChanges: true,
    
    // Order Limits
    maxItemsPerOrder: 50,
    maxOrderValue: 1000,
    minOrderValue: 10,
    
    // Auto-processing
    autoConfirmOrders: false,
    autoConfirmDelay: 120, // seconds
    
    // Special Instructions
    allowSpecialInstructions: true,
    maxInstructionLength: 200
}
```

### 4. Session Management

#### Session Configuration
```javascript
sessionSettings: {
    // Duration Settings
    maxSessionDuration: 14400, // 4 hours
    sessionWarningTime: 1800, // 30 minutes before expiry
    cleanupInterval: 3600, // 1 hour
    
    // Customer Limits
    maxCustomersPerTable: 10,
    requireCustomerName: true,
    allowAnonymousSessions: false,
    
    // Session Persistence
    persistSessions: true,
    sessionStorageKey: 'uno_customer_session'
}
```

### 5. User Interface Settings

#### UI Configuration
```javascript
uiSettings: {
    // Theme and Appearance
    theme: 'default', // 'default', 'dark', 'light'
    showPricesInMenu: true,
    showItemImages: true,
    showItemDescriptions: true,
    
    // Navigation and Search
    enableItemSearch: true,
    enableCategoryFilter: true,
    itemsPerPage: 20,
    enableInfiniteScroll: true,
    
    // Mobile Optimization
    enableSwipeGestures: true,
    enablePullToRefresh: true,
    showMobileOptimizedLayout: true
}
```

### 6. Notification Settings

#### Sound Configuration
```javascript
notifications: {
    // Sound Settings
    enableSounds: true,
    soundVolume: 0.7,
    sounds: {
        newOrder: '/assets/sounds/new-order.mp3',
        statusUpdate: '/assets/sounds/status-update.mp3',
        quickAction: '/assets/sounds/quick-action.mp3',
        error: '/assets/sounds/error.mp3'
    },
    
    // Visual Notifications
    showBrowserNotifications: true,
    showToastNotifications: true,
    notificationDuration: 5000,
    
    // Real-time Updates
    enableRealTimeUpdates: true,
    updateInterval: 1000, // milliseconds
    reconnectAttempts: 5
}
```

### 7. Security Settings

#### Security Configuration
```javascript
security: {
    // Session Security
    enableSessionEncryption: true,
    sessionTimeout: 3600, // 1 hour
    
    // Input Validation
    enableInputSanitization: true,
    maxInputLength: 1000,
    
    // Rate Limiting
    enableRateLimiting: true,
    maxRequestsPerMinute: 60,
    
    // CORS Settings
    allowedOrigins: ['https://yourdomain.com'],
    enableCORS: true
}
```

## Environment-Specific Configuration

### Development Environment
```javascript
const DEV_CONFIG = {
    debug: true,
    enableLogging: true,
    showDebugInfo: true,
    mockData: false,
    testMode: false
};
```

### Production Environment
```javascript
const PROD_CONFIG = {
    debug: false,
    enableLogging: false,
    showDebugInfo: false,
    mockData: false,
    testMode: false,
    enableAnalytics: true,
    enableErrorReporting: true
};
```

## Database Configuration

### Supabase Settings
```javascript
const SUPABASE_CONFIG = {
    url: process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL',
    anonKey: process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY',
    
    // Connection Settings
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    },
    
    // Real-time Settings
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
};
```

## Advanced Configuration

### Custom CSS Variables
```css
:root {
    /* Brand Colors */
    --primary-color: #dc2626;
    --secondary-color: #059669;
    --accent-color: #f59e0b;
    --neutral-color: #374151;
    
    /* Background Colors */
    --background-color: #f9fafb;
    --surface-color: #ffffff;
    
    /* Text Colors */
    --text-primary: #111827;
    --text-secondary: #6b7280;
    
    /* Border and Shadow */
    --border-color: #e5e7eb;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    
    /* Typography */
    --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    /* Border Radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
}
```

## Configuration Best Practices

### 1. Security
- Never commit sensitive credentials to version control
- Use environment variables for production secrets
- Regularly rotate API keys and passwords
- Enable Row Level Security in Supabase

### 2. Performance
- Enable caching for static content
- Optimize image sizes and formats
- Use CDN for global content delivery
- Monitor and optimize database queries

### 3. Maintenance
- Document all configuration changes
- Test configuration changes in staging first
- Keep backup of working configurations
- Monitor system performance after changes

### 4. Scalability
- Plan for increased load and users
- Configure appropriate connection limits
- Set up monitoring and alerting
- Design for horizontal scaling

## Troubleshooting Configuration Issues

### Common Problems

1. **Invalid Supabase Credentials**
   - Verify URL and API key are correct
   - Check project is active in Supabase
   - Ensure RLS policies are configured

2. **Language Display Issues**
   - Check language codes are correct ('ar', 'en')
   - Verify all text has translations
   - Ensure RTL CSS is loaded for Arabic

3. **Real-time Not Working**
   - Enable replication in Supabase
   - Check WebSocket connectivity
   - Verify subscription configuration

4. **Performance Issues**
   - Review caching settings
   - Optimize database queries
   - Check image sizes and compression

### Configuration Testing

Use the built-in test page (`test-connection.html`) to validate:
- Database connectivity
- Real-time subscriptions
- Configuration values
- Feature functionality

---

This configuration guide provides comprehensive control over all aspects of the UNO Enhanced QR Menu System. Adjust settings based on your specific requirements and regularly review and optimize for best performance.

