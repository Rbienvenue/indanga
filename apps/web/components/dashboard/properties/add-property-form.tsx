"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import type { House } from "@indanga/db";
import { Building2, Car, Home, Hotel, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { ApiResponse } from "@/@types";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  createHouseSchema,
  propertyTypes,
  typeHasRooms,
  type CreateHouseValues,
  type PropertyType,
} from "@/lib/validations/house";

const propertyTypeIcons: Record<PropertyType, React.ReactNode> = {
  House: <Home className="size-5" />,
  Apartment: <Building2 className="size-5" />,
  Hotel: <Hotel className="size-5" />,
  Car: <Car className="size-5" />,
};

export function AddPropertyForm() {
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<CreateHouseValues>({
    resolver: zodResolver(createHouseSchema),
    defaultValues: {
      name: "",
      propertyType: "House",
      price: undefined,
      bedrooms: 0,
      bathrooms: 0,
      province: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      address: "",
      description: "",
    },
  });

  const selectedType = form.watch("propertyType");
  const showRooms = typeHasRooms(selectedType);

  const addPropertyMutation = useMutation({
    mutationFn: async (values: CreateHouseValues) => {
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
      formData.append("ownerId", session?.user?.id ?? "");

      if (values.bedrooms != null) formData.append("bedrooms", String(values.bedrooms));
      if (values.bathrooms != null) formData.append("bathrooms", String(values.bathrooms));

      for (const file of files) {
        formData.append("media", file);
      }

      const response = await fetch("/api/houses", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Request failed");
      }

      return response.json() as Promise<ApiResponse<House>>;
    },
    onSuccess: () => {
      toast.success("Property added successfully");
      void queryClient.invalidateQueries({ queryKey: ["houses"] });
      form.reset();
      setFiles([]);
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to add property");
    },
  });

  const onSubmit = (values: CreateHouseValues) => {
    addPropertyMutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
        <CardDescription>
          Fill in the details of your property and add photos.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (!typeHasRooms(value as PropertyType)) {
                            form.setValue("bedrooms", undefined);
                            form.setValue("bathrooms", undefined);
                          }
                        }}
                        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                      >
                        {propertyTypes.map((type) => (
                          <Label
                            key={type}
                            htmlFor={`type-${type}`}
                            className="border-input has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-accent"
                          >
                            {propertyTypeIcons[type]}
                            <RadioGroupItem value={type} id={`type-${type}`} className="sr-only" />
                            <span className="text-sm font-medium">{type}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Property name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Serene 3-bedroom villa" {...field} />
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
                      <Input
                        type="number"
                        min={0}
                        placeholder="e.g. 150000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showRooms && (
                <>
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
                </>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Kigali City" {...field} />
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
                      <Input placeholder="e.g. Gasabo" {...field} />
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
                      <Input placeholder="e.g. Kimironko" {...field} />
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
                      <Input placeholder="e.g. Bibare" {...field} />
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
                      <Input placeholder="e.g. Kagugu" {...field} />
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
                      <Input placeholder="Optional" {...field} />
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
                    <Textarea
                      placeholder="Describe your property..."
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Photos</Label>
              <ImageDropzone value={files} onChange={setFiles} />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addPropertyMutation.isPending}>
              {addPropertyMutation.isPending && (
                <Loader2 className="animate-spin" />
              )}
              {addPropertyMutation.isPending ? "Adding..." : "Add Property"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
