# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage correctly for the file upload app.

## Step-by-Step Setup

### 1. Create a Supabase Project (If You Haven't Already)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in the details:
   - **Name**: Your project name
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for testing
5. Click **"Create new project"**
6. Wait for the project to be created (takes 1-2 minutes)

### 2. Create a Storage Bucket

1. In your Supabase dashboard, click **"Storage"** in the left sidebar
2. Click **"Create a new bucket"** button
3. Configure the bucket:
   - **Name**: `uploads` (or any name you prefer, but remember it!)
   - **Public bucket**: ✅ **Check this box** (makes files publicly accessible)
   - **File size limit**: Leave default or set to 50MB
   - **Allowed MIME types**: Leave empty to allow all file types
4. Click **"Create bucket"**

### 3. Set Bucket Policies (IMPORTANT!)

If uploads are failing, you need to set proper policies:

1. Click on your `uploads` bucket
2. Click on **"Policies"** tab (or find it in the Storage settings)
3. You should see policy options. Click **"New Policy"** if none exist

#### Option A: Quick Setup (Allow All - Good for Testing)

Click **"New Policy"** → **"For full customization"** and add these policies:

**Policy 1: Allow Public Uploads**
```sql
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'uploads');
```

**Policy 2: Allow Public Reads**
```sql
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');
```

**Policy 3: Allow Public Deletes (Optional)**
```sql
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'uploads');
```

#### Option B: Use the Simple Toggle (Easier)

1. Go to **Storage** → **Policies**
2. Find your bucket
3. Toggle on these permissions:
   - ✅ **INSERT** (Allow uploads)
   - ✅ **SELECT** (Allow viewing/listing)
   - ✅ **UPDATE** (Optional)
   - ✅ **DELETE** (Optional)

### 4. Get Your API Keys

1. Click on **"Settings"** (gear icon) in the left sidebar
2. Click on **"API"** section
3. You'll see two important values:

   **Project URL:**
   ```
   https://your-project-id.supabase.co
   ```

   **API Keys:**
   - `anon` `public` key - Use this for client-side operations
   - `service_role` key - Use this for server-side operations (has admin rights)

4. **For this app**, you can use either:
   - `anon public` key (recommended for basic operations)
   - `service_role` key (if you need full admin access)

### 5. Configure Your App

#### For Local Development:

Edit your `.env` file:
```env
SUPABASE_URL=https://hfvezfqtlyegograuxqa.supabase.co
SUPABASE_KEY=your_actual_api_key_here
SUPABASE_BUCKET=uploads
PORT=3001
```

Replace:
- `your_actual_api_key_here` with your Supabase API key
- `uploads` with your bucket name (if you named it differently)

#### For Render Deployment:

Add these environment variables in Render:
1. Go to your Render dashboard
2. Select your web service
3. Go to **"Environment"** tab
4. Add these variables:
   - `SUPABASE_URL` = `https://hfvezfqtlyegograuxqa.supabase.co`
   - `SUPABASE_KEY` = Your Supabase API key
   - `SUPABASE_BUCKET` = `uploads`
   - `NODE_ENV` = `production`
   - `PORT` = `3001`

## Troubleshooting

### Error: "Failed to upload file to storage"

**Common Causes:**

1. **Bucket doesn't exist**
   - Go to Storage and verify the bucket name matches your `SUPABASE_BUCKET` env variable

2. **No upload permissions**
   - Check bucket policies (see Step 3 above)
   - Make sure the bucket is set to **Public** or has proper policies

3. **Wrong API key**
   - Verify you copied the correct API key from Settings → API
   - Make sure there are no extra spaces or characters

4. **Bucket name mismatch**
   - Check that `SUPABASE_BUCKET` env variable matches your actual bucket name
   - Bucket names are case-sensitive!

### Error: "New row violates row-level security policy"

This means you need to add storage policies:
- Follow **Step 3** above to add policies
- Or make the bucket public

### Error: "Invalid JWT" or "Authentication failed"

Your API key is incorrect:
- Go to Supabase → Settings → API
- Copy the correct API key
- Update your `.env` file or Render environment variables
- Restart your app

## Testing Your Setup

1. Start your app locally:
   ```bash
   npm run dev
   ```

2. Open the browser and try uploading a small file

3. If it works, check your Supabase Storage:
   - Go to Storage → uploads bucket
   - You should see the uploaded file

4. If it fails, check the server logs for the specific error message

## Security Best Practices

For production apps, consider:

1. **Use Row Level Security (RLS)** policies instead of making bucket fully public
2. **Add file size limits** in bucket settings
3. **Restrict file types** if needed
4. **Use authenticated uploads** (require users to log in)
5. **Add rate limiting** to prevent abuse
6. **Use service_role key only on server-side**, never expose it in client code

## Need Help?

- Supabase Docs: https://supabase.com/docs/guides/storage
- Supabase Discord: https://discord.supabase.com
- Check server logs for detailed error messages

