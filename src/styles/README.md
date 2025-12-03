# Styles Documentation

The styling architecture for Celo Engage Hub v2 is built with vanilla CSS3, utilizing **CSS Variables** for theming and a **Mobile-First** approach.

## 📂 Key Files

### `main.css`
The primary stylesheet containing all global styles, layout definitions, and component styles.

## 🎨 Theme System

The application uses a "Golden" theme defined via CSS variables on the `:root` element.

```css
:root {
  --primary: #fbcc5c; /* Celo Gold */
  --bg-app: #ffffff;
  --text-main: #1a1a1a;
  /* ... */
}
```

## 📱 Mobile-First Design

- **Grid Layout:** The `.page-wrapper` uses `grid-template-columns: 1fr` to ensure a single-column flow optimized for mobile devices (375px width).
- **Responsive Breakpoints:** Media queries are used to adapt the layout for desktop screens, expanding the central container while maintaining the focus on the content.

## 🧩 Components

- **`.card`**: The fundamental building block for UI sections (Donate, GM, Profile).
- **`.nav-btn`**: Pill-shaped navigation buttons used in the header.
- **`.modal-layer`**: Styles for the popup modals (Connect Wallet, Share, Success).
- **`.toast-container`**: Positioning for the notification toasts.

## ⚠️ Mini App Considerations

Special attention is given to the **Farcaster Mini App** environment:
- **Header:** The `.compact-header` class reduces padding to maximize vertical space in the embedded frame.
- **Scroll:** `overflow-x: auto` is applied to navigation to allow horizontal scrolling on narrow screens without breaking the layout.
