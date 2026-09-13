# Comprehensive Audit Report & Implementation Plan: Library Management System

Poore project (Frontend aur Backend) ko thoroughly analyze karne ke baad saare critical issues, crash bugs, UI/UX problems, theme inconsistencies aur architectural flaws identify kiye gaye hain. Yeh comprehensive report aur action plan taiyyar kiya gaya hai taaki aap ise as a report share kar sakein aur approve hone par hum inhe fix kar sakein.

---

## User Review Required

> [!IMPORTANT]
> **Priority 1: User-Reported Issue (100% Zoom Button Cut-off)**
> Landing page par Hero section mein rigid `h-screen` (100vh) aur `overflow-hidden` hone ke karan, standard 100% screen zoom (e.g. 1366x768, 1080p browser toolbars ke saath, ya Windows 125% DPI scale) par content container se bahar nikal jata hai aur "Enter Library" button cut ho jata hai ya poora gayab ho jata hai.
> 
> **Fix:** `h-screen` ko `min-h-screen` mein badalna, container ka padding optimize karna, aur decorative blur elements par `overflow-hidden` isolate karna.

> [!IMPORTANT]
> **Priority 2: Theme Toggle (Dark/Light Mode) Malfunction & Visual Glitches**
> Jaise aapke screenshot mein dikh raha hai (Image 1 & 2):
> 1. Light mode select karne par (Moon icon) Login card ajeeb se glaring white ho jata hai jabki background aur header texts dark hi rehte hain!
> 2. **Root Cause:** Tailwind CSS v4 use ho raha hai (`@import "tailwindcss";`). Tailwind v4 mein class-based dark mode ke liye `@custom-variant dark (&:where(.dark, .dark *));` define hona zaroori hota hai. Iske bina Tailwind OS ke system dark mode (`prefers-color-scheme: dark`) ko default manta hai!
> 3. `App.jsx` mein `darkMode` state change hone par `dark` class sirf ek inner `<div>` par lagti hai, `document.documentElement` (`<html class="dark">`) par nahi lagti. Is wajah se Tailwind ke `dark:` classes OS mode se sync rehte hain aur toggle button se sync nahi hote.
> 4. `index.css` mein `.dark body` likha hai jo invalid selector hai (body kabhi .dark ka child nahi hota).
> 
> **Fix:**
> - `index.css` mein `@custom-variant dark (&:where(.dark, .dark *));` add karna.
> - `App.jsx` mein `useEffect` se `document.documentElement.classList.toggle('dark', darkMode)` apply karna.
> - Base styles mein `html.dark` aur `body` ke light/dark background colors ko seamlessly synchronize karna.

> [!CAUTION]
> **Priority 3: Critical Backend Server Crash**
> Jab bhi koi user overdue book return karta hai, backend `ReferenceError: fineRecord is not defined` throw karke 500 error ke saath crash ho jata hai kyunki `fineRecord` block-scoped variable tha.

---

## Complete Issues Breakdown

### 1. UI, Theme & Responsiveness Issues (Frontend)

#### 📊 Frontend Issues Summary Table

