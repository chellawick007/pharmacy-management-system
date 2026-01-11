# How to Fix: Application Going Directly to Main Page

If you're experiencing an issue where the application goes directly to the main page instead of showing the login/signup page, follow these steps:

## Quick Fix: Clear Browser Storage

### Option 1: Using Browser DevTools (Recommended)
1. Open the application in your browser: http://localhost:5173
2. Press `F12` or right-click and select "Inspect" to open DevTools
3. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
4. In the left sidebar, find **Local Storage**
5. Click on `http://localhost:5173`
6. Right-click and select **Clear** or use the clear icon
7. Refresh the page (`F5` or Cmd+R)

### Option 2: Using Browser Console
1. Open the application in your browser: http://localhost:5173
2. Press `F12` to open DevTools
3. Go to the **Console** tab
4. Type the following command and press Enter:
   ```javascript
   localStorage.clear(); location.reload();
   ```

### Option 3: Using Incognito/Private Mode
1. Open a new incognito/private browser window
2. Navigate to http://localhost:5173
3. The login page should appear

## Why This Happens

The application stores user authentication data in the browser's localStorage. If you:
- Previously logged in
- Stopped the Docker containers or backend
- Restarted the application

The old authentication token remains in localStorage, causing the app to think you're still logged in.

## Long-term Solution

The application has been updated to validate localStorage data on startup. After clearing your browser storage once, this issue should not recur.

## Test After Clearing Storage

After clearing storage, you should:
1. See the login/signup page
2. Be able to login with these credentials:
   - Email: `admin@pharmacy.com`
   - Password: `admin123`
