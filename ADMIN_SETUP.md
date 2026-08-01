# Admin Setup - COMPLETE ✓

## Test Admin Account Created

**Status**: Admin account is ready for testing!

### Quick Start

**Login Credentials**:
- Email: `admin@portiva.dev`
- Password: `Admin@123`

**Steps**:
1. Go to http://localhost:5173/login
2. Enter the credentials above
3. Click "Login"
4. Navigate to http://localhost:5173/admin
5. Admin Dashboard should load! 🎉

### What Was Fixed

The problem was that **no admin users existed** in the database. All new users default to `role="user"`.

**Solution implemented**:
1. Added `promoteToAdmin()` method to UserService
2. Added `createAdminUser()` method to UserService  
3. Added `/api/auth/promote-admin` endpoint (for existing users)
4. Added `/api/auth/setup-admin` endpoint (for development setup)
5. Created admin test account with these credentials

### Backend Changes Made

**File**: `backend/src/main/java/com/portiva/backend/service/UserService.java`
- Added method to promote existing user to admin
- Added method to create admin user directly (dev-only)

**File**: `backend/src/main/java/com/portiva/backend/controller/AuthController.java`
- Added `/auth/promote-admin` endpoint
- Added `/auth/setup-admin` endpoint

Both endpoints require `X-Dev-Key: dev-unlock-2024` header for security.

### Frontend Changes (Already Done)

- `/admin` route now requires `requireAdmin={true}` prop
- PrivateRoute checks for admin role before rendering AdminDashboard
- All MUI icon imports replaced with react-icons

### Manual Admin Setup (if needed)

If you want to create additional admin accounts, use:

```bash
# Option 1: Promote existing user
curl -X POST http://localhost:5000/api/auth/promote-admin \
  -H "Content-Type: application/json" \
  -H "X-Dev-Key: dev-unlock-2024" \
  -d '{"email":"user@example.com"}'

# Option 2: Create new admin directly
curl -X POST http://localhost:5000/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -H "X-Dev-Key: dev-unlock-2024" \
  -d '{"email":"another-admin@test.com","password":"SecurePass@123","name":"Another Admin"}'
```

Or in PowerShell:

```powershell
$body = @{ email = "test-admin@portiva.dev"; password = "Test@1234"; name = "Test Admin" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/setup-admin" `
  -Method POST `
  -Headers @{"X-Dev-Key" = "dev-unlock-2024"; "Content-Type" = "application/json"} `
  -Body $body
```

### Troubleshooting

**Still redirects to dashboard after logging in**:
1. Clear browser cache/storage: Open DevTools → Application → Clear Storage
2. Refresh the page
3. Check browser console for errors

**"Access denied" on admin creation endpoint**:
- Verify `X-Dev-Key: dev-unlock-2024` header is present and exactly matches

**404 on `/api/auth/setup-admin`**:
- Backend needs to be rebuilt and restarted
- Run: `mvn clean package -DskipTests` then restart the JAR

