// src/components/ServiceCard.tsx
import { ReactNode } from "react";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-200 hover:border-fuwoo-primary">
      <div className="text-fuwoo-primary text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
// Usage example:
// <ServiceCard
//   icon={<YourIconComponent />}
//   title="Service Title"
//   description="Brief description of the service."
// />
// This component can be used in your Services page or any other part of your application where you want to display service cards.
// The component accepts three props: icon, title, and description. The icon prop is expected to be a ReactNode, which allows you to pass any React component (like an SVG icon) as the icon for the service card. The title and description are strings that describe the service.
// The component uses Tailwind CSS classes for styling, including hover effects and responsive design. The card has a shadow effect that intensifies on hover, and it also changes the border color to the primary color defined in your theme.
// You can customize the styles further by modifying the Tailwind CSS classes as per your design requirements.
// This component is a simple and reusable way to display service information in a visually appealing manner. You can use it in various parts of your application where you need to showcase different services or features.
// You can also extend the component to include additional props or features, such as buttons or links, depending on your needs.

