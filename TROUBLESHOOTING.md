# Troubleshooting Guide - UNO Enhanced QR Menu System

## Common Issues and Solutions

This guide covers the most common issues you might encounter when setting up or running the UNO Enhanced QR Menu System and their solutions.

## 🔧 Setup Issues

### Issue: "Supabase client not initialized" Error

**Symptoms:**
- Error message: "Supabase client not initialized"
- Connection test fails
- No data loads in any interface

**Causes:**
- Missing or incorrect Supabase credentials
- Supabase project is paused or deleted
- Network connectivity issues

**Solutions:**
1. **Check Configuration:**
   ```javascript
   // In config.js, verify these values are correct:
   const SUPABASE_CONFIG = {
       url: 'https://your-project.supabase.co',  // ← Must be your actual URL
       anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // ← Must be your actual key
   };
   ```

2. **Verify Supabase Project:**
   - Log into [supabase.com](https://supabase.com)
   - Check if your project is active (not paused)
   - Go to Settings → API and copy the correct URL and anon key

3. **Test Connection:**
   - Open `test-connection.html`
   - Click "Test Connection"
   - Should show green success message

### Issue: "Cannot read properties of null" Errors

**Symptoms:**
- JavaScript errors in browser console
- Admin panel doesn't load properly
- Event listeners fail to attach

**Causes:**
- HTML elements referenced in JavaScript don't exist
- Scripts loading before DOM is ready
- Mismatched element IDs between HTML and JavaScript

**Solutions:**
1. **Ensure DOM is Ready:**
   ```javascript
   // Make sure scripts run after DOM loads
   document.addEventListener('DOMContentLoaded', function() {
       // Your initialization code here
   });
   ```

2. **Check Element IDs:**
   - Verify all element IDs in HTML match those in JavaScript
   - Use browser developer tools to inspect elements

3. **Add Null Checks:**
   ```javascript
   // Always check if element exists before using
   const element = document.getElementById('myElement');
   if (element) {
       element.addEventListener('click', handler);
   }
   ```

### Issue: Database Schema Not Installed

**Symptoms:**
- "relation does not exist" errors
- Empty tables in database operations
- Connection test passes but data operations fail

**Solutions:**
1. **Install Schema:**
   - Go to Supabase dashboard → SQL Editor
   - Copy content from `supabase/schema.sql`
   - Paste and run the SQL
   - Should see "Success. No rows returned"

2. **Enable Row Level Security (RLS):**
   - Go to Database → Tables
   - For each table, click the shield icon to enable RLS
   - Or run: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

3. **Enable Real-time:**
   - Go to Database → Replication
   - Turn ON replication for these tables:
     - `orders`
     - `order_items`
     - `quick_action_requests`
     - `customer_sessions`

## 🌐 Runtime Issues

### Issue: Menu Items Not Loading

**Symptoms:**
- Empty menu in customer interface
- "No items found" message
- Categories load but items don't

**Causes:**
- No menu items in database
- Items marked as unavailable
- Category filtering issues

**Solutions:**
1. **Check Database:**
   - Go to Supabase → Table Editor
   - Check `menu_items` table has data
   - Verify `is_available = true`

2. **Add Sample Data:**
   ```sql
   -- Add sample category
   INSERT INTO categories (name_en, name_ar, display_order, is_active)
   VALUES ('Appetizers', 'المقبلات', 1, true);
   
   -- Add sample menu item
   INSERT INTO menu_items (name_en, name_ar, category_id, is_available)
   VALUES ('Hummus', 'حمص', 'category-id-here', true);
   ```

3. **Check Filters:**
   - Verify category filters are not hiding items
   - Check availability filters in admin panel

### Issue: Real-time Updates Not Working

**Symptoms:**
- Orders don't appear immediately in cashier dashboard
- Status changes don't sync across devices
- No sound alerts for new orders

**Causes:**
- Real-time replication not enabled
- WebSocket connections blocked
- Subscription setup issues

**Solutions:**
1. **Enable Replication:**
   - Supabase → Database → Replication
   - Enable for all required tables

2. **Check Network:**
   - Ensure WebSockets are not blocked by firewall
   - Test with different network/device

3. **Verify Subscriptions:**
   ```javascript
   // Check if subscriptions are working
   const subscription = supabaseClient
       .channel('test-channel')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
           (payload) => console.log('Change received!', payload))
       .subscribe();
   ```

### Issue: Language Switching Not Working

**Symptoms:**
- Interface stays in one language
- Text doesn't change when language button clicked
- Mixed languages displayed

**Causes:**
- Missing translation data
- JavaScript language switching logic issues
- CSS direction (RTL/LTR) problems

**Solutions:**
1. **Check Translation Data:**
   ```javascript
   // Verify all text has both languages
   const text = {
       en: 'English text',
       ar: 'النص العربي'
   };
   ```

2. **Verify Language Toggle:**
   ```javascript
   // Ensure language switching updates all elements
   function updateLanguage() {
       document.querySelectorAll('[data-en]').forEach(element => {
           const text = currentLanguage === 'ar' ? 
               element.dataset.ar : element.dataset.en;
           element.textContent = text;
       });
   }
   ```

3. **Fix RTL Layout:**
   ```css
   /* Ensure RTL styles are applied */
   [dir="rtl"] {
       text-align: right;
       direction: rtl;
   }
   ```

## 📱 Mobile Issues

### Issue: Poor Mobile Experience

**Symptoms:**
- Interface too small on mobile
- Buttons hard to tap
- Horizontal scrolling required

**Solutions:**
1. **Check Viewport Meta Tag:**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

2. **Verify Responsive CSS:**
   ```css
   /* Ensure mobile-first responsive design */
   @media (max-width: 768px) {
       .container {
           padding: 1rem;
       }
       .btn {
           min-height: 44px; /* Touch-friendly size */
       }
   }
   ```

3. **Test on Real Devices:**
   - Use browser developer tools device simulation
   - Test on actual mobile devices
   - Check different screen sizes

### Issue: QR Code Scanning Problems

**Symptoms:**
- QR codes don't scan properly
- Wrong table numbers
- Redirect to wrong URLs

**Solutions:**
1. **Verify QR Code URLs:**
   ```
   Correct format: https://your-domain.com/menu/?table=1
   Wrong format: http://localhost:8080/menu/?table=1
   ```

2. **Test QR Codes:**
   - Use multiple QR code scanning apps
   - Verify URLs are accessible from mobile
   - Check HTTPS is working

3. **Generate New QR Codes:**
   - Use reliable QR code generators
   - Test each code before printing
   - Include error correction

## 🔊 Audio Issues

### Issue: Sound Alerts Not Playing

**Symptoms:**
- No sound when new orders arrive
- Audio toggle button doesn't work
- Browser blocks audio playback

**Solutions:**
1. **Check Browser Permissions:**
   - Allow audio autoplay for the site
   - Check browser audio settings
   - Try user interaction before playing audio

2. **Verify Audio Files:**
   ```javascript
   // Test if audio files load
   const audio = new Audio('new-order.mp3');
   audio.addEventListener('canplaythrough', () => {
       console.log('Audio loaded successfully');
   });
   ```

3. **Handle Autoplay Restrictions:**
   ```javascript
   // Play audio only after user interaction
   document.addEventListener('click', () => {
       audio.play().catch(e => console.log('Audio play failed:', e));
   }, { once: true });
   ```

## 🚀 Performance Issues

### Issue: Slow Loading Times

**Symptoms:**
- Pages take long to load
- Database queries are slow
- Interface feels sluggish

**Solutions:**
1. **Optimize Database Queries:**
   - Add proper indexes to frequently queried columns
   - Limit query results with pagination
   - Use selective field loading

2. **Enable Caching:**
   ```javascript
   // Cache frequently accessed data
   const cache = new Map();
   
   async function getCachedData(key, fetchFunction) {
       if (cache.has(key)) {
           return cache.get(key);
       }
       const data = await fetchFunction();
       cache.set(key, data);
       return data;
   }
   ```

3. **Optimize Assets:**
   - Compress images
   - Minify CSS and JavaScript
   - Use CDN for static assets

### Issue: Memory Leaks

**Symptoms:**
- Browser becomes slow over time
- High memory usage
- Page crashes after extended use

**Solutions:**
1. **Clean Up Subscriptions:**
   ```javascript
   // Always unsubscribe when done
   const subscription = supabaseClient.channel('orders');
   // Later...
   subscription.unsubscribe();
   ```

2. **Remove Event Listeners:**
   ```javascript
   // Clean up event listeners
   function cleanup() {
       document.removeEventListener('click', handler);
       clearInterval(intervalId);
   }
   ```

3. **Monitor Memory Usage:**
   - Use browser developer tools
   - Check for memory leaks regularly
   - Implement proper cleanup procedures

## 🛠️ Development Issues

### Issue: Local Development Setup

**Symptoms:**
- Can't run project locally
- CORS errors
- File not found errors

**Solutions:**
1. **Use Local Server:**
   ```bash
   # Don't open HTML files directly, use a server
   python3 -m http.server 8080
   # or
   npx serve .
   ```

2. **Fix CORS Issues:**
   - Always use http://localhost, not file://
   - Configure Supabase CORS settings if needed
   - Use proper development server

3. **Check File Paths:**
   - Use relative paths for local files
   - Verify all referenced files exist
   - Check case sensitivity on Linux/Mac

## 📞 Getting Help

### When to Seek Additional Support

If you've tried the solutions above and still have issues:

1. **Check Browser Console:**
   - Press F12 to open developer tools
   - Look for error messages in Console tab
   - Note the exact error text and line numbers

2. **Verify Environment:**
   - Test in different browsers
   - Try incognito/private mode
   - Check on different devices

3. **Document the Issue:**
   - What were you trying to do?
   - What happened instead?
   - What error messages appeared?
   - What steps did you already try?

### Useful Resources

- **Supabase Documentation:** [supabase.com/docs](https://supabase.com/docs)
- **Bootstrap Documentation:** [getbootstrap.com](https://getbootstrap.com)
- **MDN Web Docs:** [developer.mozilla.org](https://developer.mozilla.org)

---

## 🎯 Prevention Tips

### Best Practices to Avoid Issues

1. **Always Test Changes:**
   - Test in multiple browsers
   - Verify on mobile devices
   - Check all user flows

2. **Keep Backups:**
   - Export database regularly
   - Keep working configuration files
   - Document any customizations

3. **Monitor Performance:**
   - Check loading times regularly
   - Monitor database usage
   - Watch for memory leaks

4. **Stay Updated:**
   - Keep Supabase project active
   - Update dependencies when needed
   - Review security settings periodically

---

This troubleshooting guide covers the most common issues. For additional help, refer to the complete documentation in README.md and CONFIGURATION.md files.

