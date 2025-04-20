import ServiceCard from "../components/ServiceCard";
import { Wrench, Sparkles, ShieldCheck, Truck } from "lucide-react";

const services = [
  {
    icon: <Wrench />,
    title: "Plomberie",
    description: "Réparation, débouchage, installations sanitaires.",
  },
  {
    icon: <Sparkles />,
    title: "Ménage",
    description: "Nettoyage résidentiel ou commercial, ponctuel ou régulier.",
  },
  {
    icon: <ShieldCheck />,
    title: "Électricité",
    description: "Installation de luminaires, prises, panneaux électriques.",
  },
  {
    icon: <Truck />,
    title: "Déménagement",
    description: "Transport, aide pour soulever, déménagement local.",
  },
];

const Services = () => (
  <div className="p-8 max-w-6xl mx-auto">
    <h1 className="text-3xl font-bold text-fuwoo-primary">Nos Services</h1>
    <p className="mt-4 text-lg mb-8">
      Plomberie, électricité, déménagement, ménage et plus encore.
    </p>

    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard
          key={service.title}
          icon={service.icon}
          title={service.title}
          description={service.description}
        />
      ))}
    </div>
  </div>
);

export default Services;
// This code defines a Services page in a React application using TypeScript and Tailwind CSS.
// It imports a ServiceCard component and several icons from the lucide-react library. The services array contains information about different services offered, including an icon, title, and description for each service.
// The Services component renders a title, a brief description, and a grid of service cards using the ServiceCard component. Each card displays the icon, title, and description of a service.
// The layout is responsive, adjusting the number of columns based on the screen size using Tailwind CSS classes. The component is exported for use in other parts of the application.
// The Services page is designed to be visually appealing and user-friendly, providing a clear overview of the services offered by the business. The use of Tailwind CSS allows for easy customization and responsive design, ensuring that the page looks good on various devices.
// The ServiceCard component is reusable, allowing for consistent styling and functionality across different parts of the application. This modular approach enhances maintainability and scalability, making it easier to add or modify services in the future.
// The overall structure and design of the Services page aim to provide a professional and modern look, aligning with the branding of the business. The use of icons adds a visual element that enhances user engagement and understanding of the services offered.
// The Services page is a crucial part of the application, as it showcases the offerings of the business and helps potential customers understand what services are available. By providing clear and concise information, the page aims to attract and inform users, ultimately leading to increased customer engagement and satisfaction.

