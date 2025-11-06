# Deploying to Vercel

This guide will help you deploy your Veritus project to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your project pushed to GitHub, GitLab, or Bitbucket
3. Firebase project configured

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub

1. Make sure your code is committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

#### Firebase Client SDK (Public Variables)
These are exposed to the browser, so they start with `NEXT_PUBLIC_`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### Firebase Admin SDK (Server-Only Variables)
These are only used on the server:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`, you need to include the `\n` characters or replace them with actual newlines
- In Vercel, you can paste the private key with actual line breaks - Vercel will handle it correctly
- The private key should be the full key from your Firebase service account JSON file

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your project
3. Your site will be live at `your-project.vercel.app`

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

From your project root:

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No** (first time) or **Yes** (if redeploying)
- Project name? Enter a name or press Enter for default
- Directory? Press Enter (uses current directory)
- Override settings? **No**

### Step 4: Set Environment Variables

```bash
# Set public Firebase variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID

# Set server-only Firebase Admin variables
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY
```

For each command, you'll be prompted to:
- Enter the value
- Select environments (Production, Preview, Development) - select all three

### Step 5: Redeploy

After adding environment variables, redeploy:

```bash
vercel --prod
```

## Getting Your Firebase Credentials

### Client SDK Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll to **Your apps** section
5. If you don't have a web app, click **Add app** → **Web** (</> icon)
6. Copy the values from the `firebaseConfig` object

### Admin SDK Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. Extract these values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

## Firebase Configuration for Production

### Update Authorized Domains

1. Go to Firebase Console → **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Add your Vercel domain:
   - `your-project.vercel.app`
   - `your-custom-domain.com` (if you add one)

### Update OAuth Redirect URLs

If you're using Google Sign-In:
1. Go to **Authentication** → **Sign-in method** → **Google**
2. Add authorized redirect URIs:
   - `https://your-project.vercel.app`
   - `https://your-custom-domain.com`

## Build Settings

Vercel will auto-detect Next.js, but you can verify in **Project Settings** → **General**:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (or `next build`)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install`

## Custom Domain (Optional)

1. Go to your project on Vercel
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update Firebase authorized domains with your custom domain

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `package.json` has correct build script

### Firebase Errors

- Verify all environment variables are set correctly
- Check Firebase authorized domains include your Vercel URL
- Ensure Firebase project is active

### Environment Variables Not Working

- Make sure variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch → Production deployment
- Every pull request → Preview deployment
- Automatic rollback on build failure

## Useful Commands

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Remove deployment
vercel remove
```

## Next Steps

After deployment:
1. Test all authentication flows
2. Verify email verification works
3. Test password reset functionality
4. Check API routes are working
5. Monitor Vercel analytics for performance

