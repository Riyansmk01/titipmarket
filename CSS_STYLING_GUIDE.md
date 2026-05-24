# CSS Alert & Popup Styling Guide

Complete reference for all available alert and popup styles in TitipMart.

## 📦 Importing Styles

The CSS is automatically imported in `src/main.tsx`:
```tsx
import './alerts.css';
```

## 🎨 Alert Component Usage

### Basic Alert (Centered Popup)

```tsx
<div className="alert-overlay" />
<div className="alert-container alert-success">
  <button className="alert-close">×</button>
  <div className="alert-content">
    <div className="alert-icon">✓</div>
    <div className="alert-text">
      <div className="alert-title">Success Title</div>
      <div className="alert-message">Success message here</div>
    </div>
  </div>
</div>
```

### Alert Types

#### Success Alert
```html
<div class="alert-container alert-success">
  <!-- Green left border, green icon background -->
</div>
```
- Border: `#10b981` (green)
- Icon background: `#d1fae5`
- Title color: `#065f46`
- Message color: `#047857`

#### Error Alert
```html
<div class="alert-container alert-error">
  <!-- Red left border, red icon background -->
</div>
```
- Border: `#ef4444` (red)
- Icon background: `#fee2e2`
- Title color: `#7f1d1d`
- Message color: `#991b1b`

#### Warning Alert
```html
<div class="alert-container alert-warning">
  <!-- Yellow left border -->
</div>
```
- Border: `#f59e0b` (amber)
- Icon background: `#fef3c7`
- Title color: `#78350f`
- Message color: `#92400e`

#### Info Alert
```html
<div class="alert-container alert-info">
  <!-- Blue left border -->
</div>
```
- Border: `#3b82f6` (blue)
- Icon background: `#dbeafe`
- Title color: `#1e3a8a`
- Message color: `#1e40af`

#### Loading Alert
```html
<div class="alert-container alert-loading">
  <div class="alert-spinner"></div>
  <div class="alert-title">Processing...</div>
</div>
```

---

## 🔔 Toast Notifications (Non-blocking)

Small notifications that appear in bottom-right corner.

### HTML Structure
```html
<div class="toast-container">
  <div class="toast toast-success">
    <span class="toast-icon">✓</span>
    <span class="toast-message">Success message</span>
  </div>
</div>
```

### Toast Types

- `.toast-success` - Green toast
- `.toast-error` - Red toast  
- `.toast-warning` - Yellow toast
- `.toast-info` - Blue toast

### Features
- Auto-dismisses after 3 seconds (configurable)
- Slides in from right
- Can be stacked (multiple toasts)
- Click to dismiss

---

## ✅ Confirmation Dialogs

Modal dialog for confirming actions.

### HTML Structure
```html
<div class="alert-overlay" />
<div class="alert-container">
  <div class="alert-content" style="flex-direction: column; text-align: center;">
    <div class="confirm-icon warning">⚠</div>
    <div class="confirm-title">Are you sure?</div>
    <div class="confirm-message">This action cannot be undone.</div>
    <div class="confirm-actions">
      <button class="btn-cancel">Cancel</button>
      <button class="btn-confirm">Confirm</button>
    </div>
  </div>
</div>
```

### Icon Types
- `.confirm-icon.warning` - Yellow warning
- `.confirm-icon.error` - Red error
- `.confirm-icon.success` - Green success

### Button Types
- `.btn-cancel` - Gray cancel button
- `.btn-confirm` - Blue confirm button
- `.btn-confirm.danger` - Red dangerous action

---

## 📋 Input Dialog

Modal for collecting user input.

### HTML Structure
```html
<div class="alert-overlay" />
<div class="alert-container input-dialog">
  <div class="alert-content" style="flex-direction: column;">
    <div class="input-dialog-field">
      <label class="input-dialog-label">Input Label</label>
      <input class="input-dialog-input" type="text" placeholder="Enter value" />
    </div>
    <div class="confirm-actions">
      <button class="btn-cancel">Cancel</button>
      <button class="btn-confirm">Submit</button>
    </div>
  </div>
</div>
```

### Styling
- Input width: 100% with box-sizing
- Focus state: Blue border + shadow
- Smooth transitions

---

