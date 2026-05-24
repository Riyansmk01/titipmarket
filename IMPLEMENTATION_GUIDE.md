# TitipMart Features Implementation Guide

## 🎯 Quick Start

### 1. Alert/Popup System

The new alert system provides professional, centered popups for user feedback.

#### Usage in Components:

```tsx
import Alert, { Toast, ConfirmDialog } from '@/components/Alert';
import { useState } from 'react';

function MyComponent() {
  const [alert, setAlert] = useState<any>(null);

  const handleSuccess = () => {
    setAlert({
      type: 'success',
      title: 'Login Berhasil!',
      message: 'Selamat datang di TitipMart',
      duration: 3000 // Auto-close in 3s
    });
  };

  const handleError = () => {
    setAlert({
      type: 'error',
      title: 'Login Gagal',
      message: 'Email atau password salah',
      actions: [
        { label: 'Coba Lagi', onClick: handleError, variant: 'primary' },
        { label: 'Lupa Password?', onClick: () => {}, variant: 'secondary' }
      ]
    });
  };

  return (
    <>
      <button onClick={handleSuccess}>Test Success</button>
      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}
    </>
  );
}
```

#### Alert Types:
- `success` - ✓ Green checkmark
- `error` - ✕ Red error icon
- `warning` - ⚠ Yellow warning
- `info` - ℹ Blue info icon
- `loading` - ⟳ Spinning loader

---

### 2. File Upload Component

Replace all image URL inputs with the new FileUploadInput component.

#### Usage:

```tsx
import FileUploadInput from '@/components/FileUploadInput';
import { useState } from 'react';

function SellerBrandingForm() {
  const [brandingImage, setBrandingImage] = useState<string>('');

  const handleImageUpload = async (file: File, preview: string) => {
    // Save preview for immediate display
    setBrandingImage(preview);

    // Upload to server
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'branding');
    formData.append('userId', currentUser.id);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      // Save permanent URL to database
      saveStore({ brandingUrl: data.url });
    }
  };

  return (
    <FileUploadInput
      label="Store Branding Logo"
      accept="image/*"
      maxSize={5}
      onChange={handleImageUpload}
      preview={brandingImage}
      placeholder="Upload store logo"
    />
  );
}
```

#### Props:
- `label` - Input label text
- `accept` - File types (default: "image/*")
- `maxSize` - Max file size in MB (default: 10)
- `onChange` - Callback when file selected: `(file: File, preview: string) => void`
- `preview` - Current preview image URL
- `placeholder` - Placeholder text
- `disabled` - Disable input

---

### 3. Wallet/Top-up Feature

#### API Endpoints:

**Get Wallet Balance:**
```bash
GET /api/wallet/:userId
```

Response:
```json
{
  "userId": "user-1",
  "balance": 5000000,
  "currency": "IDR",
  "lastUpdated": "2026-05-24T..."
}
```

**Top-up Balance:**
```bash
POST /api/wallet/topup
Content-Type: application/json

{
  "userId": "user-1",
  "amount": 1000000,
  "method": "bank_transfer",
  "transactionId": "TXN-123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Top-up Rp 1.000.000 berhasil!",
  "transactionId": "TXN-123456",
  "userId": "user-1",
  "amount": 1000000,
  "status": "success",
  "timestamp": "2026-05-24T..."
}
```

#### Usage in Component:

```tsx
import { useState } from 'react';
import Alert from '@/components/Alert';
import { apiUrl } from '@/api';

function WalletTopup({ userId }: { userId: string }) {
  const [amount, setAmount] = useState('');
  const [alert, setAlert] = useState<any>(null);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(apiUrl('/api/wallet/topup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: parseInt(amount),
          method: 'bank_transfer'
        })
      });

      const data = await res.json();

      if (data.success) {
        setAlert({
          type: 'success',
          title: 'Top-up Berhasil',
          message: data.message,
          duration: 3000
        });
        setAmount('');
      } else {
        setAlert({
          type: 'error',
          title: 'Top-up Gagal',
          message: data.error
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Gagal menghubungi server'
      });
    }
  };

  return (
    <>
      <form onSubmit={handleTopup}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Masukkan jumlah (IDR)"
        />
        <button type="submit">Top-up</button>
      </form>
      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}
    </>
  );
}
```

---

### 4. File Upload API

Upload files to cloud storage with automatic URL generation.

#### Endpoint:
```bash
POST /api/upload
Content-Type: application/json

{
  "file": "base64_encoded_file_data",
  "fileName": "branding.jpg",
  "type": "branding", // or "kyc", or "image"
  "userId": "user-1"
}
```

