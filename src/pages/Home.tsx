// File: src/pages/Home.tsx
import services from "../data/services";
import ServiceCard from "../components/ServiceCard";

const Home = () => {
  console.log("services dans Home.tsx:", services);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-fuwoo-primary">Bienvenue sur Fuwoo</h1>
      <p className="mt-4 text-lg text-gray-700">
        La plateforme pour trouver le bon professionnel, au bon moment.
      </p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Nos services populaires</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <ServiceCard
                key={service.title}
                icon={<Icon />}
                title={service.title}
                description={service.description}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;

// This code defines a Home component in a React application using TypeScript and Tailwind CSS.
// The component serves as the landing page for the application, welcoming users to Fuwoo, a platform designed to connect them with professionals for various services.
// It imports a list of services from a data file and a ServiceCard component for displaying individual service cards.
// The Home component renders a title, a brief description, and a section showcasing popular services. It uses Tailwind CSS classes for styling, ensuring a modern and responsive design.
// The services are displayed in a grid layout, with the first three services being shown. Each service card includes an icon, title, and description, providing users with a quick overview of the offerings.
// The component is exported for use in other parts of the application, making it a key part of the user experience.
// The Home component is designed to be visually appealing and user-friendly, with a focus on providing clear and concise information about the services offered by Fuwoo. The use of Tailwind CSS allows for easy customization and responsive design, ensuring that the page looks good on various devices.
// The overall structure and design of the Home component aim to create a welcoming and engaging experience for users, encouraging them to explore the platform further. By highlighting popular services, the component aims to attract user interest and drive engagement with the application.
// The Home component is a crucial part of the application, as it serves as the first point of contact for users. By providing a clear and concise overview of the platform's offerings, the component aims to create a positive first impression and encourage users to explore further.
// The use of icons and a grid layout enhances the visual appeal of the page, making it easy for users to navigate and understand the services available. The component is designed to be modular and reusable, allowing for easy updates and modifications in the future.
// The Home component is an essential part of the Fuwoo application, providing a welcoming and informative introduction to the platform. By combining modern design with user-friendly functionality, the component aims to create a positive and engaging experience for users from the moment they arrive on the site.
// The Home component is a key part of the user experience, serving as a gateway to the various services and features offered by Fuwoo. By providing a clear and engaging introduction, the component aims to attract and retain users, ultimately contributing to the success of the platform.
// The use of Tailwind CSS allows for easy customization and responsive design, ensuring that the Home component looks good on various devices and screen sizes. The modular structure of the component makes it easy to maintain and update, allowing for future enhancements and improvements.

