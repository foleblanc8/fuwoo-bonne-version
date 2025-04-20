import React from "react";
// src/data/services.ts
import { Wrench, Sparkles, ShieldCheck, Truck } from "lucide-react";

const services = [
  {
    icon: Wrench,
    title: "Plomberie",
    description: "Réparation, débouchage, installations sanitaires.",
  },
  {
    icon: Sparkles,
    title: "Ménage",
    description: "Nettoyage résidentiel ou commercial, ponctuel ou régulier.",
  },
  {
    icon: ShieldCheck,
    title: "Électricité",
    description: "Installation de luminaires, prises, panneaux électriques.",
  },
  {
    icon: Truck,
    title: "Déménagement",
    description: "Transport, aide pour soulever, déménagement local.",
  },
];

export default services;
