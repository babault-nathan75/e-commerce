import { Star } from "lucide-react";

export default function StarRating({
  value = 0,
  count = 0,
  size = 18
}) {
  const rounded = Math.round(value * 10) / 10;

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={
              i <= rounded
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>

      <span className="text-sm font-medium text-gray-700">
        {rounded > 0 ? `${rounded}/5` : "Aucune note"}
      </span>

      <span className="text-sm text-gray-500">
        ({count} avis)
      </span>
    </div>
  );
}
