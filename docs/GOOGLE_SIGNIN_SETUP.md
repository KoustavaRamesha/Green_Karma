# 🔐 Google Sign-In Setup Guide

## ✅ Quick Setup (5 minutes)

### Step 1: Enable Google Sign-In in Firebase

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select your project: **green-kar**

2. **Navigate to Authentication**
   - Click **"Authentication"** in the left sidebar
   - (Or: **Build** → **Authentication**)

3. **Enable Google Sign-In**
   - Click the **"Sign-in method"** tab at the top
   - Find **"Google"** in the list of providers
   - Click on **"Google"**
   - Toggle **"Enable"** to ON
   - **Project support email**: Select your email from dropdown
   - Click **"Save"**

### Step 2: Test the Application

1. **Refresh your browser** at http://localhost:3000/register

2. **Connect your wallet** (MetaMask)

3. **Enter your name** in the form

4. **Select role** (User or Verifier)

5. **Click "Continue with Google"**
   - A Google Sign-In popup will appear
   - Choose your Google account
   - Allow permissions

6. **Registration complete!** You'll be redirected to the dashboard

## 🎯 What Happens When You Sign In

### Registration Flow:
```
1. Click "Continue with Google"
   ↓
2. Google popup appears
   ↓
3. Select your Google account
   ↓
4. Firebase authenticates you
   ↓
5. Backend creates your profile in Firestore
   ↓
6. Blockchain registration (if enabled)
   ↓
7. Redirect to Dashboard
```

### Login Flow:
```
1. Click "Sign in with Google"
   ↓
2. Google popup appears
   ↓
3. Firebase authenticates you
   ↓
4. Backend fetches your profile
   ↓
5. Redirect to Dashboard (or Verifier portal)
```

## 🔒 Security Features

### Firebase Authentication Provides:
- ✅ **Secure OAuth 2.0** - Industry-standard authentication
- ✅ **No password storage** - Google handles all credentials
- ✅ **Automatic token refresh** - Seamless authentication
- ✅ **Multi-factor ready** - Can enable 2FA in Google account
- ✅ **Email verification** - Google accounts are pre-verified

### What's Stored:
- **Firebase Auth**: Email, Google UID, profile photo
- **Firestore**: Name, wallet address, role, statistics
- **Never stored**: Password, Google credentials

## 📱 What You'll See

### Registration Page Features:
- 🔌 **Wallet connection** (MetaMask required)
- 📝 **Name input** (your display name)
- 👤 **Role selection** (User or Verifier)
- 🔐 **Google Sign-In button** (one-click authentication)

### Login Page Features:
- 🔐 **Google Sign-In button** (one-click login)
- ✨ **Benefits display** (why it's better)
- 🔄 **Auto-redirect** based on your role

## 🎨 User Experience

### Benefits of Google Sign-In:
1. **No Passwords** - One less thing to remember
2. **Faster Login** - One click and you're in
3. **More Secure** - Google's enterprise security
4. **Pre-verified** - No email confirmation needed
5. **Profile Photo** - Automatically imported from Google

## 🐛 Troubleshooting

### Error: "auth/operation-not-allowed"
**Solution**: Enable Google Sign-In in Firebase Console
- Firebase Console → Authentication → Sign-in method → Google → Enable

### Error: "Popup closed by user"
**Solution**: This happens if you close the Google popup
- Try again and complete the sign-in

### Error: "User not found"
**On Login**: You need to register first
- Go to /register and complete registration

### Error: "Please connect wallet first"
**Solution**: Connect MetaMask before signing in
- Click "Connect Wallet" button
- Approve in MetaMask

## 🌐 Supported Browsers

Google Sign-In works on:
- ✅ Chrome / Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera

**Note**: Popup blockers must be disabled for the sign-in flow

## 🚀 Production Deployment

### Additional Steps for Production:

1. **Add Authorized Domains**
   - Firebase Console → Authentication → Settings
   - Add your production domain (e.g., greenkarma.app)

2. **Configure OAuth Consent**
   - Google Cloud Console
   - Configure app name, logo, privacy policy

3. **Set up Email Templates**
   - Firebase Console → Authentication → Templates
   - Customize email verification, password reset

## 💡 Tips

### For Users:
- Use your primary Google account
- Make sure popups are enabled
- Keep your wallet connected

### For Verifiers:
- Use your official government email
- Select "Verifier" role during registration
- You'll be redirected to verifier portal

## 📊 What Gets Stored

### Firebase Authentication:
```javascript
{
  uid: "google-user-id",
  email: "user@gmail.com",
  displayName: "John Doe",
  photoURL: "https://lh3.googleusercontent.com/..."
}
```

### Firestore Database:
```javascript
{
  email: "user@gmail.com",
  name: "John Doe",
  walletAddress: "0x...",
  role: "user",
  photoURL: "https://...",
  totalRecycled: 0,
  totalTokensEarned: 0,
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

## ✅ Checklist

Before testing:
- [ ] Firebase Console → Authentication → Sign-in method → Google → **Enabled**
- [ ] MetaMask installed and wallet created
- [ ] Popup blocker disabled
- [ ] Using a supported browser

Ready to test:
- [ ] Visit http://localhost:3000/register
- [ ] Connect wallet
- [ ] Enter name
- [ ] Click "Continue with Google"
- [ ] Complete sign-in

---

## 🎉 That's It!

Once Google Sign-In is enabled in Firebase Console, you can:
1. **Register** with one click
2. **Login** instantly
3. **Start recycling** and earning tokens

**No passwords, no hassle, just sign in with Google!** 🚀

---

**Need help?** Check the Firebase Console for authentication logs and errors.
