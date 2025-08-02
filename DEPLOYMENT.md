# Deployment Guide - UNO Enhanced QR Menu System

## Overview

This guide provides step-by-step instructions for deploying the UNO Enhanced QR Menu System to various hosting platforms. The system is designed as a pure client-side application that can be deployed to any static hosting service.

## Prerequisites

Before deployment, ensure you have:

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Project Files**: Complete application files from this repository
3. **Domain/Hosting**: Access to a web hosting service or domain
4. **QR Code Generator**: Tool to generate QR codes for tables

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `uno-restaurant-menu`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
5. Click "Create new project"
6. Wait for project initialization (2-3 minutes)

### 1.2 Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.3 Configure Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy the entire content from `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema
6. Verify all tables are created in the **Table Editor**

### 1.4 Enable Real-time

1. Go to **Database** → **Replication**
2. Enable replication for the following tables:
   - `orders`
   - `order_items`
   - `quick_action_requests`
   - `customer_sessions`
   - `restaurant_tables`

## Step 2: Application Configuration

### 2.1 Update Configuration File

Edit `config.js` and replace the placeholder values:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your-anon-key-here'
};
```

### 2.2 Customize Restaurant Settings

Update the restaurant information in `config.js`:

```javascript
const APP_CONFIG = {
    restaurantName: {
        en: 'Your Restaurant Name',
        ar: 'اسم مطعمك'
    },
    restaurantDescription: {
        en: 'Your restaurant description',
        ar: 'وصف مطعمك'
    },
    // ... other settings
};
```

### 2.3 Test Configuration

1. Open `test-connection.html` in a web browser
2. Click "Test Connection" to verify Supabase connectivity
3. Run database and real-time tests
4. Ensure all tests pass before proceeding

## Step 3: Deployment Options

### Option A: Netlify (Recommended)

#### 3.1 Deploy via Drag & Drop

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Drag the entire project folder to the deploy area
3. Wait for deployment to complete
4. Note your site URL (e.g., `https://amazing-site-name.netlify.app`)

#### 3.2 Deploy via Git (Advanced)

1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Configure build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `/`
4. Deploy the site

#### 3.3 Custom Domain (Optional)

1. Go to **Domain settings** in Netlify
2. Add your custom domain
3. Configure DNS settings as instructed
4. Enable HTTPS (automatic with Netlify)

### Option B: Vercel

#### 3.1 Deploy via CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to project directory
3. Run `vercel` and follow prompts
4. Choose settings:
   - **Framework**: Other
   - **Build command**: (leave empty)
   - **Output directory**: `./`

#### 3.2 Deploy via Git

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import project
3. Configure project settings
4. Deploy

### Option C: GitHub Pages

#### 3.1 Setup Repository

1. Create a new GitHub repository
2. Upload all project files
3. Go to **Settings** → **Pages**
4. Select source: **Deploy from a branch**
5. Choose **main** branch and **/ (root)**
6. Save settings

#### 3.2 Access Site

Your site will be available at:
`https://your-username.github.io/repository-name`

### Option D: Traditional Web Hosting

#### 3.1 FTP Upload

1. Connect to your web hosting via FTP
2. Upload all files to the public_html directory
3. Ensure file permissions are set correctly
4. Test the site at your domain

#### 3.2 cPanel File Manager

1. Login to cPanel
2. Open File Manager
3. Navigate to public_html
4. Upload and extract project files
5. Set appropriate permissions

## Step 4: QR Code Generation

### 4.1 Generate Table QR Codes

For each table, create QR codes that link to:
```
https://your-domain.com/customer/?table=TABLE_NUMBER
```

Examples:
- Table 1: `https://your-domain.com/customer/?table=1`
- Table 2: `https://your-domain.com/customer/?table=2`
- Table 15: `https://your-domain.com/customer/?table=15`

### 4.2 QR Code Tools

