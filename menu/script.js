// UNO Restaurant & Café - Menu Script

class MenuApp {
    constructor() {
        this.currentLanguage = 'ar';
        this.currentCategory = null;
        this.cart = [];
        this.categories = [];
        this.menuItems = [];
        this.quickActions = [];
        this.tableNumber = this.getTableNumber();
        this.numberOfPeople = 0;
        this.waterItem = null;
        this.TAX_RATE = 0.10; // 10% tax
        
        this.init();
    }

    async init() {
        this.showLoading(true);
        
        try {
            // Set table number
            document.getElementById('tableNumber').textContent = this.tableNumber;
            
            // Load data from Supabase
            await this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render initial content
            this.renderCategories();
            this.renderQuickActions();
            this.renderMenuItems();
            
            // Setup language
            this.updateLanguage();
            
            // Show people count modal on first load
            this.showPeopleCountModal();
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to load menu data. Please refresh the page.');
        } finally {
            this.showLoading(false);
        }
    }

    getTableNumber() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('table') || '1';
    }

    async loadData() {
        try {
            // Load categories
            this.categories = await DatabaseAPI.getCategories();
            
            // Load menu items
            this.menuItems = await DatabaseAPI.getMenuItems();
            
            // Load quick actions
            this.quickActions = await DatabaseAPI.getQuickActions();
            
            // Find water item (assuming it exists with name "Water" or "ماء")
            this.waterItem = this.menuItems.find(item => 
                item.name_en.toLowerCase().includes('water') || 
                item.name_ar.includes('ماء')
            );
            
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Language toggle
        document.getElementById('langToggle').addEventListener('click', () => {
            this.toggleLanguage();
        });

        // Cart toggle
        document.getElementById('cartToggle').addEventListener('click', () => {
            this.toggleCart();
        });

        // Cart close
        document.getElementById('cartClose').addEventListener('click', () => {
            this.toggleCart();
        });

        // Submit order
        document.getElementById('submitOrder').addEventListener('click', () => {
            this.submitOrder();
        });

        // Modal quantity controls
        document.getElementById('decreaseQty').addEventListener('click', () => {
            this.updateModalQuantity(-1);
        });

        document.getElementById('increaseQty').addEventListener('click', () => {
            this.updateModalQuantity(1);
        });

        // Add to cart
        document.getElementById('addToCart').addEventListener('click', () => {
            this.addToCartFromModal();
        });

        // People count modal
        document.getElementById('confirmPeopleCount').addEventListener('click', () => {
            this.confirmPeopleCount();
        });

        document.getElementById('decreasePeople').addEventListener('click', () => {
            this.updatePeopleCount(-1);
        });

        document.getElementById('increasePeople').addEventListener('click', () => {
            this.updatePeopleCount(1);
        });

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cartSidebar');
            const cartToggle = document.getElementById('cartToggle');
            
            if (!cartSidebar.contains(e.target) && !cartToggle.contains(e.target) && cartSidebar.classList.contains('open')) {
                this.toggleCart();
            }
        });
    }

    showPeopleCountModal() {
        const modal = new bootstrap.Modal(document.getElementById('peopleCountModal'));
        document.getElementById('peopleCount').textContent = '1'; // Default to 2 people
        modal.show();
    }

    updatePeopleCount(change) {
        const countElement = document.getElementById('peopleCount');
        let currentCount = parseInt(countElement.textContent);
        currentCount = Math.max(1, currentCount + change);
        countElement.textContent = currentCount;
    }

    confirmPeopleCount() {
        this.numberOfPeople = parseInt(document.getElementById('peopleCount').textContent);
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('peopleCountModal')).hide();
        
        // Automatically add water to cart if water item exists
        if (this.waterItem && this.numberOfPeople > 0) {
            this.addWaterToCart();
        }
        
        this.showToast(`Table set for ${this.numberOfPeople} people`);
    }

    addWaterToCart() {
        if (!this.waterItem) return;
        
        // Find the default price for water (usually the first one)
        const defaultPrice = this.waterItem.prices && this.waterItem.prices.length > 0 ? 
            this.waterItem.prices[0] : null;
        
        const waterCartItem = {
            id: Date.now(),
            item: this.waterItem,
            priceId: defaultPrice ? defaultPrice.id : null,
            quantity: this.numberOfPeople,
            notes: 'Auto-added water',
            isAutoAdded: true
        };
        
        this.cart.push(waterCartItem);
        this.updateCartDisplay();
        
        const waterName = this.currentLanguage === 'ar' ? this.waterItem.name_ar : this.waterItem.name_en;
        this.showToast(`${this.numberOfPeople} ${waterName} added automatically`);
    }

    renderCategories() {
        const container = document.getElementById('categoriesSlider');
        container.innerHTML = '';

        this.categories.forEach((category, index) => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.dataset.categoryId = category.id;
            
            const name = this.currentLanguage === 'ar' ? category.name_ar : category.name_en;
            categoryCard.textContent = name;
            
            categoryCard.addEventListener('click', () => {
                this.selectCategory(category.id);
            });

            container.appendChild(categoryCard);
            
            // Add animation delay
            setTimeout(() => {
                categoryCard.classList.add('slide-up');
            }, index * 100);
        });

        // Select first category by default
        if (this.categories.length > 0) {
            this.selectCategory(this.categories[0].id);
        }
    }

    renderMenuItems(categoryId = null) {
        const container = document.getElementById('menuItemsContainer');
        container.innerHTML = '';

        let itemsToShow = this.menuItems;
        if (categoryId) {
            itemsToShow = this.menuItems.filter(item => item.category_id === categoryId);
        }

        itemsToShow.forEach((item, index) => {
            const itemCard = this.createMenuItemCard(item);
            container.appendChild(itemCard);
            
            // Add animation delay
            setTimeout(() => {
                itemCard.classList.add('fade-in');
            }, index * 100);
        });
    }

    createMenuItemCard(item) {
        const card = document.createElement('div');
        card.className = 'menu-item-card';
        
        const name = this.currentLanguage === 'ar' ? item.name_ar : item.name_en;
        const description = this.currentLanguage === 'ar' ? item.description_ar : item.description_en;
        
        // Get price range
        const prices = item.prices || [];
        let priceDisplay = '';
        if (prices.length > 0) {
            const minPrice = Math.min(...prices.map(p => parseFloat(p.price)));
            const maxPrice = Math.max(...prices.map(p => parseFloat(p.price)));
            priceDisplay = minPrice === maxPrice ? `$${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
        }

        card.innerHTML = `
            <img src="${item.image_url || '/assets/images/placeholder.jpg'}" alt="${name}" class="item-image">
            <div class="item-content">
                <h3 class="item-name">${name}</h3>
                <p class="item-description">${description || ''}</p>
                <div class="item-meta">
                    <span class="item-price">${priceDisplay}</span>
                    <div class="prep-time">
                        <i class="fas fa-clock"></i>
                        <span>${item.estimated_prep_time_minutes || 15}</span>
                        <span data-en="min" data-ar="د">min</span>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.showItemModal(item);
        });

        return card;
    }

    renderQuickActions() {
        const container = document.getElementById('quickActionsGrid');
        container.innerHTML = '';

        this.quickActions.forEach((action, index) => {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'quick-action-btn';
            
            const actionText = this.currentLanguage === 'ar' ? action.action_ar : action.action_en;
            
            actionBtn.innerHTML = `
                <i class="fas fa-concierge-bell"></i>
                <span>${actionText}</span>
            `;

            actionBtn.addEventListener('click', () => {
                this.handleQuickAction(action);
            });

            container.appendChild(actionBtn);
            
            // Add animation delay
            setTimeout(() => {
                actionBtn.classList.add('bounce-in');
            }, index * 150);
        });
    }

    selectCategory(categoryId) {
        // Update active category
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const activeCard = document.querySelector(`[data-category-id="${categoryId}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
        }

        this.currentCategory = categoryId;
        this.renderMenuItems(categoryId);
    }

    showItemModal(item) {
        const modal = new bootstrap.Modal(document.getElementById('itemModal'));
        
        const name = this.currentLanguage === 'ar' ? item.name_ar : item.name_en;
        const description = this.currentLanguage === 'ar' ? item.description_ar : item.description_en;
        
        // Populate modal content
        document.getElementById('itemModalTitle').textContent = name;
        document.getElementById('itemModalImage').src = item.image_url || '/assets/images/placeholder.jpg';
        document.getElementById('itemModalDescription').textContent = description || '';
        document.getElementById('itemModalPrepTime').textContent = item.estimated_prep_time_minutes || 15;
        
        // Populate size options
        this.renderSizeOptions(item.prices || []);
        
        // Reset quantity and notes
        document.getElementById('itemQuantity').textContent = '1';
        document.getElementById('itemNotes').value = '';
        
        // Store current item
        this.currentModalItem = item;
        
        modal.show();
    }

    renderSizeOptions(prices) {
        const container = document.getElementById('sizeSelection');
        container.innerHTML = '<h6 data-en="Select Size:" data-ar="اختر الحجم:">Select Size:</h6>';
        
        if (prices.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        
        prices.forEach((price, index) => {
            const sizeOption = document.createElement('div');
            sizeOption.className = 'size-option';
            sizeOption.dataset.priceId = price.id;
            
            const sizeName = this.currentLanguage === 'ar' ? price.size_ar : price.size_en;
            
            sizeOption.innerHTML = `
                <span>${sizeName}</span>
                <span>$${parseFloat(price.price).toFixed(2)}</span>
            `;
            
            sizeOption.addEventListener('click', () => {
                document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
                sizeOption.classList.add('selected');
            });
            
            container.appendChild(sizeOption);
            
            // Select first option by default
            if (index === 0) {
                sizeOption.classList.add('selected');
            }
        });
    }

    updateModalQuantity(change) {
        const qtyElement = document.getElementById('itemQuantity');
        let currentQty = parseInt(qtyElement.textContent);
        currentQty = Math.max(1, currentQty + change);
        qtyElement.textContent = currentQty;
    }

    addToCartFromModal() {
        const selectedSize = document.querySelector('.size-option.selected');
        const quantity = parseInt(document.getElementById('itemQuantity').textContent);
        const notes = document.getElementById('itemNotes').value;
        
        if (!selectedSize && this.currentModalItem.prices.length > 0) {
            alert('Please select a size');
            return;
        }
        
        const cartItem = {
            id: Date.now(), // Temporary ID for cart
            item: this.currentModalItem,
            priceId: selectedSize ? selectedSize.dataset.priceId : null,
            quantity: quantity,
            notes: notes,
            isAutoAdded: false
        };
        
        this.cart.push(cartItem);
        this.updateCartDisplay();
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('itemModal')).hide();
        
        // Show success message
        this.showToast('Item added to cart!');
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartTax = document.getElementById('cartTax');
        const cartTotal = document.getElementById('cartTotal');
        
        // Update count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        
        // Update items
        cartItems.innerHTML = '';
        let subtotal = 0;
        
        this.cart.forEach((cartItem, index) => {
            const itemElement = this.createCartItemElement(cartItem, index);
            cartItems.appendChild(itemElement);
            
            // Calculate subtotal
            const price = this.getCartItemPrice(cartItem);
            subtotal += price * cartItem.quantity;
        });
        
        // Calculate tax and total
        const tax = subtotal * this.TAX_RATE;
        const total = subtotal + tax;
        
        // Update totals
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        cartTax.textContent = `$${tax.toFixed(2)}`;
        cartTotal.textContent = `$${total.toFixed(2)}`;
        
        // Show/hide submit button
        const submitBtn = document.getElementById('submitOrder');
        submitBtn.style.display = this.cart.length > 0 ? 'block' : 'none';
    }

    createCartItemElement(cartItem, index) {
        const div = document.createElement('div');
        div.className = 'cart-item';
        
        const name = this.currentLanguage === 'ar' ? cartItem.item.name_ar : cartItem.item.name_en;
        const price = this.getCartItemPrice(cartItem);
        const sizeInfo = this.getCartItemSizeInfo(cartItem);
        
        // Add indicator for auto-added items
        const autoAddedIndicator = cartItem.isAutoAdded ? 
            '<span class="badge bg-info ms-2">Auto</span>' : '';
        
        div.innerHTML = `
            <img src="${cartItem.item.image_url || '/assets/images/placeholder.jpg'}" alt="${name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${name}${autoAddedIndicator}</div>
                <div class="cart-item-size">${sizeInfo}</div>
                <div class="cart-item-price">$${(price * cartItem.quantity).toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="btn btn-sm btn-outline-secondary" onclick="menuApp.updateCartItemQuantity(${index}, -1)">-</button>
                <input type="number" class="cart-item-qty" value="${cartItem.quantity}" min="1" onchange="menuApp.setCartItemQuantity(${index}, this.value)">
                <button class="btn btn-sm btn-outline-secondary" onclick="menuApp.updateCartItemQuantity(${index}, 1)">+</button>
                <button class="btn btn-sm btn-outline-danger" onclick="menuApp.removeCartItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return div;
    }

    getCartItemPrice(cartItem) {
        if (!cartItem.priceId) {
            return 0;
        }
        
        const priceObj = cartItem.item.prices.find(p => p.id === cartItem.priceId);
        return priceObj ? parseFloat(priceObj.price) : 0;
    }

    getCartItemSizeInfo(cartItem) {
        if (!cartItem.priceId) {
            return '';
        }
        
        const priceObj = cartItem.item.prices.find(p => p.id === cartItem.priceId);
        if (!priceObj) return '';
        
        return this.currentLanguage === 'ar' ? priceObj.size_ar : priceObj.size_en;
    }

    updateCartItemQuantity(index, change) {
        if (index >= 0 && index < this.cart.length) {
            this.cart[index].quantity = Math.max(1, this.cart[index].quantity + change);
            this.updateCartDisplay();
        }
    }

    setCartItemQuantity(index, quantity) {
        if (index >= 0 && index < this.cart.length) {
            this.cart[index].quantity = Math.max(1, parseInt(quantity) || 1);
            this.updateCartDisplay();
        }
    }

    removeCartItem(index) {
        if (index >= 0 && index < this.cart.length) {
            this.cart.splice(index, 1);
            this.updateCartDisplay();
        }
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        cartSidebar.classList.toggle('open');
    }

    async handleQuickAction(action) {
        try {
            this.showLoading(true);
            
            const request = {
                table_number: this.tableNumber,
                action_id: action.id
            };
            
            await DatabaseAPI.createQuickActionRequest(request);
            
            const actionText = this.currentLanguage === 'ar' ? action.action_ar : action.action_en;
            this.showToast(`${actionText} request sent!`);
            
        } catch (error) {
            console.error('Error sending quick action:', error);
            this.showToast('Failed to send request. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async submitOrder() {
        if (this.cart.length === 0) {
            this.showToast('Your cart is empty', 'warning');
            return;
        }

        try {
            this.showLoading(true);

            // Calculate totals
            const subtotal = this.cart.reduce((sum, item) => {
                const price = this.getCartItemPrice(item);
                return sum + (price * item.quantity);
            }, 0);
            
            const tax = subtotal * this.TAX_RATE;
            const total = subtotal + tax;

            // Create order
            const order = {
                table_number: this.tableNumber,
                subtotal: subtotal,
                tax: tax,
                total: total,
                number_of_people: this.numberOfPeople
            };

            const orderId = await DatabaseAPI.createOrder(order);

            // Create order items
            for (const cartItem of this.cart) {
                const orderItem = {
                    order_id: orderId,
                    item_id: cartItem.item.id,
                    item_price_id: cartItem.priceId,
                    quantity: cartItem.quantity,
                    notes: cartItem.notes
                };

                await DatabaseAPI.createOrderItem(orderItem);
            }

            // Clear cart
            this.cart = [];
            this.updateCartDisplay();
            this.toggleCart();

            // Show success message
            this.showToast('Order submitted successfully!', 'success');

            // Show order confirmation modal
            this.showOrderConfirmation(orderId, total);

        } catch (error) {
            console.error('Error submitting order:', error);
            this.showToast('Failed to submit order. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showOrderConfirmation(orderId, total) {
        const modal = new bootstrap.Modal(document.getElementById('orderConfirmationModal'));
        
        document.getElementById('confirmationOrderId').textContent = orderId.substring(0, 8);
        document.getElementById('confirmationTotal').textContent = `$${total.toFixed(2)}`;
        document.getElementById('confirmationTable').textContent = this.tableNumber;
        
        modal.show();
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
        this.updateLanguage();
        
        // Re-render content with new language
        this.renderCategories();
        this.renderQuickActions();
        this.renderMenuItems(this.currentCategory);
        this.updateCartDisplay();
    }

    updateLanguage() {
        const langToggle = document.getElementById('langToggle');
        langToggle.textContent = this.currentLanguage === 'en' ? 'العربية' : 'English';
        
        // Update document direction
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLanguage;
        
        // Update all elements with language attributes
        document.querySelectorAll('[data-en][data-ar]').forEach(element => {
            element.textContent = element.dataset[this.currentLanguage];
        });
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
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.menuApp = new MenuApp();
});

