# 🚀 Setup Instructions - Connecting Next.js to .NET 8 API

## 📋 Prerequisites
- .NET 8 API running on `https://localhost:7000`
- PostgreSQL database with MWP schema
- Next.js application (this project)

## 🔧 Configuration Steps

### 1. Environment Setup
✅ **Done**: `.env.local` file created with API configuration
```bash
NEXT_PUBLIC_API_BASE_URL=https://localhost:7000
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### 2. API Client Setup
✅ **Done**: 
- `types/api.ts` - TypeScript interfaces
- `lib/apiClient.ts` - API client with proper error handling
- Updated `app/page.tsx` to use new API client

### 3. Start Both Applications

#### Start .NET API (Terminal 1):
```bash
cd your-dotnet-api-project
dotnet run
```
✅ API will be available at `https://localhost:7000`
✅ Swagger docs at `https://localhost:7000/swagger`

#### Start Next.js (Terminal 2):
```bash
cd manas-wellness-website
npm run dev
```
✅ UI will be available at `http://localhost:3001`

## 🧪 Testing the Integration

### 1. Check API Health
The app automatically tests the connection on startup. Check the browser console for:
- ✅ `API Connected Successfully` - Everything works!
- ❌ `API Health Check Failed` - Check if .NET API is running

### 2. Test Features
1. **Submit a Support Message** (Donation page)
   - Fill out the form and submit
   - Should show success message
   - Message goes to database as "pending"

2. **Admin Dashboard** (Admin page)
   - Navigate to Admin → Enter password: `manorh00ps`
   - View all messages (pending/approved)
   - Test approve/delete functionality

3. **View Published Messages** (Donation page)
   - Only approved messages appear in "Community Support"
   - Messages show real creation dates

## 🔍 API Endpoints Used

| Feature | Method | Endpoint | Description |
|---------|---------|----------|-------------|
| Health Check | GET | `/api/support-messages/health` | Verify API/DB connection |
| Get Messages | GET | `/api/support-messages` | Public approved messages |
| Submit Message | POST | `/api/support-messages` | Create new message |
| Admin View | GET | `/api/admin/support-messages` | All messages (admin) |
| Approve | PUT | `/api/admin/support-messages/{id}/approve` | Approve message |
| Delete | DELETE | `/api/admin/support-messages/{id}` | Delete message |

## 🐛 Troubleshooting

### API Connection Issues
1. **"Network error"**: Check if .NET API is running
2. **"CORS error"**: Verify CORS settings in .NET API
3. **"SSL error"**: Check `NODE_TLS_REJECT_UNAUTHORIZED=0` in `.env.local`

### Database Issues
1. Check PostgreSQL is running
2. Verify connection string in .NET API
3. Ensure MWP database and tables exist

### Frontend Issues
1. Clear browser cache/cookies
2. Check browser console for errors
3. Verify `.env.local` file exists and is correct

## ✅ Success Indicators

When everything works correctly, you should see:
- ✅ API health status shows "Connected" in admin dashboard
- ✅ Support messages submit successfully
- ✅ Admin can approve/delete messages
- ✅ Approved messages appear in public view
- ✅ Browser console shows "API Connected Successfully"

## 🎯 Next Steps

1. **Test Data Flow**:
   - Submit test message
   - Approve it via admin
   - Verify it appears publicly

2. **Production Setup**:
   - Update API URLs for production
   - Add proper SSL certificates
   - Configure production database

Your Manas Wellness website is now fully integrated with the .NET 8 API! 🎉