## 📁 File Upload Component

Drag & drop file upload area.

### HTML Structure
```html
<div class="file-upload-container">
  <label class="file-upload-label">Upload Image</label>
  <div class="file-upload-area">
    <div class="upload-icon">📤</div>
    <div class="upload-text">
      <p class="upload-main">Click or drag files</p>
      <p class="upload-sub">or drag & drop here</p>
    </div>
    <p class="upload-size">Max: 10MB</p>
  </div>
</div>
```

### States

**Normal state:**
- Border: 2px dashed gray
- Background: Light gray

**Hover state:**
- Border color changes to darker gray
- Background changes slightly

**Dragging state:** (`.dragging` class)
- Border color: Blue
- Background: Light blue

**With preview:**
```html
<div class="file-preview">
  <div class="preview-image-container">
    <img class="preview-image" src="..." />
  </div>
  <button class="preview-remove-btn">×</button>
</div>
```

### Error Display
```html
<div class="file-upload-error">
  File is too large. Maximum 10MB.
</div>
```

---

## 🎭 Modal Components

### Modal Structure
```html
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">Modal Title</div>
      <button class="modal-close-btn">×</button>
    </div>
    <div class="modal-body">
      <!-- Content here -->
    </div>
    <div class="modal-footer">
      <button>Cancel</button>
      <button>Save</button>
    </div>
  </div>
</div>
```

### Features
- Centered on screen
- Overlay blocks background interaction
- Max height with scrollable content
- Close button in header

---

## 🎬 Animations

### Alert Pop-in/Pop-out
```css
animation: slideIn 0.3s ease-out;
```
- Fades in + scales from 0.9 to 1.0
- Smooth easing

### Toast Slide-in
```css
animation: toastSlideIn 0.3s ease-out;
```
- Slides in from right
- Fades in simultaneously

### Overlay Fade
```css
animation: fadeIn 0.2s ease-out;
```
- Smooth fade to semi-transparent black

---

## 🎨 Color Palette

### Success (Green)
- Border: `#10b981`
- Background: `#d1fae5`
- Dark text: `#065f46`

### Error (Red)
- Border: `#ef4444`
- Background: `#fee2e2`
- Dark text: `#7f1d1d`

### Warning (Amber)
- Border: `#f59e0b`
- Background: `#fef3c7`
- Dark text: `#78350f`

### Info (Blue)
- Border: `#3b82f6`
- Background: `#dbeafe`
- Dark text: `#1e3a8a`

### Neutral
- Gray text: `#374151`
- Light gray: `#e5e7eb`
- Dark gray: `#9ca3af`

---

## 📱 Responsive Breakpoints

```css
/* Mobile: < 640px */
@media (max-width: 640px) {
  .alert-container {
    width: calc(100% - 40px); /* 20px padding on each side */
  }
  
  .modal {
    max-width: calc(100% - 20px);
  }
  
  .toast-container {
    left: 10px;
    right: 10px;
    bottom: 10px;
  }
}
```

---

## 🎯 Z-Index Hierarchy

```css
.alert-overlay      /* z-index: 9998 */
.alert-container    /* z-index: 9999 */
.modal-overlay      /* z-index: 9999 */
.modal              /* z-index: 9999 */
.toast-container    /* z-index: 9999 */
```

All alerts and modals use high z-index to appear above other content.

---

## 💡 Usage Tips

1. **Always include overlay** - Prevents interaction with background
2. **Auto-close toasts** - Use for non-critical notifications
3. **Show alerts for actions** - Use for login/logout/errors
4. **Confirm destructive actions** - Delete, logout, etc.
5. **File uploads** - Use drag & drop for better UX
6. **Accessibility** - Include keyboard handlers (Escape to close)

---

## ⚡ Performance Notes

- CSS-only animations (no JavaScript)
- No external dependencies
- Minimal paint operations
- GPU-accelerated transforms

---

## 🔧 Customization

To modify colors, edit the CSS in `src/alerts.css`:

```css
/* Change success green */
.alert-success {
  border-left-color: #your-color;
}

.alert-success .alert-icon {
  background: #your-bg-color;
}
```

---

**Status:** ✅ Complete styling system
**Last Updated:** May 24, 2026
