# Prerender.io Setup Guide

## Current Configuration

The project is configured with Prerender.io for SEO optimization and search engine bot support.

### Integration Details

**Location**: Both `server/index.ts` (local dev) and `api/index.ts` (Vercel serverless)

**Token**: `I4uHr0qjG3h3fbyJt9XZ` (stored in `.env` as `Prerender_API_TOKEN`)

**Configuration**:
```typescript
prerender
  .set("prerenderToken", process.env.Prerender_API_TOKEN)
  .set("protocol", "https")
  .set("host", "service.prerender.io")
```

### Middleware Order (CRITICAL)

✅ **Correct Order**:
1. Body parsing middleware (`express.json()`, `express.urlencoded()`)
2. **Prerender middleware** ← Must come AFTER body parsers
3. Application routes

⚠️ If Prerender is placed BEFORE body parsers, it may not work correctly.

## Testing Prerender.io Integration

### 1. Test with User-Agent Header

Use the Prerender bot user-agent to test if your site is being pre-rendered:

```bash
curl -A "Prerender (+https://github.com/prerender/prerender)" https://abqary.com/
```

Expected response: Fully rendered HTML with dynamic content.

### 2. Use Prerender.io Dashboard

1. Go to https://dashboard.prerender.io
2. Navigate to "Test Your Integration"
3. Enter your URL: `https://abqary.com/`
4. Click "Test Integration"

### 3. Check if Bot is Detected

The Prerender middleware detects these user-agents:
- Googlebot
- Bingbot
- Slackbot
- Twitterbot
- Facebookbot
- LinkedInBot
- WhatsApp
- And many more...

## Common Issues & Solutions

### Issue: "Integration not detected"

**Possible Causes**:
1. ❌ Middleware order is wrong (Prerender before body parsers)
2. ❌ Environment variable not set on Vercel
3. ❌ IP restrictions blocking Prerender.io servers
4. ❌ CDN caching preventing Prerender from reaching your server

**Solutions**:

#### 1. Verify Environment Variables on Vercel
```bash
# Check Vercel environment variables
vercel env ls

# Should show:
# Prerender_API_TOKEN = I4uHr0qjG3h3fbyJt9XZ
```

If not set:
```bash
vercel env add Prerender_API_TOKEN
# Enter: I4uHr0qjG3h3fbyJt9XZ
# Select: Production, Preview, Development
```

#### 2. Whitelist Prerender.io IP Addresses

If your site has IP restrictions, whitelist these Prerender.io server IPs:

```
52.9.160.234
54.215.176.102
52.53.244.78
13.52.138.38
54.215.131.0
52.9.32.174
```

Documentation: https://docs.prerender.io/docs/22-ip-addresses

#### 3. Check CDN Configuration

If using Cloudflare, Fastly, or similar:
- Ensure bot traffic is NOT cached
- Allow Prerender.io IPs to bypass cache
- Set cache rules to pass through for bot user-agents

#### 4. Verify HTTPS Protocol

Ensure your site is accessible via HTTPS:
```bash
curl -I https://abqary.com/
# Should return 200 OK, not redirect loops
```

### Issue: "Bot restrictions on your website"

Check `robots.txt`:
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout

Sitemap: https://abqary.com/sitemap.xml
```

✅ Good: Allows all user-agents (including Prerender bot)
❌ Bad: `Disallow: /` would block Prerender

## Sitemap Configuration

Current sitemap includes:
- `/` - Homepage (priority 1.0)
- `/faq` - FAQ page (priority 0.8)
- `/join-us` - Teacher recruitment (priority 0.8)
- `/privacy` - Privacy policy (priority 0.3)
- `/terms` - Terms of service (priority 0.3)

Accessible at: `https://abqary.com/sitemap.xml`

## Vercel Deployment

### Deploy Command
```bash
npm run build
vercel --prod
```

### Environment Variables Required
- `MONGODB_URI` - MongoDB connection string
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `Prerender_API_TOKEN` - Prerender.io token (`I4uHr0qjG3h3fbyJt9XZ`)
- `ADMIN_USERNAME` - Admin dashboard username
- `ADMIN_PASSWORD_HASH` - Bcrypt hashed admin password
- `SESSION_SECRET` - Session encryption secret

## Testing After Deployment

### 1. Test Homepage
```bash
curl -A "Prerender" https://abqary.com/
```

### 2. Test Teacher Recruitment Page
```bash
curl -A "Googlebot" https://abqary.com/join-us
```

### 3. Check Prerender Dashboard
- Log in to https://dashboard.prerender.io
- Check "Cached Pages" to see if pages are being cached
- Review "API Usage" to confirm requests are coming through

### 4. Google Search Console
After deployment:
1. Submit sitemap to Google Search Console
2. Request indexing for key pages
3. Monitor for crawl errors

## Structured Data (SEO)

The following pages have structured data:

### Homepage (`/`)
- `Organization` schema
- Contact information
- Social profiles
- Logo

### Teacher Recruitment (`/join-us`)
- `JobPosting` schema
- Employment type: PART_TIME
- Job location: Egypt
- Organization: Abqary

## Support Resources

- Prerender.io Docs: https://docs.prerender.io
- Prerender.io Dashboard: https://dashboard.prerender.io
- Prerender GitHub: https://github.com/prerender/prerender
- IP Whitelist: https://docs.prerender.io/docs/22-ip-addresses

## Quick Troubleshooting Checklist

- [ ] Environment variable `Prerender_API_TOKEN` is set on Vercel
- [ ] Middleware order: body parsers → prerender → routes
- [ ] Site is accessible via HTTPS without errors
- [ ] robots.txt allows bot access
- [ ] Sitemap is accessible and includes all pages
- [ ] No IP restrictions blocking Prerender.io servers (52.9.x.x, 54.215.x.x, etc.)
- [ ] CDN (if any) is configured to allow bot traffic
- [ ] Test with curl using bot user-agent shows rendered content

## Contact

If issues persist after following this guide:
1. Check Prerender.io dashboard for error logs
2. Review Vercel function logs for errors
3. Contact Prerender.io support with your site URL and token
