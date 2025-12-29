import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import AdminReviewList from "./ui/AdminReviewList";

export default async function AdminReviewsPage() {
  await connectDB();
  const reviews = await Review.find({}).sort({ createdAt: -1 }).limit(200);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-green">Commentaires (Admin)</h1>
      <div className="mt-4">
        <AdminReviewList initialReviews={JSON.parse(JSON.stringify(reviews))} />
      </div>
    </div>
  );
}