| # | Severity | Component / File | Issue Title | Impact Summary |
| :---: | :---: | :--- | :--- | :--- |
| **1.1** | 🔴 **High** | [`LandingPage.jsx`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/LandingPage.jsx#L47) | 100% Zoom Button Cut-off | "Enter Library" button standard zoom par cut ya invisible ho jata hai. |
| **1.2** | 🔴 **High** | [`App.jsx`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/App.jsx#L100) & [`index.css`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/index.css#L15) | Broken Theme Toggle | Dark/Light switch par card glaring white aur background dark reh jata hai. |
| **1.3** | 🟣 **Critical** | [`BookDetails.jsx`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/BookDetails.jsx#L57) | Book Details Page Crash | Book details kholne par white screen/crash (`ReferenceError` & `TypeError`). |
| **1.4** | 🟡 **Medium** | [`MainPage.jsx`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/MainPage.jsx#L45) | User Name Greeting Missing | Header mein user ka original name aane ke bajaye "Good Day, Member" dikhta hai. |
| **1.5** | 🟡 **Medium** | [`Home.jsx`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/Home.jsx#L33) | Wrong "Registered Users" Stat | Users metric card mein total registered users ke bajaye total books dikhata hai. |
| **1.6** | 🟡 **Medium** | [`Orders.jsx`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/Orders.jsx#L83) | Order History ₹0 Price | User ke order history table mein book price hamesha ₹0 show hoti hai. |
| **1.7** | 🔴 **High** | [`AdminDashboard.jsx`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/admin/AdminDashboard.jsx#L36) | Admin 401 Error & Wrong Count | Dashboard unauthorized error throw karta hai aur inventory count galat hoti hai. |
| **1.8** | 🟢 **Low** | [`UserManagement.jsx`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/admin/UserManagement.jsx#L60) | Self-delete Safeguard Bypassed | Admin self-deletion check wrong localStorage key dekhne ki wajah se bypass ho jata hai. |
| **1.9** | 🟢 **Low** | [`AIRecommendations.jsx`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/components/AIRecommendations.jsx#L20) | AI Recommendations Fragility | API response format mein slight change aane par recommendations component crash ho sakta hai. |

---

#### 🔍 Detailed Frontend Issues Breakdown

##### 🔹 Issue 1.1: 100% Zoom par "Enter Library" Button Complete Nahi Dikhta / Cut Ho Jata Hai

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`LandingPage.jsx` (Line 47)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/LandingPage.jsx#L47) |
| **Severity Level** | 🔴 **High** |
| **Problem Description** | 100% Zoom par Landing page ke Hero section mein "Enter Library" button cut ho jata hai ya poora viewport ke bahar nikal kar chhip jata hai. Standard screens (1366x768, 1080p browser toolbars ke saath, ya Windows 125% DPI scale) par content overflow hota hai aur user button tak nahi pahunch pata. |
| **Root Cause** | Section `#home` par rigid `h-screen` (rigid 100vh) aur `overflow-hidden` laga hua hai. H1 heading ki `min-h-[350px]`, large margins (`mb-8`, `mb-12`), aur button ka padding `py-6` viewport height se zyada ho jata hai, jisse overflow content chhip jata hai. |
| **Proposed Solution** | • `#home` se rigid `h-screen` aur `overflow-hidden` hatana, uski jagah `min-h-screen py-24 flex items-center justify-center` use karna.<br>• Background blur orbs ke container par `overflow-hidden pointer-events-none` isolate karna taaki scrollbar na aaye.<br>• Heading `min-h-[280px] md:min-h-[350px]` ko responsive banakar `min-h-[200px] md:min-h-[260px]` karna.<br>• Button padding ko `px-8 sm:px-12 py-4 sm:py-5` optimize karna taaki 100% zoom par har screen par complete button visible aur clickable rahe. |

---

##### 🔹 Issue 1.2: Theme Toggle Broken & Mismatched UI (White Card on Dark Background)

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`App.jsx` (Line 100)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/App.jsx#L100) & [`index.css` (Line 15)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/index.css#L15) |
| **Severity Level** | 🔴 **High** |
| **Problem Description** | Light mode select karne par (Moon icon click karne par) Login card glaring white ho jata hai jabki background aur header texts dark hi rehte hain! Interface ajeeb mismatched lagta hai. |
| **Root Cause** | 1. Tailwind CSS v4 use ho raha hai (`@import "tailwindcss";`). Tailwind v4 mein class-based dark mode ke liye `@custom-variant dark (&:where(.dark, .dark *));` define hona zaroori hota hai, warna Tailwind OS system dark mode ko default manta hai.<br>2. `App.jsx` mein `darkMode` state change hone par `dark` class sirf ek inner `<div>` par lagti hai, `document.documentElement` (`<html class="dark">`) par nahi lagti.<br>3. `index.css` mein `.dark body` likha hai jo invalid selector hai (body kabhi `.dark` ka child nahi hota). |
| **Proposed Solution** | • `index.css` mein `@custom-variant dark (&:where(.dark, .dark *));` add karna.<br>• `App.jsx` mein `useEffect` se `document.documentElement.classList.toggle('dark', darkMode)` apply karna.<br>• Base styles mein `html.dark` aur `body` ke light/dark background colors ko seamlessly synchronize karna: `bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50`. |

---

##### 🔹 Issue 1.3: Book Details Page White Screen / Complete Crash

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`BookDetails.jsx` (Line 57)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/BookDetails.jsx#L57) |
| **Severity Level** | 🟣 **Critical** |
| **Problem Description** | Kisi bhi book par click karke `/books/:id` open karne par poora page white ho jata hai aur application crash ho jati hai. |
| **Root Cause** | 1. Backend se response `{ success: true, data: book }` format mein aata hai, lekin frontend `data.data.book` dhoondhta hai jo `undefined` hota hai. Iske baad `data.data.book.category` par access karne se `TypeError: Cannot read properties of undefined` throw hota hai.<br>2. Saath hi `setRelatedBooks` function use hua hai jo component mein kabhi `useState` mein declare hi nahi kiya gaya, jisse `ReferenceError: setRelatedBooks is not defined` aata hai. |
| **Proposed Solution** | • Book data mapping fix karna: `const bookData = data.data?.book || data.data; setBook(bookData);`.<br>• Missing state declare karna: `const [relatedBooks, setRelatedBooks] = useState([]);`.<br>• `bookData.category` lookup ko optional chaining ke saath safeguard karna. |

---

##### 🔹 Issue 1.4: Greeting Mein User Ka Real Name Nahi Dikhta ("Good Day, Member")

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`MainPage.jsx` (Line 45)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/MainPage.jsx#L45) |
| **Severity Level** | 🟡 **Medium** |
| **Problem Description** | Login karne ke baad dashboard/main page par user ka asli naam show hone ke bajaye hamesha fallback generic greeting "Good Day, Member" dikhai deta hai. |
| **Root Cause** | Component `user?.name?.split(' ')[0]` check karta hai, jabki `AuthContext` user object ko `{ success: true, data: { name, ... } }` structure mein store karta hai. Is wajah se `user.name` hamesha `undefined` rehta hai. |
| **Proposed Solution** | Greeting extractor ko safe banana: `(user?.data?.name || user?.name)?.split(' ')[0] || 'Member'`. |

---

##### 🔹 Issue 1.5: "Registered Users" Metric Card Mein Book Titles Ka Count Show Hota Hai

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`Home.jsx` (Line 33)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/Home.jsx#L33) |
| **Severity Level** | 🟡 **Medium** |
| **Problem Description** | Public Home page par "Registered Users" metric card par registered users ki sankhya ke bajaye books ki total quantity show ho rahi hai. |
| **Root Cause** | Backend endpoint `/api/books/stats/public` response mein `totalUsers` field nahi bhejta tha. Frontend ne fallback ke taur par `statsRes.data.data.totalBooks` ko hi `totalUsers` state mein assign kar diya tha. |
| **Proposed Solution** | • Backend `bookController.js` ke `getLibraryStats` endpoint mein `User.countDocuments()` execute karke `totalUsers` response mein return karna.<br>• Frontend par `totalUsers: statsRes.data.data.totalUsers || statsRes.data.data.totalBooks` state set karna. |

---

##### 🔹 Issue 1.6: Order History Table Mein Price Hamesha ₹0 Dikhti Hai

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`Orders.jsx` (Line 83)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/Orders.jsx#L83) |
| **Severity Level** | 🟡 **Medium** |
| **Problem Description** | Users jab "My Orders / Borrowed Books" page kholte hain toh har book ke samne price hamesha "₹0" dikhti hai chahe book ki actual price kuch bhi ho. |
| **Root Cause** | Backend endpoint `/api/transactions/my-books` Book model ko populate karte waqt `price` field ko projection query mein include nahi karta (`populate('book', 'title author isbn category')`), isliye frontend ko `book.price` `undefined` milti hai. |
| **Proposed Solution** | Backend query mein `'title author isbn category price'` populate karna aur frontend table mein safe fallback `order.book?.price || order.price || 0` format karna. |

---

##### 🔹 Issue 1.7: Admin Dashboard Loads With 401 Error & Inaccurate Inventory

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`AdminDashboard.jsx` (Line 36)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/admin/AdminDashboard.jsx#L36) |
| **Severity Level** | 🔴 **High** |
| **Problem Description** | Admin dashboard load hote hi console mein `GET /api/users 401 (Unauthorized)` error aati hai aur total books ka count galat show hota hai. |
| **Root Cause** | 1. `axios.get(`${API_URL}/users`)` ko bina JWT Authorization header ke call kiya gaya hai.<br>2. Book inventory count calculate karne ke liye paginated books endpoint se sirf first 10 books fetch kiye ja rahe hain, jabki backend par already accurate analytics endpoint `/api/analytics/dashboard` maujood hai. |
| **Proposed Solution** | Admin requests ke saath JWT Bearer token attach karna aur hardcoded fragmented API calls ke badle dedicated backend analytics endpoint `/api/analytics/dashboard` integrate karna. |

---

##### 🔹 Issue 1.8: Self-Delete Protection Frontend Check Fails

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`UserManagement.jsx` (Line 60)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/admin/UserManagement.jsx#L60) |
| **Severity Level** | 🟢 **Low** |
| **Problem Description** | Admin user management screen par logged-in admin ko khud ka delete button disabled milna chahiye, par check fail hone ke karan wo active dikhta hai. |
| **Root Cause** | Frontend code `localStorage.getItem('user')` check karta hai, jabki pooray application mein authentication token aur user data `'userInfo'` key ke andar save hoti hai. |
| **Proposed Solution** | User storage key ko correct karna: `const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}'); const currentId = currentUser?.data?._id || currentUser?._id;`. |

---

##### 🔹 Issue 1.9: Potential UI Crash on Standardized API Responses

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`AIRecommendations.jsx` (Line 20)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/components/AIRecommendations.jsx#L20) |
| **Severity Level** | 🟢 **Low** |
| **Problem Description** | Agar AI recommendation service standard wrapper `{ success: true, data: [...] }` return kare toh component `.map` execute karte waqt crash ho sakta hai. |
| **Root Cause** | Component bina validation ke direct `setRecommendations(data)` call kar deta hai. Agar `data` plain array ke bajaye object format mein ho toh array methods fail ho jayenge. |
| **Proposed Solution** | Safe array extractor add karna: `setRecommendations(Array.isArray(data) ? data : (data.data || []));`. |

---

### 2. Backend Logic, Crashes & Security Issues

#### 📊 Backend Issues Summary Table

| # | Severity | Component / File | Issue Title | Impact Summary |
| :---: | :---: | :--- | :--- | :--- |
| **2.1** | 🟣 **Critical** | [`transactionController.js`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/controllers/transactionController.js#L176-L207) | Overdue Book Return Server Crash | Overdue book return karne par server 500 error ke saath crash ho jata hai (`ReferenceError`). |
| **2.2** | 🟣 **Critical** | [`transactionController.js`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/controllers/transactionController.js#L8) & [`reservationUtils.js`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/utils/reservationUtils.js#L3) | Email Dispatch Method Missing Crash | Controller galat module import karta hai jisse email send fail aur crash ho jata hai (`TypeError`). |
| **2.3** | 🔴 **High** | [`uploadRoutes.js`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/routes/uploadRoutes.js#L55) | Uploaded File 404 Broken Paths | Uploaded book cover images aur PDFs browser mein 404 broken link show hote hain. |
| **2.4** | 🔴 **High** | [`validateRequest.js`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/middleware/validateRequest.js#L53) | Zod Rejects Uploaded Relative URLs | New book create karte waqt uploaded files Zod validation error se reject ho jati hain. |
| **2.5** | 🔴 **High** | [`aiController.js`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/controllers/aiController.js#L24) | Deleted Book AI Recommendation Crash | Agar user history ki koi book delete ho gayi ho toh AI recommendations 500 crash throw karta hai. |
| **2.6** | 🟡 **Medium** | [`reminder.js`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/jobs/reminder.js#L17-L45) | Overdue Reminders Silenced After Day 1 | Overdue books ko sirf pehle din 1 reminder milta hai, uske baad cron reminders hamesha ke liye band ho jate hain. |
| **2.7** | 🟡 **Medium** | [`AuthContext.jsx`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/contexts/AuthContext.jsx#L28-L31) | Stale Session & Role Desync | User role change ya profile update hone par refresh karne par stale cached data reinstate ho jata hai. |
| **2.8** | 🟡 **Medium** | [`backend/.env`](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/.env#L3) | Mismatched Frontend Port (3000 vs 5173) | Verification aur password reset emails ke links port 3000 par point karte hain (connection refused). |

---

#### 🔍 Detailed Backend Issues Breakdown

##### 🔹 Issue 2.1: Fatal Server Crash When Returning Overdue Book

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`transactionController.js` (Lines 176-207)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/controllers/transactionController.js#L176-L207) |
| **Severity Level** | 🟣 **Critical** |
| **Problem Description** | Jab koi user aisi book return karta hai jo due date ke baad return ho rahi ho (overdue fine applicable ho), backend turant crash ho jata hai aur frontend par 500 Internal Server Error show hota hai. |
| **Root Cause** | `const fineRecord` variable `if (daysOverdue > 0)` block ke andar scoped hai, lekin response bhejte waqt block ke bahar access kiya gaya hai: `fine: fineRecord ? { ... } : null`. Isse JavaScript runtime `ReferenceError: fineRecord is not defined` throw karta hai. Saath hi `transaction.book.title` unpopulated field par access hota hai jisse notification title mein `"Book undefined returned"` chala jata hai. |
| **Proposed Solution** | • `let fineRecord = null;` ko if-block ke bahar function level par declare karna.<br>• `transaction.book` ko populate karke actual title access karna taaki notification text sahi rahe.<br>• Return handling logic ko try-catch ke saath safeguard karna. |

---

##### 🔹 Issue 2.2: Email Dispatch Throws `TypeError: ... is not a function`

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`transactionController.js` (Line 8)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/controllers/transactionController.js#L8) & [`reservationUtils.js` (Line 3)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/utils/reservationUtils.js#L3) |
| **Severity Level** | 🟣 **Critical** |
| **Problem Description** | Transaction complete hone par ya reservation confirm hone par email dispatch attempt fail ho jati hai aur console mein fatal `TypeError` log hota hai. |
| **Root Cause** | Controllers `../utils/emailService` ko import karte hain (jo sirf low-level nodemailer transporter object export karta hai) aur uspar `emailService.sendOrderConfirmation(...)` ya `sendEmail(...)` call karte hain jo transporter par exist hi nahi karte. Saare formatted HTML email sender methods `../services/emailSender.js` file mein hain! |
| **Proposed Solution** | Import path ko correct karna: `const emailSender = require('../services/emailSender');` aur appropriately `emailSender.sendOrderConfirmation(...)` aur `emailSender.sendReservationNotification(...)` call karna. |

---

##### 🔹 Issue 2.3: Uploaded Files (Images/PDFs) Broken 404 on Frontend

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`uploadRoutes.js` (Line 55)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/routes/uploadRoutes.js#L55) |
| **Severity Level** | 🔴 **High** |
| **Problem Description** | Admin jab book cover image ya PDF upload karta hai toh upload success dikhta hai lekin preview image aur uploaded book cover 404 Not Found error ke saath broken icon dikhati hai. |
| **Root Cause** | Upload route backend server ka full physical Windows path return kar raha hai (`/C:/Users/Lenovo/.../uploads/file.png`). Browser is absolute local filesystem path ko HTTP static asset ke taur par load nahi kar sakta. |
| **Proposed Solution** | Sahi web-accessible relative URL return karna: `url: `/uploads/${req.file.filename}`` aur file upload validation check lagana (`if (!req.file) return res.status(400)...`). |

---

##### 🔹 Issue 2.4: Uploaded Book Covers & PDFs Fail Zod Validation

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`validateRequest.js` (Line 53)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/middleware/validateRequest.js#L53) |
| **Severity Level** | 🔴 **High** |
| **Problem Description** | Admin jab system se local image ya PDF upload karke "Create Book" button dabata hai toh form submit nahi hota aur validation error show hoti hai. |
| **Root Cause** | Zod schema mein strict `image: z.string().url()` enforce kiya gaya hai. File upload se jo relative URL aati hai (`/uploads/cover-123.jpg`), Zod use absolute URL (`http://...`) na hone ke karan reject kar deta hai. |
| **Proposed Solution** | Zod schema ko update karke allow karna: absolute URLs (`http://`, `https://`), relative upload paths (`/uploads/...`), aur empty strings. |

---

##### 🔹 Issue 2.5: AI Recommendations 500 Error If Book Was Deleted

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`aiController.js` (Line 24)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/controllers/aiController.js#L24) |
| **Severity Level** | 🔴 **High** |
| **Problem Description** | AI Recommendations tab kholne par server 500 crash throw karta hai agar user ne past mein aisi book issue karwai ho jo library inventory se delete ho chuki hai. |
| **Root Cause** | Borrowing history se user preferences (categories, authors, tags) nikalte waqt null check nahi hai. Deleted book hone par `t.book` null hota hai, aur `t.book.category` access karne se server crash ho jata hai. |
| **Proposed Solution** | Preferences calculate karne se pehle populated references ko filter karna: `const validHistory = history.filter(t => t.book);`. |

---

##### 🔹 Issue 2.6: Overdue Books Only Receive 1 Single Reminder, Then Stopped Forever

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`reminder.js` (Lines 17-45)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/jobs/reminder.js#L17-L45) |
| **Severity Level** | 🟡 **Medium** |
| **Problem Description** | Jo users due date nikalne ke baad bhi book return nahi karte, unhe sirf pehle din 1 reminder milta hai, uske baad wo transaction overdue hi padi rehti hai aur system unhe dobara reminder nahi bhejta. |
| **Root Cause** | Cron job status ko `'issued'` se badal kar `'overdue'` mark kar deta hai. Agle din cron job ki query sirf `status: 'issued'` dhoondhti hai, isliye status `'overdue'` ho chuki books query se permanently exclude ho jati hain. |
| **Proposed Solution** | Reminder query ko update karna: `status: { $in: ['issued', 'overdue'] }` taaki jab tak book physically return na ho, daily reminder aur overdue notice seamlessly bhejte rahein. |

---

##### 🔹 Issue 2.7: Stale Cached Session Data & Role Synchronization Issue

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`AuthContext.jsx` (Lines 28-31)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/contexts/AuthContext.jsx#L28-L31) |
| **Severity Level** | 🟡 **Medium** |
| **Problem Description** | Agar kisi user ka role admin banaya jaye ya profile update ho, page refresh karne par wapas purana role ya purana data restore ho jata hai. |
| **Root Cause** | App initialization par `/api/auth/profile` se fresh user record fetch kiya jata hai, lekin response aane ke baad use state mein update karne ke bajaye discard kar diya jata hai aur localStorage ki stale string hi state mein rehti hai. |
| **Proposed Solution** | Backend se profile fetch hone par `setUser(freshData)` aur `localStorage.setItem('userInfo', JSON.stringify(freshData))` dono ko seamlessly sync karna. |

---

##### 🔹 Issue 2.8: Email Verification and Reset Password Links Point to Wrong Port (3000 vs 5173)

| Attribute | Details |
| :--- | :--- |
| **Component / File** | [`backend/.env` (Line 3)](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/.env#L3) |
| **Severity Level** | 🟡 **Medium** |
| **Problem Description** | Registration email verification aur reset password link par click karne par browser "This site can't be reached (Connection refused)" error dikhata hai. |
| **Root Cause** | `backend/.env` mein `FRONTEND_URL=http://localhost:3000` set hai, jabki React Vite frontend development server `http://localhost:5173` par chal raha hai. |
| **Proposed Solution** | `backend/.env` mein `FRONTEND_URL=http://localhost:5173` update karna taaki user click karte hi sidha active frontend app par redirect ho sake. |

---

## Proposed Changes

### Phase 1: Frontend Fixes

#### [MODIFY] [index.css](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/index.css)
- Tailwind v4 class-based dark mode configuration: `@custom-variant dark (&:where(.dark, .dark *));` add karna.
- Invalid `.dark body` selector ko replace karke clean root theme styles setup karna:
  ```css
  html.dark {
    color-scheme: dark;
  }
  body {
    @apply bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 antialiased font-sans transition-colors duration-300;
  }
  ```

#### [MODIFY] [App.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/App.jsx)
- `useEffect` add karna jo `darkMode` change hone par `document.documentElement.classList.toggle('dark', darkMode)` run kare.
- Root wrapper background class ko harmonize karna taaki whole app (header, main container, inputs, cards) ek saath seamlessly switch kare bina kisi visual mismatch ke.

#### [MODIFY] [LandingPage.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/LandingPage.jsx)
- Hero section `#home` se rigid `h-screen` aur `overflow-hidden` hatana, uski jagah `min-h-screen py-24 flex items-center justify-center` use karna.
- Background blur orbs ke container par `overflow-hidden pointer-events-none` maintain karna taaki background scrollbars na laye.
- Heading `min-h-[280px] md:min-h-[350px]` ko responsive banakar `min-h-[200px] md:min-h-[260px]` karna.
- Button padding ko `px-8 sm:px-12 py-4 sm:py-5` optimize karna taaki 100% zoom par har screen par complete "Enter Library" button prominently visible rahe.

#### [MODIFY] [BookDetails.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/BookDetails.jsx)
- Fix book data mapping: `const bookData = data.data?.book || data.data; setBook(bookData);`.
- Declare missing state: `const [relatedBooks, setRelatedBooks] = useState([]);`.
- Safeguard `bookData.category` lookup for related books.

#### [MODIFY] [MainPage.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/MainPage.jsx)
- User greeting ko update karna: `(user?.data?.name || user?.name)?.split(' ')[0] || 'Member'`.

#### [MODIFY] [Home.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/Home.jsx)
- Metrics state update karna: `totalUsers: statsRes.data.data.totalUsers || statsRes.data.data.totalBooks`.

#### [MODIFY] [Orders.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/Orders.jsx)
- Price display ko properly handle karna aur fallback ensure karna.

#### [MODIFY] [AdminDashboard.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/admin/AdminDashboard.jsx)
- Authorization header attach karna aur backend endpoint `GET /api/analytics/dashboard` integrate karna.

#### [MODIFY] [UserManagement.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/pages/admin/UserManagement.jsx)
- LocalStorage check ko `'userInfo'` se read karna: `const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}'); const currentId = currentUser?.data?._id || currentUser?._id;`.

#### [MODIFY] [AIRecommendations.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/components/AIRecommendations.jsx)
- Array safety check add karna: `setRecommendations(Array.isArray(data) ? data : (data.data || []));`.

#### [MODIFY] [AuthContext.jsx](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/frontend/src/contexts/AuthContext.jsx)
- Session restore ke waqt backend ke fresh profile data ko state aur localStorage dono mein update karna.

---

### Phase 2: Backend Fixes

#### [MODIFY] [transactionController.js](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/controllers/transactionController.js)
- `let fineRecord = null;` ko block ke bahar declare karna taaki return response crash na ho.
- `transaction.book` ko populate karke title read karna taaki notification title sahi ho.
- `emailSender` (`../services/emailSender`) ko import karna na ki `utils/emailService`.
- `buyBook` mein notification creation ko response se pehle execute/await karna.
- `getMyTransactions` mein `price` field ko book populate list mein add karna.

#### [MODIFY] [reservationController.js](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/controllers/reservationController.js) & [reservationUtils.js](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/utils/reservationUtils.js)
- `const emailSender = require('../services/emailSender');` use karna.
- `emailSender.sendReservationNotification` aur `emailSender.send(...)` methods safely call karna.

#### [MODIFY] [uploadRoutes.js](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/routes/uploadRoutes.js)
- Check `if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });`.
- Clean relative path return karna: `url: `/uploads/${req.file.filename}``.

#### [MODIFY] [validateRequest.js](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/middleware/validateRequest.js)
- Image aur pdfUrl validation ko flexible banana: allow both full URLs (`http://...`) aur relative upload paths (`/uploads/...`) as well as empty strings.

#### [MODIFY] [aiController.js](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/controllers/aiController.js)
- Null book references filter karna: `const validHistory = history.filter(t => t.book);`.

#### [MODIFY] [reminder.js](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/jobs/reminder.js)
- Overdue query update karna: `status: { $in: ['issued', 'overdue'] }` taaki daily overdue notices bhejti rahein.

#### [MODIFY] [bookController.js](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/controllers/bookController.js)
- `getLibraryStats` endpoint mein `User.countDocuments()` add karna aur `totalUsers` response mein return karna.

#### [MODIFY] [.env](file:///c:/Users/Lenovo/OneDrive/Desktop/New%20folder%20%283%29/Libary-Management/backend/.env)
- `FRONTEND_URL=http://localhost:5173` update karna taaki emails se aane wale link Vite dev server par sahi se khulein.

---

## Verification Plan

### Automated / Browser Verification
1. **Theme Toggle Test (Light & Dark):**
   - Theme toggle click karke verify karenge ki poora page (background, text, inputs, cards) consistent light mode aur dark mode mein convert hota hai. Light mode mein card aur background dono white/slate-50 honge aur text slate-900 hoga.
2. **Landing Page Zoom Test:**
   - Chrome / Browser subagent se Landing Page kholkar 100% zoom (viewport 1280x720 & 1920x1080) par verify karenge ki "Enter Library" button poori tarah visible aur clickable hai.
3. **Book Details Page Test:**
   - `/books/:id` par navigate karke verify karenge ki page crash hone ke bajaye book details, category aur related books smoothly render karta hai.
4. **Overdue Return & Fine Flow:**
   - API se transaction return trigger karke check karenge ki `ReferenceError` resolve ho gaya hai aur fine create ho raha hai.
5. **Image/PDF Upload & Book Create:**
   - File upload karke verify karenge ki return URL `/uploads/...` format mein hai aur Zod validation pass ho rahi hai.
6. **Dashboard & Analytics:**
   - Admin overview page verify karenge ki live stats load ho rahe hain without 401 error.
