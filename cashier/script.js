// UNO Restaurant & Café - Cashier Dashboard Script

class CashierApp {
    constructor() {
        this.orders = [];
        this.quickActionRequests = [];
        this.currentOrderId = null;
        this.currentTableNumber = null;
        this.currentFilter = 'all';
        this.currentLanguage = 'ar';
        this.soundEnabled = true;
        this.refreshInterval = null;
        this.tableStatuses = new Map();
        this.audioContext = null;
        this.audioLoopInterval = null;
        this.pendingAudio = null;
        this.quickActionAudio = null;
        this.isAudioLoopActive = false;
        
        this.init();
    }

    async init() {
        this.showLoading(true);
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize audio
            this.initializeAudio();
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
            // Load initial data (last 8 hours only)
            await this.loadData();
            
            // Setup language
            this.updateLanguage();
            
            // Start clock
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
        } catch (error) {
            console.error('Error initializing cashier app:', error);
            this.showError('Failed to load dashboard data. Please refresh the page.');
        } finally {
            this.showLoading(false);
        }
    }

    initializeAudio() {
        try {
            // Create audio elements for sound alerts
            this.pendingAudio = new Audio('new-order.mp3');
            this.quickActionAudio = new Audio('quick-action.mp3');
            
            // Set audio properties
            this.pendingAudio.loop = false;
            this.quickActionAudio.loop = false;
            this.pendingAudio.volume = 0.7;
            this.quickActionAudio.volume = 0.7;
            
            // Preload audio files
            this.pendingAudio.preload = 'auto';
            this.quickActionAudio.preload = 'auto';
            
        } catch (error) {
            console.error('Error initializing audio:', error);
        }
    }

    setupEventListeners() {
        // Language toggle
        document.getElementById('langToggle').addEventListener('click', () => {
            this.toggleLanguage();
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadData();
        });

        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });

        // Order filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.status);
            });
        });

        // Print receipt buttons (delegated event handling)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('print-receipt') || e.target.closest('.print-receipt')) {
                const orderId = e.target.dataset.orderId || e.target.closest('.print-receipt').dataset.orderId;
                if (orderId) {
                    this.printReceipt(orderId);
                }
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.loadData();
                        break;
                    case 's':
                        e.preventDefault();
                        this.toggleSound();
                        break;
                    case 'p':
                        e.preventDefault();
                        if (this.currentOrderId) {
                            this.printReceipt(this.currentOrderId);
                        }
                        break;
                }
            }
        });
    }

    async loadData() {
        try {
            this.showLoading(true);
            
            // Load orders from last 8 hours only
            this.orders = await DatabaseAPI.getOrders(null, 8);
            
            // Load quick action requests
            this.quickActionRequests = await DatabaseAPI.getQuickActionRequests();
            
            // Check for pending items and manage audio loop
            this.checkPendingItemsAndManageAudio();
            
            // Render all components
            this.renderOrders();
            this.renderQuickActions();
            this.updateStatistics();
            this.updateTableStatuses();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Failed to load data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    checkPendingItemsAndManageAudio() {
        const pendingOrders = this.orders.filter(order => order.status === 'pending');
        const pendingQuickActions = this.quickActionRequests.filter(req => req.status === 'pending');
        
        const hasPendingItems = pendingOrders.length > 0 || pendingQuickActions.length > 0;
        
        if (hasPendingItems && !this.isAudioLoopActive && this.soundEnabled) {
            this.startAudioLoop();
        } else if (!hasPendingItems && this.isAudioLoopActive) {
            this.stopAudioLoop();
        }
    }

    startAudioLoop() {
        if (this.isAudioLoopActive || !this.soundEnabled) return;
        
        this.isAudioLoopActive = true;
        
        // Play audio every 10 seconds for pending items
        this.audioLoopInterval = setInterval(() => {
            if (this.soundEnabled) {
                const pendingOrders = this.orders.filter(order => order.status === 'pending');
                const pendingQuickActions = this.quickActionRequests.filter(req => req.status === 'pending');
                
                if (pendingOrders.length > 0) {
                    this.playSound('newOrder');
                }
                
                if (pendingQuickActions.length > 0) {
                    // Play quick action sound 1 second after order sound
                    setTimeout(() => {
                        if (this.soundEnabled) {
                            this.playSound('quickAction');
                        }
                    }, 1000);
                }
            }
        }, 10000); // Every 10 seconds
        
        // Play initial sound
        setTimeout(() => {
            const pendingOrders = this.orders.filter(order => order.status === 'pending');
            const pendingQuickActions = this.quickActionRequests.filter(req => req.status === 'pending');
            
            if (pendingOrders.length > 0 && this.soundEnabled) {
                this.playSound('newOrder');
            }
            
            if (pendingQuickActions.length > 0 && this.soundEnabled) {
                setTimeout(() => {
                    if (this.soundEnabled) {
                        this.playSound('quickAction');
                    }
                }, 1000);
            }
        }, 500);
    }

    stopAudioLoop() {
        if (!this.isAudioLoopActive) return;
        
        this.isAudioLoopActive = false;
        
        if (this.audioLoopInterval) {
            clearInterval(this.audioLoopInterval);
            this.audioLoopInterval = null;
        }
    }

    startRealTimeUpdates() {
        // Subscribe to orders table changes
        supabaseClient
            .channel('orders-changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => this.handleOrderChange(payload)
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'order_items' },
                (payload) => this.handleOrderItemChange(payload)
            )
            .subscribe();

        // Subscribe to quick action requests changes
        supabaseClient
            .channel('quick-actions-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'quick_action_requests' },
                (payload) => this.handleQuickActionChange(payload)
            )
            .subscribe();
    }

    handleOrderChange(payload) {
        console.log('Order change:', payload);
        
        if (payload.eventType === 'INSERT') {
            // New order - play sound and show notification
            this.playSound('newOrder');
            this.showToast('New order received!', 'success', 'new-order');
        } else if (payload.eventType === 'UPDATE') {
            // Order status changed - might need to stop audio loop
            this.showToast('Order status updated', 'info');
        }
        
        // Reload data to get updated information
        this.loadData();
    }

    handleOrderItemChange(payload) {
        console.log('Order item change:', payload);
        // Reload data when order items change
        this.loadData();
    }

    handleQuickActionChange(payload) {
        console.log('Quick action change:', payload);
        
        if (payload.eventType === 'INSERT') {
            // New quick action request - play sound and show notification
            this.playSound('quickAction');
            this.showToast('New quick action request!', 'info', 'quick-action');
        } else if (payload.eventType === 'UPDATE') {
            // Quick action status changed - might need to stop audio loop
            this.showToast('Quick action updated', 'info');
        }
        
        // Reload data to get updated information
        this.loadData();
    }

    renderOrders() {
        const container = document.getElementById('ordersGrid');
        container.innerHTML = '';

        let filteredOrders = this.orders;
        if (this.currentFilter !== 'all') {
            filteredOrders = this.orders.filter(order => order.status === this.currentFilter);
        }

        if (filteredOrders.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No orders found</h5>
                    <p class="text-muted">Orders from the last 8 hours will appear here when customers place them.</p>
                </div>
            `;
            return;
        }

        filteredOrders.forEach((order, index) => {
            const orderCard = this.createOrderCard(order);
            container.appendChild(orderCard);
            
            // Add animation delay
            setTimeout(() => {
                orderCard.classList.add('fade-in');
            }, index * 100);
        });
    }

    createOrderCard(order) {
        const card = document.createElement('div');
        card.className = `order-card ${order.status}`;
        
        const orderTime = new Date(order.order_time).toLocaleTimeString();
        const orderItems = order.order_items || [];
        
        // Calculate total with tax
        let total = 0;
        if (order.total) {
            total = parseFloat(order.total);
        } else if (orderItems.length > 0) {
            // Fallback calculation
            let subtotal = 0;
            orderItems.forEach(item => {
                const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                subtotal += price * item.quantity;
            });
            total = subtotal * 1.10; // Add 10% tax
        }

        card.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-table">Table ${order.table_number}</div>
                    <div class="order-time">${orderTime}</div>
                </div>
                <div class="order-actions">
                    <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span>
                    <button class="btn btn-sm btn-outline-primary print-receipt" data-order-id="${order.id}" title="Print Receipt">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </div>
            
            <div class="order-items">
                ${orderItems.slice(0, 3).map(item => `
                    <div class="order-item">
                        <span class="item-name">${item.menu_item ? item.menu_item.name_en : 'Unknown Item'}</span>
                        <span class="item-quantity">×${item.quantity}</span>
                        <span class="item-price">$${(parseFloat(item.item_price?.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                ${orderItems.length > 3 ? `<div class="text-muted small">+${orderItems.length - 3} more items</div>` : ''}
            </div>
            
            <div class="order-total">
                <span>Total (incl. tax):</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        `;

        card.addEventListener('click', (e) => {
            // Don't trigger modal if print button was clicked
            if (!e.target.closest('.print-receipt')) {
                this.showOrderModal(order);
            }
        });

        return card;
    }

    renderQuickActions() {
        const container = document.getElementById('quickActionsList');
        const badge = document.getElementById('quickActionsBadge');
        
        const pendingRequests = this.quickActionRequests.filter(req => req.status === 'pending');
        
        // Update badge
        if (pendingRequests.length > 0) {
            badge.textContent = pendingRequests.length;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }

        container.innerHTML = '';

        if (this.quickActionRequests.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-bolt fa-2x text-muted mb-2"></i>
                    <p class="text-muted">No quick action requests</p>
                </div>
            `;
            return;
        }

        this.quickActionRequests.forEach((request, index) => {
            const requestItem = this.createQuickActionItem(request);
            container.appendChild(requestItem);
            
            // Add animation delay
            setTimeout(() => {
                requestItem.classList.add('slide-in-right');
            }, index * 50);
        });
    }

    createQuickActionItem(request) {
        const item = document.createElement('div');
        item.className = `quick-action-item ${request.status}`;
        
        const requestTime = new Date(request.request_time).toLocaleTimeString();
        const actionText = request.quick_action ? request.quick_action.action_en : 'Unknown Action';

        item.innerHTML = `
            <div class="action-info">
                <div class="action-table">Table ${request.table_number}</div>
                <div class="action-text">${actionText}</div>
                <div class="action-time">${requestTime}</div>
            </div>
            <div class="action-controls">
                ${request.status === 'pending' ? `
                    <button class="action-btn complete" onclick="cashierApp.completeQuickAction('${request.id}')">
                        <i class="fas fa-check"></i> Complete
                    </button>
                ` : `
                    <span class="badge bg-success">Completed</span>
                `}
            </div>
        `;

        return item;
    }

    updateStatistics() {
        const today = new Date().toDateString();
        const todayOrders = this.orders.filter(order => 
            new Date(order.order_time).toDateString() === today
        );

        const totalOrders = todayOrders.length;
        const completedOrders = todayOrders.filter(order => order.status === 'completed').length;
        const pendingOrders = todayOrders.filter(order => order.status === 'pending').length;

        // Calculate revenue with tax
        let totalRevenue = 0;
        todayOrders.forEach(order => {
            if (order.total) {
                totalRevenue += parseFloat(order.total);
            } else if (order.order_items) {
                // Fallback calculation
                let subtotal = 0;
                order.order_items.forEach(item => {
                    const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                    subtotal += price * item.quantity;
                });
                totalRevenue += subtotal * 1.10; // Add 10% tax
            }
        });

        // Update DOM
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('completedOrders').textContent = completedOrders;
        document.getElementById('pendingOrders').textContent = pendingOrders;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    }

    updateTableStatuses() {
        const container = document.getElementById('tablesGrid');
        container.innerHTML = '';

        // Generate table status based on active orders
        const activeTables = new Set();
        this.orders.forEach(order => {
            if (order.status !== 'completed' && order.status !== 'cancelled') {
                activeTables.add(order.table_number);
            }
        });

        // Create table items (assuming tables 1-40)
        for (let i = 20; i <= 40; i++) {
            const tableItem = document.createElement('div');
            const status = activeTables.has(i.toString()) ? 'occupied' : 'available';
            
            tableItem.className = `table-item ${status}`;
            tableItem.innerHTML = `
                <div class="table-number">${i}</div>
                <div class="table-status">${status}</div>
            `;

            tableItem.addEventListener('click', () => {
                this.showTableModal(i.toString(), status);
            });

            container.appendChild(tableItem);
        }
    }

    showOrderModal(order) {
        this.currentOrderId = order.id;
        
        const modal = new bootstrap.Modal(document.getElementById('orderModal'));
        
        // Populate modal content
        document.getElementById('modalTableNumber').textContent = order.table_number;
        document.getElementById('modalOrderTime').textContent = new Date(order.order_time).toLocaleString();
        
        const statusBadge = document.getElementById('modalOrderStatus');
        statusBadge.textContent = this.getStatusText(order.status);
        statusBadge.className = `badge bg-${this.getStatusColor(order.status)}`;
        
        // Populate order items
        const itemsContainer = document.getElementById('modalOrderItems');
        itemsContainer.innerHTML = '';
        
        let subtotal = 0;
        if (order.order_items) {
            order.order_items.forEach(item => {
                const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                const itemTotal = price * item.quantity;
                subtotal += itemTotal;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.menu_item ? item.menu_item.name_en : 'Unknown Item'}</td>
                    <td>${item.item_price ? item.item_price.size_en : 'N/A'}</td>
                    <td>${item.quantity}</td>
                    <td>$${price.toFixed(2)}</td>
                    <td>$${itemTotal.toFixed(2)}</td>
                    <td>${item.notes || '-'}</td>
                `;
                itemsContainer.appendChild(row);
            });
        }
        
        // Calculate tax and total
        const tax = subtotal * 0.10;
        const total = subtotal + tax;
        
        document.getElementById('modalOrderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('modalOrderTax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('modalOrderTotal').textContent = `$${total.toFixed(2)}`;
        
        modal.show();
    }

    showTableModal(tableNumber, status) {
        this.currentTableNumber = tableNumber;
        
        const modal = new bootstrap.Modal(document.getElementById('tableModal'));
        
        // Populate modal content
        document.getElementById('modalTableNum').textContent = tableNumber;
        
        const statusBadge = document.getElementById('modalTableStatus');
        statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusBadge.className = `badge bg-${status === 'available' ? 'success' : status === 'occupied' ? 'danger' : 'warning'}`;
        
        // Find current order for this table
        const currentOrder = this.orders.find(order => 
            order.table_number === tableNumber && 
            order.status !== 'completed' && 
            order.status !== 'cancelled'
        );
        
        document.getElementById('modalTableOrder').textContent = currentOrder ? 
            `Order #${currentOrder.id.substring(0, 8)}` : 'No active order';
        
        modal.show();
    }

    printReceipt(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            this.showToast('Order not found', 'error');
            return;
        }

        // Create receipt content
        let receiptContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - Order #${order.id.substring(0, 8)}</title>
                <style>
                    body { 
                        font-family: 'Courier New', monospace; 
                        max-width: 300px; 
                        margin: 0 auto; 
                        padding: 20px;
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    .header { text-align: center; margin-bottom: 20px; }
                    .restaurant-name { font-size: 18px; font-weight: bold; }
                    .order-info { margin: 15px 0; }
                    .items { margin: 15px 0; }
                    .item { display: flex; justify-content: space-between; margin: 5px 0; }
                    .totals { margin-top: 15px; border-top: 1px dashed #000; padding-top: 10px; }
                    .total-line { display: flex; justify-content: space-between; margin: 3px 0; }
                    .final-total { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 10px; }
                    @media print {
                        body { margin: 0; padding: 10px; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="restaurant-name">UNO Restaurant & Café</div>
                    <div>Receipt</div>
                </div>
                
                <div class="order-info">
                    <div>Order #: ${order.id.substring(0, 8)}</div>
                    <div>Table: ${order.table_number}</div>
                    <div>Date: ${new Date(order.order_time).toLocaleDateString()}</div>
                    <div>Time: ${new Date(order.order_time).toLocaleTimeString()}</div>
                    ${order.number_of_people ? `<div>People: ${order.number_of_people}</div>` : ''}
                </div>
                
                <div class="items">
        `;

        let subtotal = 0;
        if (order.order_items) {
            order.order_items.forEach(item => {
                const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                const itemTotal = price * item.quantity;
                subtotal += itemTotal;
                
                const itemName = item.menu_item ? item.menu_item.name_en : 'Unknown Item';
                const sizeName = item.item_price ? item.item_price.size_en : '';
                
                receiptContent += `
                    <div class="item">
                        <div>${itemName} ${sizeName ? `(${sizeName})` : ''}</div>
                        <div></div>
                    </div>
                    <div class="item">
                        <div>${item.quantity} x $${price.toFixed(2)}</div>
                        <div>$${itemTotal.toFixed(2)}</div>
                    </div>
                `;
                
                if (item.notes) {
                    receiptContent += `<div style="font-style: italic; margin-left: 10px;">Note: ${item.notes}</div>`;
                }
            });
        }

        const tax = subtotal * 0.10;
        const total = subtotal + tax;

        receiptContent += `
                </div>
                
                <div class="totals">
                    <div class="total-line">
                        <span>Subtotal:</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-line">
                        <span>Tax (10%):</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <div class="total-line final-total">
                        <span>Total:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <div>Thank you for dining with us!</div>
                    <div>Status: ${this.getStatusText(order.status)}</div>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    }
                </script>
            </body>
            </html>
        `;

        // Open receipt in new tab
        const printWindow = window.open('', '_blank');
        printWindow.document.write(receiptContent);
        printWindow.document.close();
    }

    async updateOrderStatus(orderId, status) {
        try {
            this.showLoading(true);
            
            await DatabaseAPI.updateOrderStatus(orderId, status);
            
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
            
            // Reload data
            await this.loadData();
            
            this.showToast(`Order status updated to ${this.getStatusText(status)}`, 'success');
            
        } catch (error) {
            console.error('Error updating order status:', error);
            this.showToast('Failed to update order status', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async completeQuickAction(requestId) {
        try {
            await DatabaseAPI.updateQuickActionRequestStatus(requestId, 'completed');
            
            // Reload data
            await this.loadData();
            
            this.showToast('Quick action completed', 'success');
            
        } catch (error) {
            console.error('Error completing quick action:', error);
            this.showToast('Failed to complete quick action', 'error');
        }
    }

    playSound(type) {
        if (!this.soundEnabled) return;
        
        try {
            if (type === 'newOrder' && this.pendingAudio) {
                this.pendingAudio.currentTime = 0;
                this.pendingAudio.play().catch(e => console.log('Audio play failed:', e));
            } else if (type === 'quickAction' && this.quickActionAudio) {
                this.quickActionAudio.currentTime = 0;
                this.quickActionAudio.play().catch(e => console.log('Audio play failed:', e));
            }
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        
        const soundToggle = document.getElementById('soundToggle');
        const icon = soundToggle.querySelector('i');
        const text = soundToggle.querySelector('span');
        
        if (this.soundEnabled) {
            icon.className = 'fas fa-volume-up';
            soundToggle.classList.remove('btn-outline-danger');
            soundToggle.classList.add('btn-outline-success');
            text.textContent = this.currentLanguage === 'ar' ? 'الصوت: مفعل' : 'Sound: ON';
            this.showToast(this.currentLanguage === 'ar' ? 'تم تفعيل تنبيهات الصوت' : 'Sound alerts enabled', 'success');
            
            // Restart audio loop if there are pending items
            this.checkPendingItemsAndManageAudio();
        } else {
            icon.className = 'fas fa-volume-mute';
            soundToggle.classList.remove('btn-outline-success');
            soundToggle.classList.add('btn-outline-danger');
            text.textContent = this.currentLanguage === 'ar' ? 'الصوت: معطل' : 'Sound: OFF';
            this.showToast(this.currentLanguage === 'ar' ? 'تم إلغاء تفعيل تنبيهات الصوت' : 'Sound alerts disabled', 'warning');
            
            // Stop audio loop
            this.stopAudioLoop();
        }
    }

    // Language functions
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        this.updateLanguage();
        
        // Re-render all components to update content
        this.renderOrders();
        this.renderQuickActions();
        this.updateStatistics();
    }

    updateLanguage() {
        const langToggle = document.getElementById('langToggle');
        const langText = document.getElementById('langText');
        langText.textContent = this.currentLanguage === 'en' ? 'العربية' : 'English';
        
        // Update document direction
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLanguage;
        
        // Update body font family
        if (this.currentLanguage === 'ar') {
            document.body.style.fontFamily = "'Amiri', serif";
        } else {
            document.body.style.fontFamily = "'Poppins', sans-serif";
        }
        
        // Update all elements with language attributes
        document.querySelectorAll('[data-en][data-ar]').forEach(element => {
            element.textContent = element.dataset[this.currentLanguage];
        });
        
        // Update sound toggle text
        const soundToggle = document.getElementById('soundToggle');
        const soundText = soundToggle.querySelector('span');
        if (this.soundEnabled) {
            soundText.textContent = this.currentLanguage === 'ar' ? 'الصوت: مفعل' : 'Sound: ON';
        } else {
            soundText.textContent = this.currentLanguage === 'ar' ? 'الصوت: معطل' : 'Sound: OFF';
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-status="${filter}"]`).classList.add('active');
        
        this.renderOrders();
    }

    setupAutoRefresh() {
        // Refresh data every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, 30000);
    }

    getStatusText(status) {
        const statusMap = {
            pending: 'Pending',
            preparing: 'Preparing',
            completed: 'Completed',
            cancelled: 'Cancelled'
        };
        return statusMap[status] || status;
    }

    getStatusColor(status) {
        const colorMap = {
            pending: 'warning',
            preparing: 'info',
            completed: 'success',
            cancelled: 'danger'
        };
        return colorMap[status] || 'secondary';
    }

    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const dateString = now.toLocaleDateString();
        
        const clockElement = document.getElementById('currentTime');
        if (clockElement) {
            clockElement.textContent = `${dateString} ${timeString}`;
        }
    }

    showLoading(show) {
        const loader = document.getElementById('loadingSpinner');
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info', customClass = '') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type} ${customClass}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cashierApp = new CashierApp();
});

