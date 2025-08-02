// Enhanced Supabase Client for UNO QR Menu System
// This module provides all database operations and real-time subscriptions

class SupabaseClient {
    constructor() {
        this.client = null;
        this.subscriptions = new Map();
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.init();
    }

    // Initialize Supabase client
    async init() {
        try {
            if (typeof supabase === 'undefined') {
                throw new Error('Supabase library not loaded');
            }

            this.client = supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey,
                {
                    auth: {
                        persistSession: false
                    },
                    realtime: {
                        params: {
                            eventsPerSecond: 10
                        }
                    }
                }
            );

            this.isConnected = true;
            console.log('Supabase client initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Test connection
    async testConnection() {
        try {
            const { data, error } = await this.client
                .from('restaurant_tables')
                .select('count')
                .limit(1);

            if (error) throw error;
            return { success: true, message: 'Connection successful' };
        } catch (error) {
            console.error('Connection test failed:', error);
            return { success: false, message: error.message };
        }
    }

    // Retry mechanism for failed operations
    async withRetry(operation, context = '') {
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                console.warn(`Attempt ${attempt} failed for ${context}:`, error);
                
                if (attempt === this.maxRetries) {
                    throw error;
                }
                
                // Exponential backoff
                await new Promise(resolve => 
                    setTimeout(resolve, Math.pow(2, attempt) * 1000)
                );
            }
        }
    }

    // ==================== TABLE MANAGEMENT ====================