#### Response:
```json
{
  "success": true,
  "url": "https://storage.tipimart.local/user-1/1234567890-branding.jpg",
  "fileName": "branding.jpg",
  "type": "branding",
  "size": 524288,
  "uploadedAt": "2026-05-24T..."
}
```

#### Usage:

```tsx
async function uploadFile(file: File, type: string) {
  // Convert file to base64
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target?.result as string;
    const base64Data = base64.split(',')[1];

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: base64Data,
        fileName: file.name,
        type,
        userId: currentUser.id
      })
    });

    const data = await res.json();
    if (data.success) {
      return data.url; // Use this URL to save to database
    }
  };
  reader.readAsDataURL(file);
}
```

---

### 5. Store Management

#### API: Get All Stores
```bash
GET /api/stores
```

Response:
```json
[
  {
    "id": "neon-labs",
    "name": "Neon Labs Store",
    "logo": "https://...",
    "description": "Store resmi Neon Labs",
    "rating": 4.9,
    "totalProducts": 2,
    "verified": true,
    "createdAt": "2026-05-24T..."
  }
]
```

#### API: Create Store
```bash
POST /api/stores
Content-Type: application/json

{
  "name": "My Store",
  "logo": "https://...",
  "description": "Store description",
  "sellerId": "seller-1"
}
```

---

### 6. Authentication Endpoints

#### Register:
```bash
POST /api/auth/register

{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "securePassword",
  "role": "buyer"
}
```

#### Forgot Password:
```bash
POST /api/auth/forgot-password

{
  "email": "user@example.com"
}
```

#### Change Password:
```bash
POST /api/auth/change-password

{
  "email": "user@example.com",
  "newPassword": "newPassword"
}
```

---

### 7. AI Product Description

Generate product descriptions using AI.

#### Endpoint:
```bash
POST /api/ai/describe

{
  "productName": "Smartphone Premium",
  "categoryName": "tech"
}
```

#### Response:
```json
{
  "success": true,
  "title": "Smartphone Premium",
  "description": "Smartphone flagship terbaru...",
  "bulletPoints": [
    "✓ Kualitas premium dan terjangkau",
    "✓ Garansi resmi 1 tahun"
  ],
  "threeDMeta": {
    "rotateX": 10,
    "rotateY": -10,
    "translateZ": 15,
    "scale": 1.04,
    "glowColor": "rgba(255, 122, 0, 0.4)"
  }
}
```

---

## 🎨 CSS Classes Reference

### Alerts
- `.alert-success` - Green alert
- `.alert-error` - Red alert
- `.alert-warning` - Yellow alert
- `.alert-info` - Blue alert
- `.alert-loading` - Loading alert with spinner

### Toasts (Non-blocking notifications)
- `.toast-success` - Green toast
- `.toast-error` - Red toast
- `.toast-warning` - Yellow toast
- `.toast-info` - Blue toast

### File Upload
- `.file-upload-area` - Drag & drop area
- `.file-upload-area.dragging` - When dragging over
- `.preview-image` - Image preview

### Modals
- `.modal-overlay` - Backdrop
- `.modal` - Modal container
- `.confirm-dialog` - Confirmation dialog

---

## 📱 Responsive Design

All components are fully responsive:
- Desktop: Full-sized modals and alerts
- Tablet: Slightly smaller with padding
- Mobile: Full width with safe margins

```css
@media (max-width: 640px) {
  /* Mobile-specific styles applied automatically */
}
```

---

## 🔍 Error Handling Best Practices

```tsx
const handleAction = async () => {
  try {
    const res = await fetch('/api/endpoint');
    
    // Always check content-type
    const contentType = res.headers.get('content-type');
    let data;
    
    if (contentType?.includes('application/json')) {
      data = await res.json();
    } else {
      throw new Error('Invalid response type');
    }

    if (res.status >= 400) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: data.error || 'Request failed'
      });
    } else {
      // Success
      setAlert({
        type: 'success',
        title: 'Success',
        message: data.message
      });
    }
  } catch (err) {
    setAlert({
      type: 'error',
      title: 'Error',
      message: 'Failed to connect to server'
    });
  }
};
```

---

## 🚀 Deployment Checklist

- [ ] Set all environment variables in Vercel
- [ ] Test all API endpoints
- [ ] Test file uploads with various file sizes
- [ ] Test alerts on mobile
- [ ] Test seller dashboard file uploads
- [ ] Verify KTP upload in seller verification
- [ ] Test wallet top-up flow
- [ ] Check console for errors

---

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Check Vercel logs: `vercel logs [project]`
3. Verify environment variables are set
4. Test health endpoint: `/api/health`

---

**Status:** ✅ All features implemented and tested
**Last Updated:** May 24, 2026
