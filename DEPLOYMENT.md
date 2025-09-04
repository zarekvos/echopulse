# Echo Pulse Mini App Deployment Guide

## Production Setup

### 1. Domain & Hosting Setup

**Requirements:**
- HTTPS domain (required for Farcaster Mini Apps)
- Static hosting for frontend files
- Node.js server for webhook endpoint

**Recommended Stack:**
- Frontend: Vercel, Netlify, or GitHub Pages
- Backend: Railway, Heroku, or VPS with Node.js
- Database: PostgreSQL, MongoDB, or Redis for production

### 2. Environment Configuration

Create `.env` file:
```env
# Production Environment
NODE_ENV=production
PORT=3000

# Farcaster Configuration
FARCASTER_WEBHOOK_SECRET=your-webhook-secret-here
FARCASTER_ACCOUNT_KEY=your-account-private-key
FARCASTER_FID=your-farcaster-fid

# Database (choose one)
DATABASE_URL=your-database-connection-string
REDIS_URL=your-redis-connection-string

# Web3 Configuration
WEB3_PROVIDER_URL=https://mainnet.base.org
CONTRACT_ADDRESS=your-deployed-contract-address
PRIVATE_KEY=your-contract-deploy-key

# Domain Configuration
FRONTEND_URL=https://your-domain.com
WEBHOOK_URL=https://your-domain.com/api/webhook
```

### 3. Account Association Setup

**Update farcaster.json with your details:**
```json
{
  "accountAssociation": {
    "header": "your-signed-header",
    "payload": "your-account-payload",
    "signature": "your-signature"
  },
  "frame": {
    "name": "Echo Pulse",
    "iconUrl": "https://your-domain.com/icon-192.png",
    "homeUrl": "https://your-domain.com",
    "webhookUrl": "https://your-domain.com/api/webhook"
  }
}
```

### 4. Deployment Steps

#### Step 1: Deploy Frontend
```bash
# Build for production
npm run build

# Deploy to static hosting
# For Vercel:
vercel --prod

# For Netlify:
netlify deploy --prod --dir=dist
```

#### Step 2: Deploy Backend
```bash
# Deploy webhook server
# For Railway:
railway deploy

# For Heroku:
git push heroku main
```

#### Step 3: Configure DNS
- Point your domain to hosting provider
- Ensure HTTPS is enabled
- Test webhook endpoint accessibility

### 5. Account Association Process

**Generate Account Association:**
```bash
# Install Farcaster Utils
npm install @farcaster/core

# Generate association (run locally)
node scripts/generate-account-association.js
```

**Update your farcaster.json:**
- Replace placeholder values with generated association
- Commit and deploy updated manifest

### 6. Testing Checklist

- [ ] Frontend loads correctly on HTTPS domain
- [ ] All game features work properly
- [ ] Farcaster SDK integration functional
- [ ] Webhook endpoint responds to health checks
- [ ] Notifications can be sent successfully
- [ ] Share extensions work correctly
- [ ] PWA installation works on mobile
- [ ] Web3 features connect properly

### 7. Monitoring & Analytics

**Setup monitoring for:**
- Webhook endpoint uptime
- Game performance metrics
- User engagement data
- Error tracking and logging
- Notification delivery rates

**Recommended tools:**
- Sentry for error tracking
- Google Analytics for user metrics
- UptimeRobot for endpoint monitoring

### 8. Security Considerations

- Validate all webhook signatures
- Rate limit API endpoints
- Sanitize user inputs
- Use environment variables for secrets
- Enable CORS only for trusted domains
- Implement proper authentication for admin endpoints

### 9. Performance Optimization

- Enable gzip compression
- Use CDN for static assets
- Implement service worker caching
- Optimize game assets and textures
- Add database indexes for queries
- Use connection pooling for database

### 10. Backup & Recovery

- Regular database backups
- Source code version control
- Environment variable backup
- SSL certificate renewal automation
- Disaster recovery procedures

## Production Launch Steps

1. **Pre-launch Testing**
   - Test all features in staging environment
   - Verify Mini App works in Warpcast
   - Check mobile responsiveness
   - Validate webhook integration

2. **Deploy to Production**
   - Deploy frontend and backend
   - Update DNS records
   - Configure monitoring
   - Test live endpoints

3. **Submit for Review** (if required)
   - Submit Mini App to Farcaster
   - Provide required documentation
   - Address any feedback

4. **Go Live**
   - Announce to community
   - Monitor performance
   - Gather user feedback
   - Plan future updates

## Post-Launch Maintenance

- Monitor error logs daily
- Update dependencies regularly
- Backup data weekly
- Review performance metrics
- Plan feature updates
- Engage with user community

## Troubleshooting

**Common Issues:**
- Webhook not receiving events: Check endpoint accessibility and signatures
- Mini App not loading: Verify HTTPS and farcaster.json configuration
- Notifications not sending: Check token storage and API endpoints
- Game performance issues: Optimize assets and code splitting
