# ☁️ Cloud-Based To-Do List Application

A cloud computing micro-project where users register, log in and manage personal tasks stored in **Firebase Cloud Firestore**.

## Description
Tasks are saved in the cloud instead of the browser, so users can access them from any device after logging in. Each user can only see their own tasks (enforced by Firestore Security Rules).

## Features
- Register, login, logout (Firebase Authentication) with clear error messages
- Add, edit, delete tasks (title, description, due date)
- Mark tasks completed / pending
- View All / Pending / Completed tasks, with counters
- Creation date and time shown on every task
- Real-time sync with Cloud Firestore
- Responsive UI (mobile and desktop)

## Technologies
HTML5, CSS3, JavaScript (ES Modules), Firebase Authentication, Cloud Firestore, Firebase Hosting, VS Code

## Folder Structure
```
cloud-todo-app/
├── index.html          # Page structure (login, register, dashboard)
├── style.css           # Styling and responsive design
├── script.js           # Auth + task CRUD logic
├── firebase-config.js  # Firebase configuration (edit this)
├── firestore.rules     # Security rules
├── firebase.json       # Firebase Hosting/Firestore config
└── README.md
```

## Firebase Setup
1. Go to https://console.firebase.google.com and sign in with a Google account.
2. Click **Add project**, enter a name, (disable Google Analytics optionally), click **Create project**.
3. Project Overview → click the **</>** (Web) icon → give an app nickname → **Register app**.
4. Copy the `firebaseConfig` object shown.
5. Paste the values into `firebase-config.js`, replacing every `YOUR_...` placeholder.
6. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**
7. **Build → Firestore Database → Create database** → choose a location → start in **production mode**.
8. Open the **Rules** tab, paste the contents of `firestore.rules`, click **Publish**.

The `users/{uid}/tasks` collection is created automatically when you add your first task.

## How to Run
Firebase modules need a web server (opening the file directly will not work).
- In VS Code install the **Live Server** extension, right-click `index.html` → **Open with Live Server**.
- Alternatively: `npx firebase-tools serve` or `python -m http.server 5500`.

## How to Deploy
```
npm install -g firebase-tools
firebase login
firebase init        # select Hosting + Firestore, use existing project, public directory: .  (do NOT overwrite index.html)
firebase deploy
```
Firebase prints a live URL like `https://YOUR_PROJECT_ID.web.app`.
Also add that domain under Authentication → Settings → Authorized domains if it is missing.

## Firestore Structure
```
users (collection)
 └── {userId} (user's UID)
      └── tasks (sub-collection)
           └── {taskId}
                ├── title        (string)
                ├── description  (string)
                ├── dueDate      (string, YYYY-MM-DD)
                ├── completed    (boolean)
                ├── createdAt    (timestamp)
                └── userId       (string)
```

## Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{taskId} {
      allow read, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId
                    && request.resource.data.userId == userId
                    && request.resource.data.title is string
                    && request.resource.data.title.size() > 0
                    && request.resource.data.title.size() <= 100;
      allow update: if request.auth != null && request.auth.uid == userId
                    && request.resource.data.userId == userId;
    }
    match /{document=**} { allow read, write: if false; }
  }
}
```

## Future Scope
Task reminders and notifications, Google login, dark mode, priority levels, categories, AI-based task suggestions, mobile app.

## Note
Replace the values in `firebase-config.js` with your own Firebase project configuration (Project settings → Your apps).
