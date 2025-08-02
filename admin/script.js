// UNO Restaurant & Café - Admin Dashboard Script

class AdminApp {
    constructor() {
        this.categories = [];
        this.menuItems = [];
        this.quickActions = [];
        this.orders = [];
        this.currentSection = 'dashboard';
        this.currentOrderFilter = 'all';
        this.currentItemFilter = 'all';
        this.currentCategoryFilter = '';
        this.currentLanguage = 'ar';
        this.charts = {};
        this.currentEditingItemId = null;
        
        this.init();
    }

    async init() {
        this.showLoading(true);
        
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadData();
            
            // Initialize dashboard
            this.showSection('dashboard');
            
            // Setup language
            this.updateLanguage();
            
            // Start clock
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
            
            // Setup auto-refresh
            setInterval(() => this.loadData(), 60000); // Refresh every minute
            
        } catch (error) {
            console.error('Error initializing admin app:', error);
            this.showError('Failed to load admin dashboard. Please refresh the page.');
        } finally {
            this.showLoading(false);
        }
    }

    setupEventListeners() {
        // Language toggle
        const langToggleButton = document.getElementById('languageText');
        if (langToggleButton) {
            langToggleButton.closest('button').addEventListener('click', () => {
                this.toggleLanguage();
            });
        }

        // Sidebar navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Mobile sidebar toggle
        const mobileSidebarToggle = document.getElementById('sidebarToggle');
        if (mobileSidebarToggle) {
            mobileSidebarToggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('show');
                document.getElementById('mainWrapper').classList.toggle('expanded');
            });
        }

        // Refresh button
        const refreshButton = document.querySelector('.header-actions .btn-outline-primary');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadData();
            });
        }

        // Form submissions (these elements might not exist in the new admin/index.html, so add checks)
        const saveCategoryBtn = document.getElementById('saveCategoryBtn');
        if (saveCategoryBtn) {
            saveCategoryBtn.addEventListener('click', () => {
                this.saveCategory();
            });
        }

        const saveMenuItemBtn = document.getElementById('saveMenuItemBtn');
        if (saveMenuItemBtn) {
            saveMenuItemBtn.addEventListener('click', () => {
                this.saveMenuItem();
            });
        }

        const saveQuickActionBtn = document.getElementById('saveQuickActionBtn');
        if (saveQuickActionBtn) {
            saveQuickActionBtn.addEventListener('click', () => {
                this.saveQuickAction();
            });
        }

        // Order filters
        document.querySelectorAll('.order-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setOrderFilter(e.target.dataset.filter);
            });
        });

        // Item filters
        document.querySelectorAll('.item-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setItemFilter(e.target.dataset.itemFilter);
            });
        });

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.setCategoryFilter(e.target.value);
            });
        }

        // Analytics date range
        const updateAnalyticsBtn = document.getElementById('updateAnalytics');
        if (updateAnalyticsBtn) {
            updateAnalyticsBtn.addEventListener('click', () => {
                this.updateAnalytics();
            });
        }

        // Export analytics
        const exportAnalyticsBtn = document.getElementById('exportAnalytics');
        if (exportAnalyticsBtn) {
            exportAnalyticsBtn.addEventListener('click', () => {
                this.exportAnalyticsCSV();
            });
        }

        // Delete all orders
        const deleteAllOrdersBtn = document.getElementById('deleteAllOrders');
        if (deleteAllOrdersBtn) {
            deleteAllOrdersBtn.addEventListener('click', () => {
                this.deleteAllOrders();
            });
        }

        // Add size button
        const addSizeBtn = document.getElementById('addSizeBtn');
        if (addSizeBtn) {
            addSizeBtn.addEventListener('click', () => {
                this.addSizeRow();
            });
        }

        // Image upload
        const itemImageInput = document.getElementById('itemImage');
        if (itemImageInput) {
            itemImageInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    await this.handleImageUpload(file);
                }
            });
        }

        // Modal events
        const categoryModal = document.getElementById('categoryModal');
        if (categoryModal) {
            categoryModal.addEventListener('hidden.bs.modal', () => {
                this.resetCategoryForm();
            });
        }

        const menuItemModal = document.getElementById('menuItemModal');
        if (menuItemModal) {
            menuItemModal.addEventListener('hidden.bs.modal', () => {
                this.resetMenuItemForm();
            });
        }

        const quickActionModal = document.getElementById('quickActionModal');
        if (quickActionModal) {
            quickActionModal.addEventListener('hidden.bs.modal', () => {
                this.resetQuickActionForm();
            });
        }

        // Remove size buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-size') || e.target.parentElement.classList.contains('remove-size')) {
                e.preventDefault();
                const row = e.target.closest('.size-price-row');
                if (document.querySelectorAll('.size-price-row').length > 1) {
                    row.remove();
                }
            }
        });
    }

    async loadData() {
        try {
            // Load all data
            this.categories = await DatabaseAPI.getCategories();
            this.menuItems = await DatabaseAPI.getMenuItems();
            this.quickActions = await DatabaseAPI.getQuickActions();
            this.orders = await DatabaseAPI.getOrders();
            
            // Update current section
            this.updateCurrentSection();
            
            // Update category filter dropdown
            this.updateCategoryFilterDropdown();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Failed to load data', 'error');
        }
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
            categories: { en: 'Categories', ar: 'الفئات' },
            'menu-items': { en: 'Menu Items', ar: 'عناصر القائمة' },
            'quick-actions': { en: 'Quick Actions', ar: 'الإجراءات السريعة' },
            orders: { en: 'Orders', ar: 'الطلبات' },
            analytics: { en: 'Analytics', ar: 'التحليلات' }
        };
        const title = titles[sectionName] || titles.dashboard;
        document.getElementById('pageTitle').textContent = title[this.currentLanguage];

        this.currentSection = sectionName;
        this.updateCurrentSection();
    }

    updateCurrentSection() {
        switch (this.currentSection) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'categories':
                this.renderCategories();
                break;
            case 'menu-items':
                this.renderMenuItems();
                break;
            case 'quick-actions':
                this.renderQuickActions();
                break;
            case 'orders':
                this.renderOrders();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
        }
    }

    updateDashboard() {
        // Update statistics
        document.getElementById('totalMenuItems').textContent = this.menuItems.length;
        document.getElementById('totalOrders').textContent = this.orders.length;
        document.getElementById('totalCategories').textContent = this.categories.length;

        // Calculate revenue with tax
        let totalRevenue = 0;
        this.orders.forEach(order => {
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
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;

        // Render recent orders
        this.renderRecentOrders();
    }

    renderRecentOrders() {
        const container = document.getElementById('recentOrdersTable');
        container.innerHTML = '';

        const recentOrders = this.orders.slice(0, 10);

        recentOrders.forEach(order => {
            const row = document.createElement('tr');
            
            // Calculate total with tax
            let total = 0;
            const itemCount = order.order_items ? order.order_items.length : 0;
            
            if (order.total) {
                total = parseFloat(order.total);
            } else if (order.order_items) {
                // Fallback calculation
                let subtotal = 0;
                order.order_items.forEach(item => {
                    const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                    subtotal += price * item.quantity;
                });
                total = subtotal * 1.10; // Add 10% tax
            }

            row.innerHTML = `
                <td>#${order.id.substring(0, 8)}</td>
                <td>${order.table_number}</td>
                <td>${itemCount} items</td>
                <td>$${total.toFixed(2)}</td>
                <td><span class="status-badge ${order.status}">${this.getStatusText(order.status)}</span></td>
                <td>${new Date(order.order_time).toLocaleString()}</td>
            `;

            container.appendChild(row);
        });
    }

    renderCategories() {
        const container = document.getElementById('categoriesTable');
        container.innerHTML = '';

        this.categories.forEach(category => {
            const row = document.createElement('tr');
            const nameEn = category.name_en;
            const nameAr = category.name_ar;
            const displayName = this.currentLanguage === 'ar' ? nameAr : nameEn;
            
            row.innerHTML = `
                <td>${nameEn}</td>
                <td>${nameAr}</td>
                <td>${category.display_order}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="adminApp.editCategory('${category.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminApp.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            container.appendChild(row);
        });

        // Populate category dropdown in menu item modal
        this.populateCategoryDropdown();
    }

    renderMenuItems() {
        const container = document.getElementById('menuItemsGrid');
        container.innerHTML = '';

        // Filter items
        let filteredItems = this.menuItems;
        
        // Filter by availability
        if (this.currentItemFilter === 'available') {
            filteredItems = filteredItems.filter(item => item.is_available);
        } else if (this.currentItemFilter === 'unavailable') {
            filteredItems = filteredItems.filter(item => !item.is_available);
        }
        
        // Filter by category
        if (this.currentCategoryFilter) {
            filteredItems = filteredItems.filter(item => item.category_id === this.currentCategoryFilter);
        }

        filteredItems.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6';
            
            const category = this.categories.find(cat => cat.id === item.category_id);
            const prices = item.prices || [];
            const priceRange = prices.length > 0 ? 
                `$${Math.min(...prices.map(p => parseFloat(p.price))).toFixed(2)} - $${Math.max(...prices.map(p => parseFloat(p.price))).toFixed(2)}` :
                'No prices set';

            const itemName = this.currentLanguage === 'ar' ? item.name_ar : item.name_en;
            const itemDescription = this.currentLanguage === 'ar' ? item.description_ar : item.description_en;
            const categoryName = category ? (this.currentLanguage === 'ar' ? category.name_ar : category.name_en) : 'No Category';

            col.innerHTML = `
                <div class="menu-item-card ${!item.is_available ? 'unavailable' : ''}">
                    <img src="${item.image_url || '/assets/images/placeholder.jpg'}" alt="${itemName}" class="menu-item-image">
                    <div class="menu-item-content">
                        <h5 class="menu-item-name">${itemName}</h5>
                        <p class="menu-item-category">${categoryName}</p>
                        <p class="menu-item-description">${itemDescription || 'No description'}</p>
                        <div class="menu-item-meta">
                            <span class="menu-item-price">${priceRange}</span>
                            <span class="menu-item-prep-time">
                                <i class="fas fa-clock"></i> ${item.estimated_prep_time_minutes || 15}min
                            </span>
                        </div>
                        <div class="menu-item-actions">
                            <button class="btn btn-sm btn-outline-primary" onclick="adminApp.editMenuItem('${item.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="adminApp.deleteMenuItem('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-${item.is_available ? 'warning' : 'success'}" onclick="adminApp.toggleMenuItemAvailability('${item.id}')">
                                <i class="fas fa-${item.is_available ? 'eye-slash' : 'eye'}"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(col);
        });

        if (filteredItems.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted" data-en="No items found" data-ar="لم يتم العثور على عناصر">No items found</h5>
                    <p class="text-muted" data-en="Try adjusting your filters" data-ar="جرب تعديل المرشحات">Try adjusting your filters</p>
                </div>
            `;
            this.updateLanguage();
        }
    }

    renderQuickActions() {
        const container = document.getElementById('quickActionsTable');
        container.innerHTML = '';

        this.quickActions.forEach(action => {
            const row = document.createElement('tr');
            const actionEn = action.action_en;
            const actionAr = action.action_ar;
            
            row.innerHTML = `
                <td>${actionEn}</td>
                <td>${actionAr}</td>
                <td>${action.display_order}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="adminApp.editQuickAction('${action.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminApp.deleteQuickAction('${action.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            container.appendChild(row);
        });
    }

    renderOrders() {
        const container = document.getElementById('ordersTable');
        container.innerHTML = '';

        let filteredOrders = this.orders;
        if (this.currentOrderFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === this.currentOrderFilter);
        }

        filteredOrders.forEach(order => {
            const row = document.createElement('tr');
            
            // Calculate total with tax
            let total = 0;
            const itemCount = order.order_items ? order.order_items.length : 0;
            
            if (order.total) {
                total = parseFloat(order.total);
            } else if (order.order_items) {
                // Fallback calculation
                let subtotal = 0;
                order.order_items.forEach(item => {
                    const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                    subtotal += price * item.quantity;
                });
                total = subtotal * 1.10; // Add 10% tax
            }

            row.innerHTML = `
                <td>#${order.id.substring(0, 8)}</td>
                <td>${order.table_number}</td>
                <td>${itemCount} items</td>
                <td>$${total.toFixed(2)}</td>
                <td><span class="status-badge ${order.status}">${this.getStatusText(order.status)}</span></td>
                <td>${new Date(order.order_time).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="adminApp.viewOrderDetails('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminApp.deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            container.appendChild(row);
        });
    }

    renderAnalytics() {
        this.updateAnalytics();
    }

    updateAnalytics() {
        // Get date range
        const startDate = document.getElementById('startDate').value || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = document.getElementById('endDate').value || new Date().toISOString().split('T')[0];

        // Set default values
        document.getElementById('startDate').value = startDate;
        document.getElementById('endDate').value = endDate;

        // Filter orders by date range
        const filteredOrders = this.orders.filter(order => {
            const orderDate = new Date(order.order_time).toISOString().split('T')[0];
            return orderDate >= startDate && orderDate <= endDate;
        });

        // Render charts
        this.renderMostOrderedChart(filteredOrders);
        this.renderRevenueChart(filteredOrders);
        this.renderPerformanceTable(filteredOrders);
    }

    renderMostOrderedChart(orders) {
        const ctx = document.getElementById('mostOrderedChart').getContext('2d');
        
        // Destroy existing chart
        if (this.charts.mostOrdered) {
            this.charts.mostOrdered.destroy();
        }

        // Calculate most ordered items
        const itemCounts = {};
        orders.forEach(order => {
            if (order.order_items) {
                order.order_items.forEach(item => {
                    const itemName = item.menu_item ? 
                        (this.currentLanguage === 'ar' ? item.menu_item.name_ar : item.menu_item.name_en) : 
                        'Unknown';
                    itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
                });
            }
        });

        const sortedItems = Object.entries(itemCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        this.charts.mostOrdered = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedItems.map(([name]) => name),
                datasets: [{
                    label: this.currentLanguage === 'ar' ? 'الطلبات' : 'Orders',
                    data: sortedItems.map(([, count]) => count),
                    backgroundColor: 'rgba(212, 175, 55, 0.8)',
                    borderColor: 'rgba(212, 175, 55, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderRevenueChart(orders) {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        // Destroy existing chart
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        // Calculate daily revenue with tax
        const dailyRevenue = {};
        orders.forEach(order => {
            const date = new Date(order.order_time).toISOString().split('T')[0];
            if (!dailyRevenue[date]) dailyRevenue[date] = 0;
            
            if (order.total) {
                dailyRevenue[date] += parseFloat(order.total);
            } else if (order.order_items) {
                // Fallback calculation
                let subtotal = 0;
                order.order_items.forEach(item => {
                    const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                    subtotal += price * item.quantity;
                });
                dailyRevenue[date] += subtotal * 1.10; // Add 10% tax
            }
        });

        const sortedDates = Object.keys(dailyRevenue).sort();

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: this.currentLanguage === 'ar' ? 'الإيرادات ($)' : 'Revenue ($)',
                    data: sortedDates.map(date => dailyRevenue[date]),
                    backgroundColor: 'rgba(255, 107, 53, 0.2)',
                    borderColor: 'rgba(255, 107, 53, 1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderPerformanceTable(orders) {
        const container = document.getElementById('performanceTable');
        container.innerHTML = '';

        // Calculate performance data
        const itemPerformance = {};
        orders.forEach(order => {
            if (order.order_items) {
                order.order_items.forEach(item => {
                    const itemName = item.menu_item ? 
                        (this.currentLanguage === 'ar' ? item.menu_item.name_ar : item.menu_item.name_en) : 
                        'Unknown';
                    if (!itemPerformance[itemName]) {
                        itemPerformance[itemName] = { count: 0, revenue: 0 };
                    }
                    itemPerformance[itemName].count += item.quantity;
                    const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                    itemPerformance[itemName].revenue += price * item.quantity * 1.10; // Add 10% tax
                });
            }
        });

        const sortedPerformance = Object.entries(itemPerformance)
            .sort(([,a], [,b]) => b.revenue - a.revenue)
            .slice(0, 10);

        sortedPerformance.forEach(([itemName, data]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${itemName}</td>
                <td>${data.count}</td>
                <td>$${data.revenue.toFixed(2)}</td>
            `;
            container.appendChild(row);
        });
    }

    // Filter functions
    setItemFilter(filter) {
        this.currentItemFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('[data-item-filter]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-item-filter="${filter}"]`).classList.add('active');
        
        this.renderMenuItems();
    }

    setCategoryFilter(categoryId) {
        this.currentCategoryFilter = categoryId;
        this.renderMenuItems();
    }

    updateCategoryFilterDropdown() {
        const select = document.getElementById('categoryFilter');
        const currentValue = select.value;
        
        // Clear existing options except the first one
        select.innerHTML = `<option value="" data-en="All Categories" data-ar="جميع الفئات">All Categories</option>`;
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = this.currentLanguage === 'ar' ? category.name_ar : category.name_en;
            select.appendChild(option);
        });
        
        // Restore previous selection
        select.value = currentValue;
        
        // Update language for the default option
        this.updateLanguage();
    }

    // Language functions
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        this.updateLanguage();
        
        // Re-render current section to update content
        this.updateCurrentSection();
        
        // Update charts if in analytics section
        if (this.currentSection === 'analytics') {
            this.updateAnalytics();
        }
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
        
        // Update page title
        const titles = {
            dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
            categories: { en: 'Categories', ar: 'الفئات' },
            'menu-items': { en: 'Menu Items', ar: 'عناصر القائمة' },
            'quick-actions': { en: 'Quick Actions', ar: 'الإجراءات السريعة' },
            orders: { en: 'Orders', ar: 'الطلبات' },
            analytics: { en: 'Analytics', ar: 'التحليلات' }
        };
        const title = titles[this.currentSection] || titles.dashboard;
        document.getElementById('pageTitle').textContent = title[this.currentLanguage];
    }

    // Save functions
    async saveCategory() {
        try {
            this.showLoading(true);
            
            const formData = {
                name_en: document.getElementById('categoryNameEn').value,
                name_ar: document.getElementById('categoryNameAr').value,
                display_order: parseInt(document.getElementById('categoryOrder').value)
            };

            const categoryId = document.getElementById('categoryId').value;
            
            if (categoryId) {
                await DatabaseAPI.updateCategory(categoryId, formData);
                this.showToast('Category updated successfully', 'success');
            } else {
                await DatabaseAPI.createCategory(formData);
                this.showToast('Category created successfully', 'success');
            }

            // Close modal and reload data
            bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
            await this.loadData();
            
        } catch (error) {
            console.error('Error saving category:', error);
            this.showToast('Failed to save category', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async saveMenuItem() {
        try {
            this.showLoading(true);
            
            const formData = {
                name_en: document.getElementById('itemNameEn').value,
                name_ar: document.getElementById('itemNameAr').value,
                category_id: document.getElementById('itemCategory').value,
                description_en: document.getElementById('itemDescEn').value,
                description_ar: document.getElementById('itemDescAr').value,
                estimated_prep_time_minutes: parseInt(document.getElementById('itemPrepTime').value),
                display_order: parseInt(document.getElementById('itemOrder').value),
                is_available: document.getElementById('itemAvailable').checked,
                image_url: document.getElementById('imageUrl').value || null
            };

            const itemId = document.getElementById('menuItemId').value;
            let savedItem;
            
            if (itemId) {
                // Delete existing prices first when editing
                await this.deleteExistingItemPrices(itemId);
                savedItem = await DatabaseAPI.updateMenuItem(itemId, formData);
                this.showToast('Menu item updated successfully', 'success');
            } else {
                savedItem = await DatabaseAPI.createMenuItem(formData);
                this.showToast('Menu item created successfully', 'success');
            }

            // Save prices
            await this.saveItemPrices(savedItem.id);

            // Close modal and reload data
            bootstrap.Modal.getInstance(document.getElementById('menuItemModal')).hide();
            await this.loadData();
            
        } catch (error) {
            console.error('Error saving menu item:', error);
            this.showToast('Failed to save menu item', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteExistingItemPrices(itemId) {
        const item = this.menuItems.find(mi => mi.id === itemId);
        if (item && item.prices) {
            for (const price of item.prices) {
                await DatabaseAPI.deleteItemPrice(price.id);
            }
        }
    }

    async saveItemPrices(itemId) {
        const sizeRows = document.querySelectorAll('.size-price-row');
        
        for (const row of sizeRows) {
            const sizeEn = row.querySelector('input[name="sizeEn[]"]').value;
            const sizeAr = row.querySelector('input[name="sizeAr[]"]').value;
            const price = row.querySelector('input[name="price[]"]').value;
            
            if (sizeEn && sizeAr && price) {
                const priceData = {
                    item_id: itemId,
                    size_en: sizeEn,
                    size_ar: sizeAr,
                    price: parseFloat(price)
                };
                
                await DatabaseAPI.createItemPrice(priceData);
            }
        }
    }

    async saveQuickAction() {
        try {
            this.showLoading(true);
            
            const formData = {
                action_en: document.getElementById('actionEn').value,
                action_ar: document.getElementById('actionAr').value,
                display_order: parseInt(document.getElementById('actionOrder').value)
            };

            const actionId = document.getElementById('quickActionId').value;
            
            if (actionId) {
                await DatabaseAPI.updateQuickAction(actionId, formData);
                this.showToast('Quick action updated successfully', 'success');
            } else {
                await DatabaseAPI.createQuickAction(formData);
                this.showToast('Quick action created successfully', 'success');
            }

            // Close modal and reload data
            bootstrap.Modal.getInstance(document.getElementById('quickActionModal')).hide();
            await this.loadData();
            
        } catch (error) {
            console.error('Error saving quick action:', error);
            this.showToast('Failed to save quick action', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Edit functions
    editCategory(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        if (!category) return;

        this.resetCategoryForm();
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryNameEn').value = category.name_en;
        document.getElementById('categoryNameAr').value = category.name_ar;
        document.getElementById('categoryOrder').value = category.display_order;

        new bootstrap.Modal(document.getElementById('categoryModal')).show();
    }

    editMenuItem(itemId) {
        const item = this.menuItems.find(mi => mi.id === itemId);
        if (!item) return;

        this.resetMenuItemForm();
        this.currentEditingItemId = itemId;
        
        document.getElementById('menuItemId').value = item.id;
        document.getElementById('itemNameEn').value = item.name_en;
        document.getElementById('itemNameAr').value = item.name_ar;
        document.getElementById('itemCategory').value = item.category_id;
        document.getElementById('itemDescEn').value = item.description_en || '';
        document.getElementById('itemDescAr').value = item.description_ar || '';
        document.getElementById('itemPrepTime').value = item.estimated_prep_time_minutes || 15;
        document.getElementById('itemOrder').value = item.display_order;
        document.getElementById('itemAvailable').checked = item.is_available;
        document.getElementById('imageUrl').value = item.image_url || '';

        // Show image preview
        if (item.image_url) {
            document.getElementById('imagePreview').innerHTML = `<img src="${item.image_url}" alt="Preview" style="max-width: 200px; max-height: 200px;">`;
        }

        // Populate sizes
        this.populateItemSizes(item.prices || []);

        new bootstrap.Modal(document.getElementById('menuItemModal')).show();
    }

    editQuickAction(actionId) {
        const action = this.quickActions.find(qa => qa.id === actionId);
        if (!action) return;

        this.resetQuickActionForm();
        document.getElementById('quickActionId').value = action.id;
        document.getElementById('actionEn').value = action.action_en;
        document.getElementById('actionAr').value = action.action_ar;
        document.getElementById('actionOrder').value = action.display_order;

        new bootstrap.Modal(document.getElementById('quickActionModal')).show();
    }

    // Reset form functions
    resetCategoryForm() {
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryNameEn').value = '';
        document.getElementById('categoryNameAr').value = '';
        document.getElementById('categoryOrder').value = '';
    }

    resetMenuItemForm() {
        document.getElementById('menuItemId').value = '';
        document.getElementById('itemNameEn').value = '';
        document.getElementById('itemNameAr').value = '';
        document.getElementById('itemCategory').value = '';
        document.getElementById('itemDescEn').value = '';
        document.getElementById('itemDescAr').value = '';
        document.getElementById('itemPrepTime').value = '15';
        document.getElementById('itemOrder').value = '';
        document.getElementById('itemAvailable').checked = true;
        document.getElementById('imageUrl').value = '';
        document.getElementById('imagePreview').innerHTML = '';
        
        // Reset sizes to one row
        const sizesContainer = document.getElementById('sizesContainer');
        sizesContainer.innerHTML = '';
        this.addSizeRow();
        
        this.currentEditingItemId = null;
    }

    resetQuickActionForm() {
        document.getElementById('quickActionId').value = '';
        document.getElementById('actionEn').value = '';
        document.getElementById('actionAr').value = '';
        document.getElementById('actionOrder').value = '';
    }

    // Delete functions
    async deleteCategory(categoryId) {
        const confirmText = this.currentLanguage === 'ar' ? 
            'هل أنت متأكد من أنك تريد حذف هذه الفئة؟' : 
            'Are you sure you want to delete this category?';
        
        if (!confirm(confirmText)) return;

        try {
            this.showLoading(true);
            await DatabaseAPI.deleteCategory(categoryId);
            await this.loadData();
            this.showToast('Category deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting category:', error);
            this.showToast('Failed to delete category', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteMenuItem(itemId) {
        const confirmText = this.currentLanguage === 'ar' ? 
            'هل أنت متأكد من أنك تريد حذف هذا العنصر؟' : 
            'Are you sure you want to delete this menu item?';
        
        if (!confirm(confirmText)) return;

        try {
            this.showLoading(true);
            await DatabaseAPI.deleteMenuItem(itemId);
            await this.loadData();
            this.showToast('Menu item deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting menu item:', error);
            this.showToast('Failed to delete menu item', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteQuickAction(actionId) {
        const confirmText = this.currentLanguage === 'ar' ? 
            'هل أنت متأكد من أنك تريد حذف هذا الإجراء السريع؟' : 
            'Are you sure you want to delete this quick action?';
        
        if (!confirm(confirmText)) return;

        try {
            this.showLoading(true);
            await DatabaseAPI.deleteQuickAction(actionId);
            await this.loadData();
            this.showToast('Quick action deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting quick action:', error);
            this.showToast('Failed to delete quick action', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteOrder(orderId) {
        const confirmText = this.currentLanguage === 'ar' ? 
            'هل أنت متأكد من أنك تريد حذف هذا الطلب؟' : 
            'Are you sure you want to delete this order?';
        
        if (!confirm(confirmText)) return;

        try {
            this.showLoading(true);
            await DatabaseAPI.deleteOrder(orderId);
            await this.loadData();
            this.showToast('Order deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting order:', error);
            this.showToast('Failed to delete order', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteAllOrders() {
        const confirmText = this.currentLanguage === 'ar' ? 
            'هل أنت متأكد من أنك تريد حذف جميع الطلبات؟ لا يمكن التراجع عن هذا الإجراء.' : 
            'Are you sure you want to delete ALL orders? This action cannot be undone.';
        
        if (!confirm(confirmText)) return;

        try {
            this.showLoading(true);
            await DatabaseAPI.deleteAllOrders();
            await this.loadData();
            this.showToast('All orders deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting all orders:', error);
            this.showToast('Failed to delete all orders', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Export analytics as CSV
    exportAnalyticsCSV() {
        const startDate = document.getElementById('startDate').value || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = document.getElementById('endDate').value || new Date().toISOString().split('T')[0];

        // Set default values
        document.getElementById('startDate').value = startDate;
        document.getElementById('endDate').value = endDate;

        // Filter orders by date range
        const filteredOrders = this.orders.filter(order => {
            const orderDate = new Date(order.order_time).toISOString().split('T')[0];
            return orderDate >= startDate && orderDate <= endDate;
        });

        // Prepare CSV data
        const csvData = [];
        const headers = this.currentLanguage === 'ar' ? 
            ['رقم الطلب', 'الطاولة', 'التاريخ', 'الوقت', 'العنصر', 'الكمية', 'السعر', 'المجموع الفرعي', 'الضريبة', 'المجموع', 'الحالة'] :
            ['Order ID', 'Table', 'Date', 'Time', 'Item', 'Quantity', 'Price', 'Subtotal', 'Tax', 'Total', 'Status'];
        
        csvData.push(headers);

        filteredOrders.forEach(order => {
            if (order.order_items && order.order_items.length > 0) {
                order.order_items.forEach(item => {
                    const price = item.item_price ? parseFloat(item.item_price.price) : 0;
                    const subtotal = price * item.quantity;
                    const tax = subtotal * 0.10;
                    const total = subtotal + tax;
                    
                    const itemName = item.menu_item ? 
                        (this.currentLanguage === 'ar' ? item.menu_item.name_ar : item.menu_item.name_en) : 
                        'Unknown';
                    
                    csvData.push([
                        order.id.substring(0, 8),
                        order.table_number,
                        new Date(order.order_time).toLocaleDateString(),
                        new Date(order.order_time).toLocaleTimeString(),
                        itemName,
                        item.quantity,
                        price.toFixed(2),
                        subtotal.toFixed(2),
                        tax.toFixed(2),
                        total.toFixed(2),
                        order.status
                    ]);
                });
            } else {
                csvData.push([
                    order.id.substring(0, 8),
                    order.table_number,
                    new Date(order.order_time).toLocaleDateString(),
                    new Date(order.order_time).toLocaleTimeString(),
                    this.currentLanguage === 'ar' ? 'لا توجد عناصر' : 'No items',
                    0,
                    0,
                    0,
                    0,
                    0,
                    order.status
                ]);
            }
        });

        // Convert to CSV string
        const csvString = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');

        // Download CSV
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${startDate}_to_${endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showToast('Analytics exported successfully', 'success');
    }

    // Utility functions
    async toggleMenuItemAvailability(itemId) {
        const item = this.menuItems.find(mi => mi.id === itemId);
        if (!item) return;

        try {
            this.showLoading(true);
            await DatabaseAPI.updateMenuItem(itemId, { is_available: !item.is_available });
            await this.loadData();
            const statusText = item.is_available ? 
                (this.currentLanguage === 'ar' ? 'مخفي' : 'hidden') : 
                (this.currentLanguage === 'ar' ? 'ظاهر' : 'shown');
            this.showToast(`Item ${statusText}`, 'success');
        } catch (error) {
            console.error('Error toggling item availability:', error);
            this.showToast('Failed to update item availability', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    populateCategoryDropdown() {
        const select = document.getElementById('itemCategory');
        select.innerHTML = '<option value="">Select Category</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = this.currentLanguage === 'ar' ? category.name_ar : category.name_en;
            select.appendChild(option);
        });
    }

    populateItemSizes(prices) {
        const container = document.getElementById('sizesContainer');
        container.innerHTML = '';
        
        if (prices.length === 0) {
            this.addSizeRow();
        } else {
            prices.forEach(price => {
                this.addSizeRow(price.size_en, price.size_ar, price.price);
            });
        }
    }

    addSizeRow(sizeEn = '', sizeAr = '', price = '') {
        const container = document.getElementById('sizesContainer');
        const row = document.createElement('div');
        row.className = 'size-price-row row mb-2';
        
        row.innerHTML = `
            <div class="col-md-3">
                <input type="text" class="form-control" name="sizeEn[]" placeholder="Size (English)" value="${sizeEn}">
            </div>
            <div class="col-md-3">
                <input type="text" class="form-control" name="sizeAr[]" placeholder="Size (Arabic)" value="${sizeAr}">
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control" name="price[]" placeholder="Price" step="0.01" value="${price}">
            </div>
            <div class="col-md-3">
                <button type="button" class="btn btn-outline-danger remove-size">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(row);
    }

    async handleImageUpload(file) {
        if (!file) return;

        this.showLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Cloudinary upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            const imageUrl = data.secure_url;

            document.getElementById('imageUrl').value = imageUrl;
            document.getElementById('imagePreview').innerHTML = `<img src="${imageUrl}" alt="Preview" style="max-width: 200px; max-height: 200px;">`;
            this.showToast('Image uploaded successfully!', 'success');
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            this.showToast('Failed to upload image. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    setOrderFilter(filter) {
        this.currentOrderFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderOrders();
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // Show order details in a modal (implement as needed)
        const detailsText = this.currentLanguage === 'ar' ? 
            `تفاصيل الطلب:\nالرقم: ${order.id}\nالطاولة: ${order.table_number}\nالحالة: ${order.status}\nالوقت: ${new Date(order.order_time).toLocaleString()}` :
            `Order Details:\nID: ${order.id}\nTable: ${order.table_number}\nStatus: ${order.status}\nTime: ${new Date(order.order_time).toLocaleString()}`;
        
        alert(detailsText);
    }

    getStatusText(status) {
        const statusMap = {
            pending: { en: 'Pending', ar: 'في الانتظار' },
            preparing: { en: 'Preparing', ar: 'قيد التحضير' },
            completed: { en: 'Completed', ar: 'مكتمل' },
            cancelled: { en: 'Cancelled', ar: 'ملغي' }
        };
        return statusMap[status] ? statusMap[status][this.currentLanguage] : status;
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

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        
        // Add to page
        document.body.appendChild(toast);
        
        // Show toast
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
    window.adminApp = new AdminApp();
});

