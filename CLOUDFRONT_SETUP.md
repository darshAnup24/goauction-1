# CloudFront Setup Guide

This guide walks you through setting up AWS S3 and CloudFront for scalable video delivery in your GoAuction application.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed (optional but recommended)
- Access to AWS Console

## Step 1: Create S3 Bucket for Videos

1. **Login to AWS Console**
   - Navigate to S3 service
   - Click "Create bucket"

2. **Configure Bucket**
   - **Bucket name**: `goauction-videos` (must be globally unique, adjust if needed)
   - **Region**: Choose the same region as your existing resources (e.g., `us-east-1` or `eu-north-1`)
   - **Block Public Access settings**: Keep blocked for now (CloudFront will access)
   - Click "Create bucket"

3. **Configure CORS**
   - Go to your bucket → Permissions → CORS
   - Add the following CORS configuration:
   
   ```json
   [
       {
           "AllowedHeaders": ["*"],
           "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
           "AllowedOrigins": [
               "http://localhost:3000",
               "http://localhost:5000",
               "https://yourdomain.com"
           ],
           "ExposeHeaders": ["ETag"]
       }
   ]
   ```

4. **Bucket Policy** (Optional - for CloudFront Origin Access)
   - Go to Permissions → Bucket Policy
   - We'll configure this after setting up CloudFront

## Step 2: Create CloudFront Distribution

1. **Navigate to CloudFront**
   - Go to AWS Console → CloudFront
   - Click "Create Distribution"

2. **Origin Settings**
   - **Origin domain**: Select your S3 bucket (`goauction-videos.s3.amazonaws.com`)
   - **Origin access**: Choose "Origin access control settings (recommended)"
   - Click "Create new OAC" if you don't have one
   - **Name**: `goauction-videos-oac`
   - Click "Create"

3. **Default Cache Behavior**
   - **Viewer protocol policy**: "Redirect HTTP to HTTPS"
   - **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache policy**: "CachingOptimized" (or create custom)
   - **Origin request policy**: "CORS-S3Origin"

4. **Distribution Settings**
   - **Price class**: Choose based on your needs
   - **Alternate domain names (CNAMEs)**: Leave empty unless using custom domain
   - **SSL Certificate**: Default CloudFront certificate
   - Click "Create distribution"

5. **Note the Distribution Domain**
   - After creation, copy the **Distribution domain name** (e.g., `d1234567890.cloudfront.net`)
   - This is your `CLOUDFRONT_DOMAIN`

## Step 3: Update S3 Bucket Policy

After creating the CloudFront distribution, AWS will suggest a bucket policy. Update your S3 bucket:

1. Go back to S3 → Your bucket → Permissions → Bucket Policy
2. Add the policy provided by CloudFront (should look like this):

```json
{
    "Version": "2008-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::goauction-videos/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
                }
            }
        }
    ]
}
```

## Step 4: Configure Environment Variables

### Backend (.env)

Update your `/backend/.env` file with the following variables:

```env
# AWS S3 Configuration (existing)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=goauction-dev-images
S3_BUCKET_NAME=goauction-dev-images
S3_BUCKET_URL=https://goauction-dev-images.s3.amazonaws.com

# Video & CloudFront Configuration (NEW)
CLOUDFRONT_DOMAIN=https://d1234567890.cloudfront.net
MAX_VIDEO_SIZE_MB=100
```

**Important Notes:**
- Replace `d1234567890.cloudfront.net` with your actual CloudFront domain
- The `CLOUDFRONT_DOMAIN` should include `https://` but NOT a trailing slash
- Videos and images will use the same S3 bucket by default (or create a separate video bucket)

### Frontend (.env)

No changes needed for frontend environment variables. The backend handles all AWS interactions.

## Step 5: Run Database Migration

Run the Prisma migration to add the `videos` field to your database:

```bash
cd /home/darshanchavan/Documents/gocart-1/backend
npx prisma migrate dev --name add_videos_to_listings
```

## Step 6: Test the Setup

1. **Start your application**:
   ```bash
   cd /home/darshanchavan/Documents/gocart-1
   ./start.sh
   ```

2. **Test video upload**:
   - Login as a seller (jane@example.com / password123)
   - Navigate to "Create Listing"
   - Upload a test video (MP4 recommended)
   - Verify upload progress shows
   - Submit the listing

3. **Verify CloudFront delivery**:
   - View the created listing
   - Open browser DevTools → Network tab
   - Play the video
   - Verify the video URL starts with your CloudFront domain

4. **Check caching** (optional):
   - Refresh the listing page
   - Check response headers for `x-cache: Hit from cloudfront`
   - This confirms CloudFront is caching your videos

## Troubleshooting

### Video upload fails with 403 error
- Check AWS credentials in `.env`
- Verify S3 bucket exists and is accessible
- Check IAM user permissions (needs S3 PutObject)

### Video plays but from S3 URL instead of CloudFront
- Verify `CLOUDFRONT_DOMAIN` is set in backend `.env`
- Restart backend server after adding the variable

### Video doesn't play
- Check CORS configuration on S3 bucket
- Verify CloudFront distribution status is "Deployed"
- Check browser console for errors

### Slow video loading initially
- First load fetches from S3, CloudFront caches it
- Subsequent loads will be fast from edge locations
- This is expected behavior

## Cost Optimization Tips

1. **Lifecycle Policies**: Set up S3 lifecycle rules to delete old videos after listings expire
2. **CloudFront Pricing**: Use price class that matches your audience geography
3. **Compression**: Encourage users to compress videos before upload
4. **Video Limits**: Current implementation limits 2 videos per listing (configurable)

## Security Considerations

- ✅ Videos are uploaded through authenticated backend endpoints
- ✅ S3 bucket is not publicly accessible (only via CloudFront)
- ✅ CloudFront uses HTTPS only
- ✅ CORS is properly configured
- ⚠️ Consider adding CloudWatch monitoring for unusual upload patterns
- ⚠️ Consider implementing virus scanning for uploaded videos

## Scaling to Millions of Users

Your setup is now ready to scale:

- **S3**: Handles unlimited storage and requests
- **CloudFront**: 
  - 400+ edge locations worldwide
  - Automatically scales to handle traffic spikes
  - Reduces latency for global users
  - Offloads 80-90% of traffic from your origin

**Expected Performance**:
- First video load: 1-3 seconds (from S3)
- Cached loads: 100-500ms (from CloudFront edge)
- Concurrent users: Millions (automatically handled)

---

## Next Steps

1. Monitor CloudFront metrics in AWS Console
2. Set up CloudWatch alarms for unusual activity
3. Consider implementing video transcoding for optimal delivery
4. Add video thumbnails for better UX

**You're all set!** Videos will now be delivered via CloudFront CDN for optimal performance. 🚀
