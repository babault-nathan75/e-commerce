const ProductSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().min(0),
  imageUrl: z.string().min(2),
  description: z.string().min(5),
  channel: z.enum(["shop", "library"]),
  productType: z.enum(["physical", "digital"]).default("physical"),
  category: z.array(z.string()).optional().default([]),
  // ✅ On utilise stockAvailable ici aussi pour être cohérent
  stockAvailable: z.coerce.number().min(0).default(0)
});

const UpdateSchema = ProductSchema.partial();