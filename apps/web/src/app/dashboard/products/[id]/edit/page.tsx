"use client";

import { ProductForm } from "@/components/products/product-form";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container mx-auto py-6">
      <ProductForm productId={id} />
    </div>
  );
}