Use any of these free QR code generators:
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)
- [Google Charts QR API](https://developers.google.com/chart/infographics/docs/qr_codes)

### 4.3 QR Code Best Practices

1. **Size**: Minimum 2cm x 2cm for easy scanning
2. **Placement**: Eye-level on tables, protected from spills
3. **Material**: Laminated or waterproof material
4. **Testing**: Test all QR codes before printing
5. **Backup**: Include table number as text below QR code

## Step 5: Testing Deployment

### 5.1 Functional Testing

1. **Navigation**: Test main navigation page
2. **Customer Flow**: 
   - Scan QR code or visit customer URL
   - Create session
   - Browse menu
   - Place order
   - Check order status
3. **Cashier Dashboard**:
   - View orders
   - Update order status
   - Handle service requests
4. **Real-time Features**:
   - Test live order updates
   - Verify notifications work
   - Check cross-device synchronization

### 5.2 Performance Testing

1. **Load Time**: Ensure pages load within 3 seconds
2. **Mobile Performance**: Test on various mobile devices
3. **Network Conditions**: Test on slow connections
4. **Concurrent Users**: Test multiple simultaneous orders

### 5.3 Browser Compatibility

Test on:
- **Mobile**: Safari (iOS), Chrome (Android)
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Tablets**: iPad Safari, Android Chrome

## Step 6: Production Configuration

### 6.1 Security Settings

1. **Supabase RLS**: Ensure Row Level Security is enabled
2. **API Keys**: Verify only anon key is used in client
3. **HTTPS**: Ensure site is served over HTTPS
4. **CORS**: Configure if needed for custom domains

### 6.2 Performance Optimization

1. **Image Compression**: Optimize any custom images
2. **Caching**: Configure browser caching headers
3. **CDN**: Consider using a CDN for global performance
4. **Monitoring**: Set up error tracking and analytics

### 6.3 Backup Strategy

1. **Database Backup**: Enable automatic Supabase backups
2. **Code Backup**: Maintain code in version control
3. **Configuration Backup**: Document all configuration settings
4. **Recovery Plan**: Create disaster recovery procedures

## Step 7: Staff Training

### 7.1 Cashier Training

1. **Dashboard Overview**: Familiarize with interface
2. **Order Management**: Practice updating order status
3. **Service Requests**: Learn to handle customer requests
4. **Troubleshooting**: Basic problem-solving procedures

### 7.2 Customer Support

1. **QR Code Issues**: Help customers scan codes
2. **Session Problems**: Assist with session creation
3. **Order Questions**: Guide through ordering process
4. **Technical Support**: Basic troubleshooting steps

## Step 8: Monitoring and Maintenance

### 8.1 Regular Monitoring

1. **System Health**: Check application status daily
2. **Database Performance**: Monitor query performance
3. **Error Logs**: Review error reports regularly
4. **User Feedback**: Collect and address user issues

### 8.2 Maintenance Tasks

1. **Data Cleanup**: Remove old sessions and orders
2. **Security Updates**: Keep dependencies updated
3. **Performance Review**: Analyze and optimize performance
4. **Feature Updates**: Plan and implement improvements

## Troubleshooting Common Issues

### Issue 1: QR Codes Not Working

**Symptoms**: QR codes don't redirect properly
**Solutions**:
- Verify URL format is correct
- Check domain is accessible
- Test QR codes with multiple devices
- Ensure HTTPS is working

### Issue 2: Database Connection Errors

**Symptoms**: "Failed to connect" errors
**Solutions**:
- Verify Supabase URL and API key
- Check Supabase project status
- Test connection using test page
- Review browser console for errors

### Issue 3: Real-time Updates Not Working

**Symptoms**: Orders don't update in real-time
**Solutions**:
- Enable real-time replication in Supabase
- Check WebSocket connectivity
- Verify subscription code is correct
- Test with multiple browser tabs

### Issue 4: Mobile Display Issues

**Symptoms**: Layout problems on mobile devices
**Solutions**:
- Check viewport meta tag
- Test responsive CSS
- Verify touch interactions work
- Test on actual devices, not just browser dev tools

## Support Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Bootstrap Documentation](https://getbootstrap.com/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)

### Community Support
- [Supabase Discord](https://discord.supabase.com/)
- [Stack Overflow](https://stackoverflow.com/)
- [GitHub Issues](https://github.com/)

### Professional Support
For professional deployment assistance or custom modifications, consider hiring experienced developers familiar with:
- Supabase and PostgreSQL
- Frontend web development
- Restaurant technology systems
- Mobile-first responsive design

## Conclusion

Following this deployment guide will result in a fully functional, production-ready QR menu system. The system is designed to be robust, scalable, and easy to maintain while providing an excellent user experience for both customers and restaurant staff.

Remember to test thoroughly before going live and have a rollback plan in case of issues. Regular monitoring and maintenance will ensure optimal performance and customer satisfaction.

---

**Need Help?** If you encounter issues during deployment, refer to the troubleshooting section or seek assistance from the development community.

