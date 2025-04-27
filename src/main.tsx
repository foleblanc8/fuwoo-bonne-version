// This file is responsible for rendering the main application component and setting up the router.
// It imports the Layout component, which serves as the main layout for the application, and the Home, Services, and APropos pages.
// The App component uses React Router to define the routes for the application. It sets up three routes: the home page ("/"), the services page ("/services"), and the about page ("/a-propos"). Each route is associated with a specific component that will be rendered when the user navigates to that path.
// The Layout component wraps around the routes, providing a consistent layout and styling across all pages. This allows for a unified user experience throughout the application.
// The App component is exported for use in the main entry point of the application, where it will be rendered into the DOM.
// The App component is a key part of the application, as it serves as the main entry point for users to navigate through different sections of the site. By organizing the routes and components in this way, the application can provide a seamless and intuitive user experience.
// The use of React Router allows for easy navigation between different pages without requiring a full page reload, enhancing the performance and responsiveness of the application.
// The App component is designed to be modular and reusable, allowing for easy updates and modifications in the future. By separating the layout and routing logic, the application can be easily maintained and extended as needed.
// The overall structure and design of the App component aim to create a professional and modern look, aligning with the branding of the business. The use of Tailwind CSS allows for easy customization and responsive design, ensuring that the application looks good on various devices.
// The App component is a crucial part of the application, as it serves as the main entry point for users to navigate through different sections of the site. By organizing the routes and components in this way, the application can provide a seamless and intuitive user experience.
// The App component is a key part of the user experience, serving as a gateway to the various services and features offered by Fuwoo. By providing a clear and engaging introduction, the component aims to attract and retain users, ultimately contributing to the success of the platform.
// The use of Tailwind CSS allows for easy customization and responsive design, ensuring that the App component looks good on various devices and screen sizes. The modular structure of the component makes it easy to maintain and update, allowing for future enhancements and improvements.
// This file is responsible for rendering the main application component and setting up the router.
// It imports the necessary libraries and components, including React, ReactDOM, and BrowserRouter from react-router-dom.
// It also imports the main App component and a CSS file for styling.
// The ReactDOM.createRoot method is used to create a root element for the application, which is then rendered into the DOM.
// The application is wrapped in a React.StrictMode component, which helps identify potential problems in the application during development.
// The BrowserRouter component is used to enable client-side routing, allowing users to navigate between different pages without requiring a full page reload.
// The App component is rendered inside the BrowserRouter, providing the main layout and routing functionality for the application.
// The index.tsx file is the entry point for the React application, responsible for rendering the main App component and setting up the router.

//main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);