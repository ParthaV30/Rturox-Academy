# 🎓 Rturox Academy Registration Portal

A modern, responsive, and feature-rich **Internship & Professional Courses Registration Portal** built for **Rturox Tech Studio**. This portal features an interactive multi-step application wizard for students and a secure administrative dashboard for coordinators to manage, filter, analyze, and export applicant data.

---

## ✨ Features

### 🌟 Student Registration Portal (`index.html`)
* **Interactive Program Tabs**: Seamlessly switch between *Internship Programs* and *Professional Courses* to explore available domains.
* **3-Step Application Wizard**:
  1. **Personal Information**: Full name, email, phone, and WhatsApp numbers (with real-time format validation).
  2. **Program & Course Selection**: Dynamic dropdown lists matching the selected program type (Internship, Course, or Both).
  3. **Academic Background**: College details, graduation year, profiles (GitHub & LinkedIn), and statement of purpose.
* **Real-time Client Validation**: Instant visual feedback for empty required inputs, invalid email formats, and incorrect phone numbers.
* **WhatsApp Quick Confirmation**: Upon successful registration, candidates are provided a one-click CTA to send their prefilled application details to the academic coordinator via WhatsApp.

### 📊 Coordinator Dashboard (`admin.html`)
* **Passcode Gate**: Secured with a 4-digit PIN (`2026`) preventing unauthorized access. Session persistence is managed securely.
* **Database & Analytics Dashboard**:
  * **Real-time Statistics**: Tracks total applicants, internship applications, course enrollments, and pending reviews.
  * **Visual Distribution Charts**: Displays proportion of internships vs. courses, and visual percentage bars representing demand for Python, Java, and MERN/Next.js domains.
* **Applicant Data Table**:
  * Paginated/sorted tabular view displaying candidate metadata, status pills, and direct detail view drawer triggers.
  * Search bar filters dynamically by Candidate ID, Name, College, and Email.
  * Dropdown filters to sort by Program Type, Application Status, and Tech Domain.
* **Slide-out Details Drawer**:
  * View comprehensive candidate information.
  * Update application status (Pending 🟡, Interview 🔵, Accepted 🟢, Rejected 🔴) or delete candidate records.
  * Direct outreaches: Single-click prefilled WhatsApp message and preformatted Email client trigger.
* **Utility Tools**:
  * **Mock Seeding**: Seed random candidate records for quick local system testing.
  * **CSV Data Export**: Export the entire candidate database to a spreadsheet-compatible `.csv` file.
  * **Wipe Database**: Admin utility to purge database records.

---

## 🛠️ Tech Stack

* **Frontend**: Vanilla HTML5, CSS3 (Custom Variables, Glassmorphism gradients, Flexbox/Grid), and Modern JavaScript (ES6+).
* **Icons & Fonts**: Google Fonts (Inter/Outfit/Fira Code), FontAwesome Icons.
* **State Management**: Browser `localStorage` (for candidate persistence) and `sessionStorage` (for coordinator authorization).
* **Development Server**: `live-server` for instant hot-reloading.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/ParthaV30/Rturox-Academy.git
   cd Rturox-Academy
   ```

2. Install development dependencies:
   ```bash
   npm install
   ```

### Running Locally
To start the hot-reloading local development server:
```bash
npm run dev
```
The application will start serving at `http://127.0.0.1:8080/index.html` (or another available port).

---

## 🔒 Security & Admin Details
* The dashboard page (`admin.html`) requests a **Coordinator PIN**.
* **Default PIN**: `2026`
* Upon inputting `2026`, a session key `admin_authenticated = true` is placed in `sessionStorage`. Logging out clears this token.

---

## 📁 Project Structure

```text
├── index.html       # Landing page and registration form
├── admin.html       # Coordinator admin portal & dashboard UI
├── app.js           # Multi-step validation, dashboard logic & seed utilities
├── style.css        # Stylesheet containing responsive layout & theme rules
├── vercel.json      # Production Vercel configuration
├── package.json     # Node scripts and dependencies
└── README.md        # Documentation
```

---

## 🚀 Deploying to Production

This project is a static site and can be deployed directly to cloud hosting platforms.

### 🔺 Deploy to Vercel (Recommended)
Vercel offers zero-configuration hosting for static sites, and automatically handles SSL certificates and CDN caching.

1. **Push your code** to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com).
3. Click **"New Project"** and import the `Rturox-Academy` repository.
4. Leave the **Build and Output Settings** at their default values (there is no build step needed).
5. Click **"Deploy"**. Vercel will deploy the site and provide a public URL.
6. The `vercel.json` file in this repository will automatically set up clean URLs (e.g. yoursite.com/admin instead of yoursite.com/admin.html) and apply security headers.

### ☁️ Deploy to AWS

#### Option A: AWS Amplify (Easiest)
1. Log in to the [AWS Management Console](https://aws.amazon.com) and navigate to **AWS Amplify**.
2. Click **"New App"** -> **"Host web app"**.
3. Select **GitHub** and authorize Amplify to access your repository.
4. Choose the repository and the `main` branch.
5. In the build settings, Amplify will auto-detect the static site. Confirm the settings and click **"Save and Deploy"**.

#### Option B: Amazon S3 & CloudFront
1. Navigate to **Amazon S3** and create a new bucket (e.g. `rturox-academy-portal`).
2. Upload the project files (`index.html`, `admin.html`, `app.js`, `style.css`, `vercel.json`) to the root of the bucket.
3. Enable **Static Website Hosting** under the bucket's *Properties* tab, setting `index.html` as the index document.
4. To secure the site with HTTPS, create a distribution in **Amazon CloudFront**, pointing the origin to the S3 bucket's website endpoint.

---

## 💡 Developer Guidelines
* **Responsive Styling**: Ensure CSS variables from `style.css` are used for color theme consistency.
* **Local Database**: All user submissions target the `rturox_candidates` key in `localStorage` in the browser, making it completely serverless.
