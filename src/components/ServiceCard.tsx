// src/components/ServiceCard.tsx
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { getCategoryImage } from "../data/serviceImages";

interface ServiceCardProps {
  title: string;
  description?: string;
  categorySlug?: string;
  image?: string;
  price?: string | number;
  priceUnit?: string;
  rating?: number | string;
  totalBookings?: number;
  serviceArea?: string;
  providerName?: string;
  linkTo?: string;
}

export default function ServiceCard({
  title,
  description,
  categorySlug,
  image,
  price,
  priceUnit,
  rating,
  totalBookings,
  serviceArea,
  providerName,
  linkTo,
}: ServiceCardProps) {
  const imgSrc = image || getCategoryImage(categorySlug);
  const ratingNum = rating ? parseFloat(String(rating)) : null;

  const content = (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getCategoryImage(undefined);
          }}
        />
        {/* Badge prix en overlay */}
        {price && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-sm font-bold px-3 py-1.5 rounded-full shadow-md">
              {parseFloat(String(price)).toFixed(0)}${" "}
              <span className="font-normal text-gray-500 text-xs">{priceUnit}</span>
            </span>
          </div>
        )}
        {/* Badge réservation instantanée */}
        {totalBookings && totalBookings > 30 && (
          <div className="absolute top-3 left-3">
            <span className="bg-coupdemain-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              Populaire
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
            {title}
          </h3>
          {ratingNum !== null && ratingNum > 0 && (
            <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
              <Star className="w-3.5 h-3.5 text-gray-900 fill-gray-900" />
              <span className="text-sm font-medium text-gray-900">
                {ratingNum.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {serviceArea && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {serviceArea}
          </p>
        )}

        {totalBookings !== undefined && totalBookings > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">{totalBookings} réservations</p>
        )}

        {description && !price && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  );

  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
}
