# Debitum - Debt Visualization Monorepo

Debitum is a full-stack web application designed to help users manage and visualize their debts over time. It features a modern frontend built with Vue.js, Vite, and Tailwind CSS, and a backend powered by Hapi.js with a SQLite database.

## Project Structure

This project is a monorepo managed with Yarn Workspaces, containing two main packages:

-   `packages/frontend`: The single-page application (SPA) built with Vue 3, Vite, Tailwind CSS, and TypeScript.
-   `packages/backend`: The REST API built with Hapi.js, using SQLite for data persistence and JSDoc for API documentation.

```
debitum/
├── packages/
│   ├── backend/
│   │   ├── src/             # Backend source code (Hapi.js, SQLite setup, routes)
│   │   ├── migrations/      # Database migration files
│   │   └── package.json     # Backend dependencies and scripts
│   └── frontend/
│       ├── src/             # Frontend source code (Vue components, stores, router)
│       ├── public/          # Static assets
│       └── package.json     # Frontend dependencies and scripts
├── .github/               # GitHub Actions workflows (for CI/CD)
├── .husky/                # Git hooks for commit linting
├── .vscode/               # VS Code specific settings
├── commitlint.config.js   # Commitlint configuration
├── .eslintrc.js           # ESLint configuration
├── .prettierrc.js         # Prettier configuration
├── package.json           # Root package.json for Yarn Workspaces
├── yarn.lock              # Yarn lock file
└── README.md              # Project README and deployment guide
```

## Features

### Backend

-   **REST API**: Provides endpoints for managing debt entries and global financial information.
-   **SQLite Database**: Lightweight, file-based database for persistent storage.
-   **JSDoc Documentation**: API endpoints are documented using JSDoc for clarity and maintainability.
-   **Robust Error Handling**: Centralized error handling using `@hapi/boom` for consistent and informative error responses.

### Frontend

-   **Dashboard**: Visualizations (pie charts, bar charts, Gantt chart) showing debt distribution, monthly burden, and future projections.
-   **Admin Area**: Form to input and update global financial information (monthly income, max % of income to spend on debt).
-   **Debt Entry Page**: Form to input new debt entries.
-   **Responsive Layout**: Left-side collapsible sidebar and main content area.
-   **State Management**: Utilizes Pinia for efficient and centralized state management.
-   **API Integration**: Seamless communication with the backend API.
-   **Loading Indicators & Notifications**: Provides user feedback during API calls and for success/error messages.
-   **Form Validation**: Client-side validation for user input.

## Getting Started

### Prerequisites

-   Node.js (v22 or higher recommended)
-   Yarn (v1.x Classic recommended)
-   Git

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/debitum.git
    cd debitum
    ```

2.  **Install dependencies:**

    This will install dependencies for both the root and all workspaces.

    ```bash
    yarn install
    ```

### Running the Application

1.  **Start the backend server:**

    ```bash
    yarn workspace @debitum/backend start
    # Or for development with nodemon:
    # yarn workspace @debitum/backend dev
    ```

    The backend server will typically run on `http://localhost:3000`.

2.  **Start the frontend development server:**

    ```bash
    yarn workspace @debitum/frontend dev
    ```

    The frontend application will typically be available at `http://localhost:5173` (or another available port).

## Development

### Linting and Formatting

This project uses ESLint and Prettier for code quality and consistent formatting.

-   **Run ESLint:**

    ```bash
    yarn lint
    ```

-   **Run Prettier:**

    ```bash
    yarn format
    ```

### Testing

-   **Run backend tests:**

    ```bash
    yarn workspace @debitum/backend test
    ```

-   **Run frontend tests:**

    ```bash
    yarn workspace @debitum/frontend test
    ```

### Database

The backend uses SQLite, a file-based database. The database file (`debitum.db`) will be created in the `packages/backend` directory when the server starts for the first time. For testing, a separate `debitum_test_*.db` file is created per test run.

## Deployment Considerations

### Building for Production

To create optimized production builds for both frontend and backend:

1.  **Build the frontend:**

    ```bash
    yarn workspace @debitum/frontend build
    ```
    This will generate production-ready static assets in `packages/frontend/dist`.

2.  **Build the backend (install production dependencies):**

    ```bash
    yarn workspace @debitum/backend build
    ```
    This command will install only production dependencies for the backend, making the deployment package smaller.

### Running in Production

After building, you can serve the application in a production environment.

1.  **Serve the backend:**

    ```bash
    node packages/backend/src/index.js
    ```
    Ensure that the `PORT` environment variable is set if you need the backend to listen on a port other than `3000`.

2.  **Serve the frontend:**

    The `packages/frontend/dist` directory contains static files. You can serve these files using any static file server (e.g., Nginx, Apache, or a simple Node.js static server).

    Example using `serve` (install globally: `npm install -g serve` or `yarn global add serve`):

    ```bash
    serve -s packages/frontend/dist
    ```

### Environment Variables

-   `PORT`: (Backend) Specifies the port the Hapi.js server will listen on. Defaults to `3000`.
-   `DB_PATH`: (Backend) Specifies the path to the SQLite database file. Defaults to `../debitum.db` relative to `src/db.js`.

### CI/CD

Consider setting up CI/CD pipelines (e.g., GitHub Actions, GitLab CI/CD, Jenkins) to automate testing, building, and deployment processes. The `.github/workflows` directory can be used for GitHub Actions configurations.

### Security

-   **HTTPS**: Always use HTTPS in production environments to encrypt communication between the client and server.
-   **Input Validation**: Backend uses Joi for input validation, but ensure all user inputs are properly sanitized and validated to prevent common web vulnerabilities (e.g., SQL injection, XSS).
-   **Dependency Audits**: Regularly audit your project dependencies for known vulnerabilities using `yarn audit` or `npm audit`.

## Project Status

This project is currently in active development. The core functionalities for debt management and visualization are implemented. Further enhancements and features will be added based on the detailed plan.

## Contributing

Contributions are welcome! Please follow the [contribution guidelines](CONTRIBUTING.md) (to be created).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details (to be created).
