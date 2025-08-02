# Quick Setup Guide - UNO Enhanced QR Menu System

## 🚀 Quick Start (5 Minutes)

This guide will get your QR menu system up and running in just a few minutes.

## Step 1: Supabase Setup (2 minutes)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `uno-restaurant`
   - **Password**: Create a strong password
   - **Region**: Choose closest to your location
4. Click **"Create new project"** and wait 2-3 minutes

### Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 2: Database Setup (1 minute)

### Install Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire content from `supabase/schema.sql` file
4. Paste it and click **"Run"**
5. You should see "Success. No rows returned" message

### Enable Real-time
1. Go to **Database** → **Replication**
2. Turn ON replication for these tables:
   - `orders`
   - `order_items` 
   - `quick_action_requests`
   - `customer_sessions`

## Step 3: Configure Application (30 seconds)

### Update Config File
Edit `config.js` and replace these lines:

```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL_HERE',           // ← Paste your Project URL
    anonKey: 'YOUR_SUPABASE_ANON_KEY_HERE'   // ← Paste your Anon Key
};
```

### Test Connection
1. Open `test-connection.html` in your browser
2. Click **"Test Connection"** - should show green success
3. Click **"Test Database"** - should show all tests passed
4. Click **"Test Real-time"** - should show subscriptions working

## Step 4: Deploy (1 minute)

### Option A: Netlify (Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Drag your entire project folder to the deploy area
3. Wait for deployment
4. Your site is live! 🎉

### Option B: Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your project from GitHub or upload files
3. Deploy with default settings

### Option C: Any Web Host
1. Upload all files to your web hosting
2. Make sure files are in the public directory
3. Access via your domain

## Step 5: Generate QR Codes (2 minutes)

### Create QR Codes for Each Table
For each table, create a QR code that links to:
```
https://your-domain.com/menu/?table=TABLE_NUMBER
```

**Examples:**
- Table 1: `https://your-site.netlify.app/menu/?table=1`
- Table 5: `https://your-site.netlify.app/menu/?table=5`
- Table 10: `https://your-site.netlify.app/menu/?table=10`

### QR Code Generator
Use any free QR generator like:
- [qr-code-generator.com](https://www.qr-code-generator.com/)
- [qrcode-monkey.com](https://www.qrcode-monkey.com/)

## 🎯 You're Done!

Your QR menu system is now live and ready to use!

## Testing Your System

### Test Customer Flow
1. Scan a QR code or visit: `https://your-domain.com/menu/?table=1`
2. Enter a customer name
3. Browse the menu
4. Add items to cart
5. Place an order

### Test Cashier Dashboard
1. Visit: `https://your-domain.com/cashier/`
2. You should see the order appear in real-time
3. Update the order status
4. Customer should see the status change

## Default Login URLs

- **Customer Menu**: `https://your-domain.com/menu/?table=X`
- **Cashier Dashboard**: `https://your-domain.com/cashier/`
- **Admin Panel**: `https://your-domain.com/admin/`
- **Test Connection**: `https://your-domain.com/test-connection.html`

## Sample Data Included

The system comes with sample data:
- **20 Tables** (Table 1 to Table 20)
- **Menu Categories**: Appetizers, Main Courses, Desserts, Beverages
- **Sample Menu Items** with Arabic and English names
- **Quick Actions**: Call Waiter, Request Bill, etc.

## Customization

### Change Restaurant Name
Edit `config.js`:
```javascript
restaurantName: {
    en: 'Your Restaurant Name',
    ar: 'اسم مطعمك'
}
```

### Add Menu Items
1. Go to Supabase **Table Editor**
2. Add items to `menu_items` table
3. Add prices to `item_prices` table

### Customize Colors
Edit the CSS variables in any HTML file:
```css
:root {
    --primary-color: #dc2626;    /* Your brand color */
    --secondary-color: #059669;  /* Success color */
    --accent-color: #f59e0b;     /* Warning color */
}
```

## Troubleshooting

### ❌ "Failed to initialize session"
- Check your Supabase URL and API key in `config.js`
- Make sure database schema is installed
- Test connection using `test-connection.html`

### ❌ Menu not loading
- Verify sample data exists in `menu_items` table
- Check browser console for JavaScript errors
- Ensure Supabase project is active

### ❌ Real-time not working
- Enable replication for required tables in Supabase
- Check if WebSockets are blocked by firewall
- Test with multiple browser tabs

### ❌ QR codes not working
- Verify URL format: `https://domain.com/menu/?table=1`
- Make sure site is accessible via HTTPS
- Test QR codes with multiple devices

## Support

### Need Help?
1. Check the full documentation in `README.md`
2. Review deployment guide in `DEPLOYMENT.md`
3. Use the test connection page to diagnose issues
4. Check browser console for error messages

---

## 🎉 Congratulations!

Your enhanced QR menu system is now live with:
- ✅ Individual customer sessions
- ✅ Real-time order tracking
- ✅ Multilingual support (Arabic/English)
- ✅ Mobile-optimized design
- ✅ Comprehensive management dashboard
- ✅ Advanced analytics

**Start taking orders immediately!** 🍽️

---

*For detailed technical documentation, see README.md and DEPLOYMENT.md*

