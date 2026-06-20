# 🛡️ Password Guardian

**A privacy-first password strength analyzer that empowers users to build stronger credentials — entirely in their browser.**

---

## Overview

Password Guardian is a sleek, client-side password strength analyzer built with plain HTML, CSS, and JavaScript. It leverages the industry-standard [zxcvbn](https://github.com/dropbox/zxcvbn) library to deliver real-time, expert-level feedback on password security — without ever transmitting a single keystroke.

### Why Password Guardian?

Most password tools either oversimplify strength assessment (just counting uppercase and symbols) or require server-side processing that introduces privacy concerns. Password Guardian bridges this gap by running sophisticated analysis **entirely in the browser**, giving users actionable insights they can trust.

### Who It's For

- **Everyday users** looking to strengthen their online security
- **Developers** seeking a lightweight, embeddable password analysis component
- **Security-conscious individuals** who refuse to type passwords into third-party services
- **Educators** teaching password hygiene and digital security fundamentals

---

## ✨ Features

| Feature | Description |
|---|---|
| **Strength Assessment** | zxcvbn-powered scoring (0–4) with intuitive visual feedback |
| **Composition Analysis** | Detailed breakdown of character types, length, and structure |
| **Crack Time Estimates** | Realistic estimates across multiple attack scenarios (online throttled, online unthrottled, offline slow hash, offline fast hash) |
| **Improvement Suggestions** | Personalized, context-aware tips to strengthen your specific password |
| **Password Variations** | 3 stronger password alternatives generated instantly |
| **Real-Time Analysis** | Live feedback as you type — no "Submit" button needed |
| **Copy to Clipboard** | One-click copy for generated password variations |
| **Security Education** | Integrated tips on password best practices |
| **100% Client-Side** | Zero network requests — your password never leaves your device |
| **Modern, Responsive UI** | Glassmorphism design with smooth animations, fully responsive across devices |
| **Zero-Cost Deployment** | Deploy to Vercel, Netlify, or GitHub Pages for free |

---

## 🔒 Privacy & Security

> **Your passwords NEVER leave your device. Period.**

Password Guardian was designed with an uncompromising commitment to user privacy:

- 🔐 **No backend** — There is no server to send data to
- 🚫 **No API calls** — Zero network requests are made during analysis
- 💾 **No data storage** — Nothing is saved to cookies, localStorage, or any database
- 📊 **No analytics tracking** — No telemetry captures password values or user behavior
- 🔍 **Open source** — Every line of code is available for inspection and verification

All password analysis is performed **in-browser via JavaScript**. The zxcvbn library runs locally after being loaded, and all computations happen in the user's own browser context. You can verify this by disconnecting from the internet after the page loads — the tool continues to work perfectly.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic document structure and accessibility |
| **CSS3** | Custom properties, glassmorphism effects, responsive layout, animations |
| **Vanilla JavaScript (ES6+)** | Core application logic, DOM manipulation, event handling |
| **[zxcvbn](https://github.com/dropbox/zxcvbn)** | Password strength estimation (loaded via CDN) |
| **[Google Fonts — Inter](https://fonts.google.com/specimen/Inter)** | Clean, modern typography |

No frameworks. No build tools. No dependencies beyond a single CDN-loaded library.

---

## 📁 Project Structure

```
Password Guardian/
├── index.html    # Main HTML document with semantic structure
├── style.css     # Complete styling — responsive design, animations, glassmorphism
├── script.js     # Password analysis engine, UI logic, variation generator
└── README.md     # Project documentation (you are here)
```

A deliberately minimal footprint — four files, zero configuration, instant deployment.

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- **No** build tools, Node.js, or package managers required

### Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/your-username/password-guardian.git

# 2. Navigate to the project directory
cd password-guardian

# 3. Open in your browser
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

That's it — **no build step, no install, no configuration**.

### Deploy to Vercel (Free)

Deploying Password Guardian to the web takes under 2 minutes:

1. **Push** this project to a GitHub repository
2. **Sign in** to [Vercel](https://vercel.com) (free Hobby plan)
3. **Import** your GitHub repository
4. **Configure** the project:
   - Framework Preset: **Other**
   - Build Command: *(leave empty)*
   - Output Directory: `./`
5. **Deploy** — your site will be live at `your-project.vercel.app`

> **Total cost: $0** — Vercel's Hobby plan is free for personal projects.

You can also deploy to **GitHub Pages**, **Netlify**, or any static hosting provider with identical ease.

---

## 📋 Internship Requirements Checklist

| Requirement | Status |
|---|---|
| Real, working output | ✅ Complete |
| Client-side only analysis | ✅ Complete |
| No passwords transmitted or stored | ✅ Complete |
| zxcvbn integration | ✅ Complete |
| Strength ratings display | ✅ Complete |
| Crack time estimates | ✅ Complete |
| Personalized suggestions | ✅ Complete |
| 3 stronger variations generated | ✅ Complete |
| "Built for Digital Heroes" button with correct link | ✅ Complete |
| Full name and email visible | ✅ Complete |
| Responsive design | ✅ Complete |
| Vercel Hobby deployable | ✅ Complete |
| No paid services | ✅ Complete |

---

## 👤 Author

**A Thomas Amala Heringston**

- 📧 Email: [thomasheringston05@gmail.com](mailto:thomasheringston05@gmail.com)
- 🌐 Built for: [Digital Heroes](https://digitalheroesco.com)

---

## 📄 License

This project is licensed under the **MIT License** — see below for details.

```
MIT License

Copyright (c) 2026 A Thomas Amala Heringston

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  <em>Built with 🔒 security and ❤️ care — because your passwords deserve better.</em>
</p>