    // Get all restaurant tables
    async getTables() {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('restaurant_tables')
                .select('*')
                .order('table_number');

            if (error) throw error;
            return data;
        }, 'getTables');
    }

    // Get table by number
    async getTableByNumber(tableNumber) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('restaurant_tables')
                .select('*')
                .eq('table_number', tableNumber)
                .single();

            if (error) throw error;
            return data;
        }, 'getTableByNumber');
    }

    // Update table status
    async updateTableStatus(tableId, status) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('restaurant_tables')
                .update({ 
                    status, 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', tableId)
                .select()
                .single();

            if (error) throw error;
            return data;
        }, 'updateTableStatus');
    }

    // ==================== CUSTOMER SESSIONS ====================

    // Create customer session
    async createCustomerSession(tableId, customerData = {}) {
        return this.withRetry(async () => {
            const sessionToken = Utils.generateSessionToken();
            const sessionData = {
                table_id: tableId,
                session_token: sessionToken,
                customer_name: customerData.name || null,
                phone_number: customerData.phone || null,
                email: customerData.email || null,
                seat_number: customerData.seatNumber || null,
                status: 'active'
            };

            const { data, error } = await this.client
                .from('customer_sessions')
                .insert(sessionData)
                .select()
                .single();

            if (error) throw error;
            return data;
        }, 'createCustomerSession');
    }

    // Get customer session by token
    async getCustomerSession(sessionToken) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('customer_sessions')
                .select(`
                    *,
                    restaurant_tables (*)
                `)
                .eq('session_token', sessionToken)
                .eq('status', 'active')
                .single();

            if (error) throw error;
            return data;
        }, 'getCustomerSession');
    }

    // Update customer session
    async updateCustomerSession(sessionId, updates) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('customer_sessions')
                .update(updates)
                .eq('id', sessionId)
                .select()
                .single();

            if (error) throw error;
            return data;
        }, 'updateCustomerSession');
    }

    // End customer session
    async endCustomerSession(sessionId) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('customer_sessions')
                .update({ 
                    status: 'completed',
                    left_at: new Date().toISOString()
                })
                .eq('id', sessionId)
                .select()
                .single();

            if (error) throw error;
            return data;
        }, 'endCustomerSession');
    }

    // Get all customer sessions
    async getAllCustomerSessions() {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('customer_sessions')
                .select(`
                    *,
                    restaurant_tables (*)
                `)
                .order('joined_at', { ascending: false });

            if (error) throw error;
            return data;
        }, 'getAllCustomerSessions');
    }

    // Get active sessions for table
    async getActiveSessionsForTable(tableId) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('customer_sessions')
                .select('*')
                .eq('table_id', tableId)
                .eq('status', 'active')
                .order('joined_at');

            if (error) throw error;
            return data;
        }, 'getActiveSessionsForTable');
    }

    // ==================== MENU MANAGEMENT ====================

    // Get all categories
    async getCategories() {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('display_order');

            if (error) throw error;
            return data;
        }, 'getCategories');
    }

    // Get menu items by category
    async getMenuItemsByCategory(categoryId) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('menu_items')
                .select(`
                    *,
                    item_prices (*)
                `)
                .eq('category_id', categoryId)
                .eq('is_available', true)
                .order('display_order');

            if (error) throw error;
            return data;
        }, 'getMenuItemsByCategory');
    }

    // Get all menu items with prices
    async getAllMenuItems() {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('menu_items')
                .select(`
                    *,
                    categories (*),
                    item_prices (*)
                `)
                .eq('is_available', true)
                .order('display_order');

            if (error) throw error;
            return data;
        }, 'getAllMenuItems');
    }

    // Get menu item by ID
    async getMenuItem(itemId) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('menu_items')
                .select(`
                    *,
                    categories (*),
                    item_prices (*)
                `)
                .eq('id', itemId)
                .single();

            if (error) throw error;
            return data;
        }, 'getMenuItem');
    }

    // ==================== ORDER MANAGEMENT ====================

    // Create new order
    async createOrder(orderData) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('orders')
                .insert({
                    table_id: orderData.tableId,
                    customer_session_id: orderData.customerSessionId,
                    order_type: orderData.orderType || 'dine_in',
                    special_instructions: orderData.specialInstructions || null
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }, 'createOrder');
    }

    // Add items to order
    async addOrderItems(orderId, items) {
        return this.withRetry(async () => {
            const orderItems = items.map(item => ({
                order_id: orderId,
                item_id: item.itemId,
                item_price_id: item.priceId,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total_price: item.totalPrice,
                special_instructions: item.specialInstructions || null
            }));

            const { data, error } = await this.client
                .from('order_items')
                .insert(orderItems)
                .select();

            if (error) throw error;
            return data;
        }, 'addOrderItems');
    }

    // Get order with items
    async getOrderWithItems(orderId) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('orders')
                .select(`
                    *,
                    customer_sessions (*),
                    restaurant_tables (*),
                    order_items (
                        *,
                        menu_items (*),
                        item_prices (*)
                    )
                `)
                .eq('id', orderId)
                .single();

            if (error) throw error;
            return data;
        }, 'getOrderWithItems');
    }

    // Get all orders
    async getAllOrders() {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from("orders")
                .select(`
                    *,
                    customer_sessions (*),
                    restaurant_tables (*),
                    order_items (
                        *,
                        menu_items (*),
                        item_prices (*)
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        }, "getAllOrders");
    }

    // Get orders (with optional time limit)
    async getOrders(status = null, hoursLimit = null) {
        return this.withRetry(async () => {
            let query = this.client
                .from("orders")
                .select(`
                    *,
                    customer_sessions (*),
                    order_items (
                        *,
                        menu_items (*),
                        item_prices (*)
                    )
                `);

            if (status) {
                query = query.eq("status", status);
            }

            if (hoursLimit) {
                const date = new Date();
                date.setHours(date.getHours() - hoursLimit);
                query = query.gte("created_at", date.toISOString());
            }

            const { data, error } = await query.order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        }, "getOrders");
    }

    // Update order status
    async updateOrderStatus(orderId, status, completedAt = null) {
        return this.withRetry(async () => {
            const updates = { 
                status,
                updated_at: new Date().toISOString()
            };

            if (completedAt) {
                updates.completed_at = completedAt;
            }

            const { data, error } = await this.client
                .from('orders')
                .update(updates)
                .eq('id', orderId)
                .select()
                .single();

            if (error) throw error;
            return data;
        }, 'updateOrderStatus');
    }

    // Update order item status
    async updateOrderItemStatus(itemId, status) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('order_items')
                .update({ 
                    status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', itemId)
                .select()
                .single();

            if (error) throw error;
            return data;
        }, 'updateOrderItemStatus');
    }

    // ==================== ORDER MODIFICATIONS ====================

    // Create order modification request
    async createOrderModification(modificationData) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('order_modifications')
                .insert(modificationData)
                .select()
                .single();

            if (error) throw error;
            return data;
        }, 'createOrderModification');
    }

    // Get order modifications
    async getOrderModifications(orderId) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('order_modifications')
                .select(`
                    *,
                    order_items (
                        *,
                        menu_items (*)
                    )
                `)
                .eq('order_id', orderId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }, 'getOrderModifications');
    }

    // Update modification status
    async updateModificationStatus(modificationId, status, approvedBy = null) {
        return this.withRetry(async () => {
            const updates = { 
                status,
                processed_at: new Date().toISOString()
            };

            if (approvedBy) {
                updates.approved_by = approvedBy;
            }

            const { data, error } = await this.client
                .from('order_modifications')
                .update(updates)
                .eq('id', modificationId)
                .select()
                .single();

            if (error) throw error;
            return data;
        }, 'updateModificationStatus');
    }

    // ==================== QUICK ACTIONS ====================

    // Get all quick actions
    async getQuickActions() {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('quick_actions')
                .select('*')
                .eq('is_active', true)
                .order('display_order');

            if (error) throw error;
            return data;
        }, 'getQuickActions');
    }

    // Create quick action request
    async createQuickActionRequest(requestData) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('quick_action_requests')
                .insert(requestData)
                .select(`
                    *,
                    quick_actions (*),
                    restaurant_tables (*),
                    customer_sessions (*)
                `)
                .single();

            if (error) throw error;
            return data;
        }, 'createQuickActionRequest');
    }

    // Get quick action requests for table
    async getQuickActionRequestsForTable(tableId, status = null) {
        return this.withRetry(async () => {
            let query = this.client
                .from('quick_action_requests')
                .select(`
                    *,
                    quick_actions (*),
                    customer_sessions (*)
                `)
                .eq('table_id', tableId);

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }, 'getQuickActionRequestsForTable');
    }

    // Update quick action request status
    async updateQuickActionRequestStatus(requestId, status, assignedTo = null) {
        return this.withRetry(async () => {
            const updates = { status };

            if (status === 'acknowledged') {
                updates.acknowledged_at = new Date().toISOString();
            } else if (status === 'completed') {
                updates.completed_at = new Date().toISOString();
            }

            if (assignedTo) {
                updates.assigned_to = assignedTo;
            }

            const { data, error } = await this.client
                .from('quick_action_requests')
                .update(updates)
                .eq('id', requestId)
                .select()
                .single();

            if (error) throw error;
            return data;
        }, 'updateQuickActionRequestStatus');
    }

    // ==================== ANALYTICS ====================

    // Get daily analytics
    async getDailyAnalytics(date = null) {
        return this.withRetry(async () => {
            const targetDate = date || new Date().toISOString().split('T')[0];
            
            const { data, error } = await this.client
                .from('analytics_daily')
                .select('*')
                .eq('record_date', targetDate);

            if (error) throw error;
            return data;
        }, 'getDailyAnalytics');
    }

    // Get orders summary for date range
    async getOrdersSummary(startDate, endDate) {
        return this.withRetry(async () => {
            const { data, error } = await this.client
                .from('orders')
                .select('*')
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .neq('status', 'cancelled');

            if (error) throw error;
            return data;
        }, 'getOrdersSummary');
    }

    // ==================== REAL-TIME SUBSCRIPTIONS ====================

    // Subscribe to table orders
    subscribeToTableOrders(tableId, callback) {
        const subscription = this.client
            .channel(`table_orders_${tableId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders',
                filter: `table_id=eq.${tableId}`
            }, callback)
            .subscribe();

        this.subscriptions.set(`table_orders_${tableId}`, subscription);
        return subscription;
    }

    // Subscribe to order items updates
    subscribeToOrderItems(orderId, callback) {
        const subscription = this.client
            .channel(`order_items_${orderId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'order_items',
                filter: `order_id=eq.${orderId}`
            }, callback)
            .subscribe();

        this.subscriptions.set(`order_items_${orderId}`, subscription);
        return subscription;
    }

    // Subscribe to quick action requests
    subscribeToQuickActionRequests(tableId, callback) {
        const subscription = this.client
            .channel(`quick_actions_${tableId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'quick_action_requests',
                filter: `table_id=eq.${tableId}`
            }, callback)
            .subscribe();

        this.subscriptions.set(`quick_actions_${tableId}`, subscription);
        return subscription;
    }

    // Subscribe to all orders (for cashier/admin)
    subscribeToAllOrders(callback) {
        const subscription = this.client
            .channel('all_orders')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders'
            }, callback)
            .subscribe();

        this.subscriptions.set('all_orders', subscription);
        return subscription;
    }

    // Subscribe to all quick action requests (for staff)
    subscribeToAllQuickActionRequests(callback) {
        const subscription = this.client
            .channel('all_quick_actions')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'quick_action_requests'
            }, callback)
            .subscribe();

        this.subscriptions.set('all_quick_actions', subscription);
        return subscription;
    }

    // Unsubscribe from specific channel
    unsubscribe(channelKey) {
        const subscription = this.subscriptions.get(channelKey);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(channelKey);
        }
    }

    // Unsubscribe from all channels
    unsubscribeAll() {
        this.subscriptions.forEach((subscription, key) => {
            subscription.unsubscribe();
        });
        this.subscriptions.clear();
    }

    // ==================== UTILITY METHODS ====================

    // Check if client is ready
    isReady() {
        return this.isConnected && this.client !== null;
    }

    // Get client instance
    getClient() {
        return this.client;
    }
}

// Create global instance
const supabaseClient = new SupabaseClient();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SupabaseClient, supabaseClient };
}

