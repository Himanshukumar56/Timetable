# Timetable - A Student Planner Application

This is a modern, feature-rich student planner application designed to help students organize their academic life. It provides tools for managing schedules, tracking grades, setting reminders, and much more.

## Features

*   **Weekly Schedule:** Visualize your weekly timetable at a glance.
*   **Daily Tasks:** Keep track of your daily assignments and to-dos.
*   **Exam Countdown:** Never miss an important exam with a countdown timer.
*   **Grade Tracker:** Monitor your academic performance by tracking your grades.
*   **Study Heatmap:** Visualize your study patterns and stay consistent.
*   **Notes & Resources:** A central place to keep your notes and important resources.
*   **Authentication:** Secure user authentication powered by Firebase.
*   **Customizable Themes:** Personalize the look and feel of the application.
*   **Notifications:** Get reminders for important events.

## Tech Stack

*   **Frontend:**
    *   [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
    *   [Vite](https://vitejs.dev/) - A fast build tool for modern web projects.
    *   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
    *   [D3.js](https://d3js.org/) - For data visualization (used in the Study Heatmap).
*   **Backend:**
    *   [Firebase](https://firebase.google.com/) - Used for authentication and database services.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v14 or later)
*   npm or yarn

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/Himanshukumar56/Timetable.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Create a `.env` file in the root of the project and add your Firebase configuration:
    ```
    VITE_API_KEY=your_firebase_api_key
    VITE_AUTH_DOMAIN=your_firebase_auth_domain
    VITE_PROJECT_ID=your_firebase_project_id
    VITE_STORAGE_BUCKET=your_firebase_storage_bucket
    VITE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    VITE_APP_ID=your_firebase_app_id
    ```

### Running the Application

```sh
npm run dev
```

This will start the development server, and you can view the application at `http://localhost:5173`.

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in the development mode.
*   `npm run build`: Builds the app for production to the `dist` folder.
*   `npm run lint`: Lints the project files.
*   `npm run preview`: Serves the production build locally.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
