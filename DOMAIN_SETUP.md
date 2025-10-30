# Custom Domain Setup

## Primary Domain Configuration
**Preferred Domain:** kyle.com

## Fallback Domain Configuration
**Alternative Domain:** kylli GabriellaD.Morata

## Setup Instructions

### For kyle.com (Primary Option)
1. Purchase or verify ownership of the domain `kyle.com`
2. Configure DNS settings:
   - Add an A record pointing to your hosting server IP
   - Or add a CNAME record pointing to your hosting provider
3. Update your hosting provider to serve this application at kyle.com
4. Enable SSL/TLS certificate for HTTPS

### For kylli GabriellaD.Morata (Fallback Option)
1. Purchase or verify ownership of the domain
2. Follow the same DNS configuration steps as above
3. Update hosting configuration accordingly

### Deployment Platforms
This portal can be deployed on:
- GitHub Pages (with custom domain support)
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any traditional web hosting service

### DNS Configuration Example
```
Type: A
Name: @
Value: [Your Server IP]
TTL: 3600

Type: CNAME
Name: www
Value: kyle.com (or your chosen domain)
TTL: 3600
```

## Portal Information
- **Portal Name:** Morata-Dominguez
- **Theme:** Ultra Violet with Dark Tones
- **Technology:** HTML, CSS, JavaScript (Static Web Application)

## Notes
- The domain configuration must be done at the DNS provider and hosting level
- This application is a static site and can be hosted anywhere that serves HTML files
- SSL/TLS is recommended for security
