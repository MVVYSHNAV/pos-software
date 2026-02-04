# 🎨 Tridz POS Theme Guide

## Overview

Tridz POS uses a **centralized theming system** where all colors are controlled from a single file: [`src/index.css`](file:///home/vyshnav/Tridz/pos2-bench/apps/tridz_pos/frontend/src/index.css)

**Key Benefits:**
- ✅ Change colors in one place, update entire app
- ✅ Automatic dark mode support
- ✅ All components adapt without refactoring
- ✅ shadcn/ui compatibility
- ✅ Mobile-first responsive design

---

## 🎯 How to Change Colors

### Single Source of Truth

Edit [`src/index.css`](file:///home/vyshnav/Tridz/pos2-bench/apps/tridz_pos/frontend/src/index.css) to change colors across the entire app.

**Example: Change Primary Brand Color**

```css
:root {
  /* Change from Deep Teal to Blue */
  --primary: 220 80% 50%;  /* Hue Saturation Lightness */
}

.dark {
  /* Also update dark mode */
  --primary: 220 70% 60%;
}
```

**Color Format: HSL**
- **Hue**: 0-360 (color wheel position)
  - Red: 0, Orange: 30, Yellow: 60, Green: 120, Cyan: 180, Blue: 240, Purple: 300
- **Saturation**: 0-100% (color intensity, 0% = gray)
- **Lightness**: 0-100% (brightness, 0% = black, 100% = white)

---

## 🎨 Available Color Tokens

### Backgrounds
| Token | Usage | Light Mode | Dark Mode |
|-------|-------|------------|-----------|
| `bg-background` | Main app background | Light mint | Dark teal |
| `bg-card` | Cards, panels | White | Dark gray |
| `bg-popover` | Dropdowns, tooltips | White | Dark gray |
| `bg-muted` | Disabled elements | Soft sage | Dark sage |

### Text Colors
| Token | Usage | Light Mode | Dark Mode |
|-------|-------|------------|-----------|
| `text-foreground` | Primary text | Dark gray | Off white |
| `text-muted-foreground` | Secondary text | Medium gray | Light gray |
| `text-card-foreground` | Text on cards | Dark gray | Off white |

### Brand Colors
| Token | Usage | Light Mode | Dark Mode |
|-------|-------|------------|-----------|
| `bg-primary` | Primary buttons, highlights | Deep teal | Light teal |
| `text-primary-foreground` | Text on primary | White | White |
| `bg-secondary` | Secondary elements | Soft sage | Dark sage |
| `bg-accent` | Hover states | Teal hover | Medium teal |

### Interactive Elements
| Token | Usage | Light Mode | Dark Mode |
|-------|-------|------------|-----------|
| `border-border` | Borders | Light gray | Dark gray |
| `border-input` | Input borders | Light gray | Dark gray |
| `ring-ring` | Focus rings | Deep teal | Light teal |

### Destructive/Error
| Token | Usage | Light Mode | Dark Mode |
|-------|-------|------------|-----------|
| `bg-destructive` | Delete, error buttons | Red | Softer red |
| `text-destructive-foreground` | Text on destructive | White | Off white |

---

## 🌙 Dark Mode

### How It Works

Dark mode is controlled by adding the `dark` class to the `<html>` or `<body>` element.

```tsx
// Enable dark mode
document.documentElement.classList.add('dark')

// Disable dark mode
document.documentElement.classList.remove('dark')

// Toggle dark mode
document.documentElement.classList.toggle('dark')
```

### Implementation in Components

The Settings component includes a dark mode toggle:

```tsx
const [darkMode, setDarkMode] = useState(false)

const toggleDarkMode = () => {
  setDarkMode(!darkMode)
  document.documentElement.classList.toggle('dark')
}
```

### Persisting Dark Mode

To remember user preference across sessions:

```tsx
// Save preference
const toggleDarkMode = () => {
  const newMode = !darkMode
  setDarkMode(newMode)
  document.documentElement.classList.toggle('dark')
  localStorage.setItem('darkMode', newMode.toString())
}

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('darkMode') === 'true'
  setDarkMode(saved)
  if (saved) {
    document.documentElement.classList.add('dark')
  }
}, [])
```

---

## 💻 Using Theme Colors in Components

### ✅ Correct: Use Semantic Tokens

```tsx
// Backgrounds
<div className="bg-background">
<div className="bg-card">
<div className="bg-primary">

// Text
<p className="text-foreground">
<p className="text-muted-foreground">
<p className="text-primary-foreground">

// Borders
<div className="border border-border">

// Hover states
<button className="bg-primary hover:bg-accent">
```

### ❌ Incorrect: Hardcoded Colors

```tsx
// Don't do this - won't adapt to theme changes
<div className="bg-[#52796F]">
<p className="text-[#1F2937]">
<div className="border-[#E5E7EB]">
```

---

## 🎨 Color Customization Examples

### Example 1: Change to Blue Theme

```css
:root {
  --primary: 220 80% 50%;        /* Blue */
  --accent: 220 70% 45%;         /* Darker blue */
  --secondary: 220 30% 70%;      /* Light blue-gray */
}

.dark {
  --primary: 220 70% 60%;        /* Lighter blue */
  --accent: 220 60% 55%;         /* Medium blue */
}
```

### Example 2: Change to Purple Theme

```css
:root {
  --primary: 270 60% 50%;        /* Purple */
  --accent: 270 55% 45%;         /* Darker purple */
  --secondary: 270 25% 70%;      /* Light purple-gray */
}

.dark {
  --primary: 270 55% 60%;        /* Lighter purple */
  --accent: 270 50% 55%;         /* Medium purple */
}
```

### Example 3: Adjust Background Color

```css
:root {
  --background: 165 20% 95%;     /* Slightly darker mint */
  --card: 165 10% 98%;           /* Very light mint instead of white */
}

.dark {
  --background: 165 30% 5%;      /* Even darker background */
  --card: 165 25% 10%;           /* Darker cards */
}
```

---

## 🔧 Technical Details

### File Structure

```
frontend/
├── src/
│   └── index.css          ← Single source of truth for colors
├── tailwind.config.js     ← Maps CSS variables to Tailwind classes
└── components.json        ← shadcn/ui configuration
```

### How It Works

1. **CSS Variables** in `index.css` define colors
2. **Tailwind Config** maps variables to utility classes
3. **Components** use semantic class names like `bg-primary`
4. **Dark Mode** switches variables when `.dark` class is present

### Browser Support

- Modern browsers with CSS custom properties support
- HSL color format (widely supported)
- Class-based dark mode (no media query dependency)

---

## 📱 Mobile-First Considerations

The theme system is fully compatible with mobile-first design:

```tsx
// Responsive with theme colors
<div className="bg-card md:bg-background">
<p className="text-sm md:text-base text-foreground">
```

All theme colors work seamlessly with Tailwind's responsive modifiers.

---

## 🚀 Quick Reference

**To change the entire app's color scheme:**
1. Open [`src/index.css`](file:///home/vyshnav/Tridz/pos2-bench/apps/tridz_pos/frontend/src/index.css)
2. Edit HSL values in `:root` (light mode) and `.dark` (dark mode)
3. Save - all components update automatically

**To add dark mode toggle:**
1. Use `document.documentElement.classList.toggle('dark')`
2. Optionally persist with `localStorage`

**To use colors in components:**
1. Use semantic tokens: `bg-primary`, `text-foreground`, `border-border`
2. Avoid hardcoded hex colors

---

## 🎯 Best Practices

✅ **Do:**
- Use semantic color tokens (`bg-primary`, `text-foreground`)
- Test both light and dark modes when changing colors
- Keep HSL values consistent (similar saturation for harmony)
- Document custom color choices

❌ **Don't:**
- Use hardcoded hex colors in components
- Mix color systems (stick to HSL in theme)
- Forget to update both light and dark mode
- Override theme colors with inline styles
