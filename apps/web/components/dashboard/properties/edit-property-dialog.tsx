"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ApiResponse } from "@/@types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createHouseSchema, type CreateHouseValues } from "@/lib/validations/house";

type HouseData = {
  id: string;
  name: string;
  location: string;
  address: string | null;
  price: number;
  description: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
};

function buildPropertyFormData(values: CreateHouseValues) {
  const formData = new FormData();

  formData.append("name", values.name);
  formData.append("propertyType", values.propertyType);
  formData.append("price", String(values.price));
  formData.append("province", values.province ?? "");
  formData.append("district", values.district);
  formData.append("sector", values.sector);
  formData.append("cell", values.cell);
  formData.append("village", values.village);
  formData.append("address", values.address ?? "");
  formData.append("description", values.description);

  if (values.bedrooms != null) formData.append("bedrooms", String(values.bedrooms));
  if (values.bathrooms != null) formData.append("bathrooms", String(values.bathrooms));

  return formData;
}

function parseLocation(location: string) {
  const parts = location.split(",").map((s) => s.trim());
  return {
    province: parts[0] ?? "",
    district: parts[1] ?? "",
    sector: parts[2] ?? "",
    cell: parts[3]?.split(" ")[0] ?? "",
    village: parts[3]?.split(" ").slice(1).join(" ") ?? "",
  };
}

export function EditPropertyDialog({ house }: { house: HouseData }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const locationParts = parseLocation(house.location);

  const form = useForm<CreateHouseValues>({
    resolver: zodResolver(createHouseSchema),
    defaultValues: {
      name: house.name,
      propertyType: house.propertyType as CreateHouseValues["propertyType"],
      price: house.price,
      bedrooms: house.bedrooms,
      bathrooms: house.bathrooms,
      province: locationParts.province,
      district: locationParts.district,
      sector: locationParts.sector,
      cell: locationParts.cell,
      village: locationParts.village,
      address: house.address ?? "",
      description: house.description,
    },
  });

  const editMutation = useMutation({
    mutationFn: async (values: CreateHouseValues) => {
      const response = await fetch(`/api/properties/${house.id}`, {
        method: "PATCH",
        credentials: "include",
        body: buildPropertyFormData(values),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Request failed");
      }

      return response.json() as Promise<ApiResponse<unknown>>;
    },
    onSuccess: () => {
      toast.success("Property updated successfully");
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update property");
    },
  });

  const onSubmit = (values: CreateHouseValues) => {
    editMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="size-8">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (RWF)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cell"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cell</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="village"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Village</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending && <Loader2 className="animate-spin" />}
                {editMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
