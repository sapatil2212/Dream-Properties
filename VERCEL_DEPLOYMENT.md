# Vercel Deployment Guide - Dream Properties Next.js Full-Stack

## Prerequisites
1. GitHub repository: https://github.com/sapatil2212/Dream-Properties.git
2. Vercel account connected to GitHub
3. TiDB Cloud MySQL database running

## Deployment Steps

### 1. Import Project to Vercel
1. Go to https://vercel.com/new
2. Import from GitHub: `sapatil2212/Dream-Properties`
3. Framework Preset: **Next.js**
4. Root Directory: `./` (default)

### 2. Configure Environment Variables

Add these environment variables in Vercel Project Settings:

```bash
# Database (TiDB Cloud)
DATABASE_URL=mysql://W8rgNqHKvNaS2B8.root:zl7zf9N1cCFHve7R@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/dream_properties?sslaccept=strict

# NextAuth (IMPORTANT: Update NEXTAUTH_URL to your Vercel domain)
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=50c4f15eaa6e228826000c9eb941e2f9a2acaf4ab9683c63cfa8f86a6f842332
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-key-change-this

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=dreampropertiesnashik@gmail.com
EMAIL_PASSWORD=cqfjbwwoyqltxsfo

# File Upload
MAX_FILE_SIZE=5242880

# Cloudinary
CLOUDINARY_CLOUD_NAME=drctoxvtl
CLOUDINARY_API_KEY=294341866592413
CLOUDINARY_API_SECRET=pD3c1BvgzpZd9FVOvleG-daazL8
CLOUDINARY_URL=cloudinary://294341866592413:pD3c1BvgzpZd9FVOvleG-daazL8@root

# Super Admin
SUPER_ADMIN_EMAIL=dreampropertiesnashik@gmail.com
SUPER_ADMIN_PASSWORD=Dreamproperties@2026
SUPER_ADMIN_SECURITY_KEY=swapnil2212

# CORS (Update to your Vercel domain)
FRONTEND_URL=https://your-app-name.vercel.app
```

### 3. Build Configuration

**Build Command:**
```bash
prisma generate && next build
```

**Install Command:**
```bash
npm install
```

**Note:** The project includes a `.npmrc` file with `legacy-peer-deps=true` to handle dependency conflicts automatically.

**Output Directory:** `.next` (default)

### 4. Deploy

Click **Deploy** button in Vercel dashboard.

## Post-Deployment Steps

### 1. Update NEXTAUTH_URL
After first deployment, update `NEXTAUTH_URL` environment variable with your actual Vercel URL:
```
NEXTAUTH_URL=https://your-actual-domain.vercel.app
```

### 2. Verify Database Connection
Check deployment logs for successful Prisma connection to TiDB Cloud.

### 3. Test Authentication
1. Navigate to `/login`
2. Test Super Admin login with credentials from `.env`
3. Test user registration and OTP flow

### 4. Test Features
- ✅ Property browsing
- ✅ Builder dashboard
- ✅ Admin approval workflow
- ✅ Staff dashboards (Telecaller/Sales)
- ✅ Favorites functionality
- ✅ Search functionality

## Troubleshooting

### Build Fails
- Check if all environment variables are set
- Verify `DATABASE_URL` includes `?sslaccept=strict`
- Ensure Prisma schema is committed to Git

### Authentication Issues
- Verify `NEXTAUTH_URL` matches your Vercel domain (no trailing slash)
- Check `NEXTAUTH_SECRET` is set correctly
- Ensure database connection is working

### Database Connection Issues
- TiDB Cloud requires SSL: use `?sslaccept=strict` in connection string
- Verify database credentials are correct
- Check if TiDB Cloud cluster is running

### Image Upload Issues
- Verify Cloudinary credentials
- Check `MAX_FILE_SIZE` is set
- Ensure API routes are accessible

## Performance Optimization

### Edge Runtime (Optional)
For faster API responses, you can enable Edge runtime for specific routes:

```typescript
// app/api/properties/route.ts
export const runtime = 'edge'; // Optional
```

### ISR (Incremental Static Regeneration)
Property pages can use ISR for better performance:

```typescript
export const revalidate = 3600; // Revalidate every hour
```

## Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Error Tracking**: Check Vercel logs for runtime errors
3. **Database Monitoring**: Use TiDB Cloud dashboard

## Security Checklist

- ✅ Environment variables are set and not exposed
- ✅ API routes have proper authentication checks
- ✅ Database uses SSL connection
- ✅ CORS is configured correctly
- ✅ File upload size limits are enforced
- ✅ Password hashing is implemented (bcrypt)

## Support

For issues:
1. Check Vercel deployment logs
2. Review build output
3. Test locally with production env variables
4. Contact swapnil2212 for database access

---

**Your Dream Properties SaaS is now deployed on Vercel! 🚀**
