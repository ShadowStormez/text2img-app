# Text-to-Image Generator with Stable Diffusion

This is a full-stack web application that allows users to generate images from text prompts using the Stability AI API. It features a React frontend and a Node.js/Express backend.

## Features

*   **User Authentication:** Secure login with Google OAuth.
*   **Text-to-Image Generation:** Generate high-quality images from text prompts using Stable Diffusion.
*   **Image Gallery:** View a history of your recently generated images.
*   **Image Preview and Download:** Click on any image to view it in a larger size and download it.
*   **Responsive Design:** A clean and modern UI that works on different screen sizes.

## Project Structure

The project is a monorepo with two main directories:

*   `client/`: Contains the React frontend application.
*   `server/`: Contains the Node.js/Express backend, database schema, and API logic.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [npm](https://www.npmjs.com/)
*   A [Stability AI](https://platform.stability.ai/) account and API key.
*   A [Google Cloud](https://console.cloud.google.com/) project with OAuth 2.0 credentials.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install server dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install client dependencies:**
    ```bash
    cd ../client
    npm install
    ```

## Configuration

The application requires environment variables to be set up for both the client and the server.

### Server Configuration

1.  Navigate to the `server` directory.
2.  Create a `.env` file by copying the example:
    ```bash
    cp .env.example .env
    ```
3.  Edit the `.env` file and add your credentials:
    ```
    # Database
    DATABASE_URL="file:./dev.db"

    # Stability AI
    STABILITY_API_KEY="YOUR_STABILITY_AI_KEY"

    # JSON Web Token
    JWT_SECRET="YOUR_SUPER_SECRET_KEY"

    # Google OAuth
    GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
    GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

    # URLs
    API_URL="http://localhost:5001"
    CLIENT_URL="http://localhost:5173"
    ```

### Client Configuration

1.  Navigate to the `client` directory.
2.  Create a `.env` file by copying the example:
     ```bash
    cp .env.example .env
    ```
3.  Edit the `.env` file and add your API URL:
    ```
    VITE_API_URL="http://localhost:5001"
    ```

## Running the Application

You need to run both the server and the client in separate terminals.

1.  **Run the server:**
    ```bash
    cd server
    npx prisma migrate dev --name init # Set up the database
    npm run dev
    ```
    The server will be running at `http://localhost:5001`.

2.  **Run the client:**
    ```bash
    cd client
    npm run dev
    ```
    The client will be running at `http://localhost:5173`.

Open your browser and navigate to `http://localhost:5173` to use the application.

## Technologies Used

*   **Frontend:**
    *   [React](https://reactjs.org/)
    *   [Vite](https://vitejs.dev/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [Shadcn UI](https://ui.shadcn.com/)
    *   [Embla Carousel](https://www.embla-carousel.com/)

*   **Backend:**
    *   [Node.js](https://nodejs.org/)
    *   [Express](https://expressjs.com/)
    *   [Prisma](https://www.prisma.io/) (with SQLite)
    *   [JWT](https://jwt.io/) for authentication
    *   [Passport.js](http://www.passportjs.org/) with Google Strategy

*   **API:**
    *   [Stability AI API](https://platform.stability.ai/docs/api-reference)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
