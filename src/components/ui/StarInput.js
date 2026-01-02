import { Star } from "lucide-react";

export default function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={22}
          onClick={() => onChange(i)}
          className={`
            cursor-pointer transition
            ${
              i <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }
          `}
        />
      ))}
    </div>
  );
}
