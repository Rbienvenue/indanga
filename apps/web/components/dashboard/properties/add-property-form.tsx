"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import type { House, RoomType } from "@indanga/db";
import { Car, Home, Hotel, Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { ApiResponse } from "@/@types";
import { LocationSelector } from "@/components/location-selector";
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
import { MediaDropzone } from "@/components/ui/media-dropzone";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/components/providers/session-provider";
import { amenityIcons, parseAmenities } from "@/lib/amenities";
import { fetcher } from "@/lib/fetcher";
import { isVideoMediaUrl } from "@/lib/property-media";
import { useUpload } from "@/hooks/use-upload";
import {
  createHouseSchema,
  propertyAmenities,
  propertyAmenityLabels,
  propertyTypes,
  subTypesByPropertyType,
  typeHasRooms,
  type CreateHouseValues,
  type PropertyType,
} from "@/lib/validations/house";

const propertyTypeIcons: Record<PropertyType, React.ReactNode> = {
  House: <Home className="size-5" />,
  Hotel: <Hotel className="size-5" />,
  Car: <Car className="size-5" />,
};

interface AddPropertyFormProps {
  houseId?: string;
}

export function AddPropertyForm({ houseId }: AddPropertyFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const session = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  const isEditMode = !!houseId;
  const uploadMedia = useUpload();

  const { data: houseResponse, isLoading: isLoadingHouse } = useQuery({
    queryKey: ["properties", houseId],
    queryFn: () => fetcher<ApiResponse<House & { rooms?: RoomType[] }>>(`/properties/${houseId}`),
    enabled: isEditMode,
  });

  const house = houseResponse?.data;

  const form = useForm<CreateHouseValues>({
    resolver: zodResolver(createHouseSchema) as unknown as Resolver<CreateHouseValues>,
    defaultValues: {
      name: "",
      propertyType: "House",
      subType: undefined,
      price: undefined,
      rooms: [],
      bedrooms: 0,
      bathrooms: 0,
      province: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      address: "",
      description: "",
      metadata: [],
    },
  });

  useEffect(() => {
    if (house) {
      const locationParts = parseLocation(house.location);
      form.reset({
        name: house.name,
        propertyType: house.propertyType as CreateHouseValues["propertyType"],
        subType: house.subType ?? undefined,
        price: house.price ?? undefined,
        rooms: (house.rooms ?? []).map((room) => ({
          id: room.id,
          name: room.name,
          price: room.price,
          totalRooms: room.totalRooms,
        })),
        bedrooms: house.bedrooms,
        bathrooms: house.bathrooms,
        province: locationParts.province,
        district: locationParts.district,
        sector: locationParts.sector,
        cell: locationParts.cell,
        village: locationParts.village,
        address: house.address ?? "",
        description: house.description,
        metadata: parseAmenities(house.metadata),
      });
      setExistingMedia(house.media);
    }
  }, [house, form]);

  const selectedType = form.watch("propertyType");
  const showRooms = typeHasRooms(selectedType);
  const isHotel = selectedType === "Hotel";
  const {
    fields: roomFields,
    append: appendRoom,
    remove: removeRoom,
  } = useFieldArray({ control: form.control, name: "rooms" });

  const addPropertyMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof buildPropertyPayload>) =>
      fetcher<ApiResponse<House>>("/properties", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.success("Property added successfully");
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
      form.reset();
      setFiles([]);
      router.push(session?.user?.role === "admin" ? "/admin/properties" : "/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to add property");
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof buildPropertyPayload>) =>
      fetcher<ApiResponse<unknown>>(`/properties/${houseId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.success("Property updated successfully");
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
      router.push(session?.user?.role === "admin" ? "/admin/properties" : "/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update property");
    },
  });

  const mutation = isEditMode ? updatePropertyMutation : addPropertyMutation;
  const isSubmitting = mutation.isPending || uploadMedia.isPending;

  const onSubmit = async (values: CreateHouseValues) => {
    try {
      const uploadedUrls =
        files.length > 0
          ? await uploadMedia.mutateAsync({ files, existingUrls: existingMedia })
          : [];
      if (isEditMode) {
        updatePropertyMutation.mutate(buildPropertyPayload(values, uploadedUrls, existingMedia));
      } else {
        addPropertyMutation.mutate(buildPropertyPayload(values, uploadedUrls));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload media");
    }
  };

  if (isEditMode && isLoadingHouse) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Property" : "Property Details"}</CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update the details of your property."
            : "Fill in the details of your property and add photos and videos."}
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
                          form.setValue("subType", undefined);
                          if (value !== "Hotel") {
                            form.setValue("rooms", []);
                          }
                          if (!typeHasRooms(value as PropertyType)) {
                            form.setValue("bedrooms", undefined);
                            form.setValue("bathrooms", undefined);
                            form.setValue("metadata", []);
                          }
                        }}
                        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
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
                name="subType"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Sub type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? undefined : value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a sub type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not specified</SelectItem>
                          {subTypesByPropertyType[selectedType].map((subType) => (
                            <SelectItem key={subType} value={subType}>
                              {subType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <FormLabel>Price (RWF){isHotel ? " (optional for hotels)" : null}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder={isHotel ? "Leave empty to use room prices" : "e.g. 150000"}
                        {...field}
                        value={field.value ?? ""}
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

            {isHotel && (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Room types</Label>
                    <p className="text-muted-foreground text-sm">
                      Guests book individual rooms, not the whole hotel.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendRoom({ name: "", price: undefined as never, totalRooms: 1 })
                    }
                  >
                    <Plus className="size-4" /> Add room
                  </Button>
                </div>
                {roomFields.length === 0 ? (
                  <p className="text-muted-foreground rounded-md bg-muted/50 px-3 py-4 text-center text-sm">
                    No room types yet. Add e.g. Standard, Deluxe, Suite with price and quantity.
                  </p>
                ) : null}
                {roomFields.map((roomField, index) => (
                  <div
                    key={roomField.id}
                    className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 rounded-md bg-muted/40 p-2"
                  >
                    <FormField
                      control={form.control}
                      name={`rooms.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Room name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Standard" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`rooms.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Price/night (RWF)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="e.g. 45000"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`rooms.${index}.totalRooms`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">No. of rooms</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove room type"
                      onClick={() => removeRoom(index)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {form.formState.errors.rooms?.message ? (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.rooms.message as string}
                  </p>
                ) : null}
              </div>
            )}

            <LocationSelector
              styles="w-full"
              province={form.watch("province") ?? ""}
              district={form.watch("district")}
              sector={form.watch("sector")}
              cell={form.watch("cell")}
              village={form.watch("village")}
              onProvinceChange={(v) => form.setValue("province", v, { shouldValidate: true })}
              onDistrictChange={(v) => form.setValue("district", v, { shouldValidate: true })}
              onSectorChange={(v) => form.setValue("sector", v, { shouldValidate: true })}
              onCellChange={(v) => form.setValue("cell", v, { shouldValidate: true })}
              onVillageChange={(v) => form.setValue("village", v, { shouldValidate: true })}
              errors={{
                province: form.formState.errors.province?.message,
                district: form.formState.errors.district?.message,
                sector: form.formState.errors.sector?.message,
                cell: form.formState.errors.cell?.message,
                village: form.formState.errors.village?.message,
              }}
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

            {showRooms && (
              <FormField
                control={form.control}
                name="metadata"
                render={() => (
                  <FormItem>
                    <FormLabel>Features</FormLabel>
                    <p className="text-muted-foreground text-sm">
                      Select the features available at this property (optional).
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {propertyAmenities.map((amenity) => (
                        <FormField
                          key={amenity}
                          control={form.control}
                          name="metadata"
                          render={({ field }) => {
                            const selected = field.value ?? [];
                            const checked = selected.includes(amenity);
                            const AmenityIcon = amenityIcons[amenity];
                            return (
                              <FormItem>
                                <Label
                                  htmlFor={`amenity-${amenity}`}
                                  className="border-input has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-colors hover:bg-accent"
                                >
                                  <FormControl>
                                    <Checkbox
                                      id={`amenity-${amenity}`}
                                      checked={checked}
                                      onCheckedChange={(value) => {
                                        const next =
                                          value === true
                                            ? [...selected, amenity]
                                            : selected.filter((item) => item !== amenity);
                                        field.onChange(next);
                                      }}
                                    />
                                  </FormControl>
                                  <AmenityIcon className="size-4" />
                                  <span className="text-sm font-medium">
                                    {propertyAmenityLabels[amenity]}
                                  </span>
                                </Label>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-2">
              <Label>Photos and videos</Label>
              {existingMedia.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {existingMedia.map((src) => (
                    <div
                      key={src}
                      className="group relative aspect-square overflow-hidden rounded-md border"
                    >
                      {isVideoMediaUrl(src) ? (
                        <video
                          src={src}
                          preload="metadata"
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={src}
                          alt="Property photo"
                          className="h-full w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setExistingMedia((media) => media.filter((url) => url !== src))
                        }
                        aria-label="Remove media"
                        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/70 text-white opacity-100 shadow-lg transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <MediaDropzone value={files} onChange={setFiles} />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(session?.user?.role === "admin" ? "/admin/properties" : "/dashboard")
              }
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {uploadMedia.isPending
                ? "Uploading media..."
                : mutation.isPending
                  ? isEditMode
                    ? "Saving..."
                    : "Adding..."
                  : isEditMode
                    ? "Save Changes"
                    : "Add Property"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

function buildPropertyPayload(
  values: CreateHouseValues,
  media: string[],
  existingMedia?: string[],
) {
  return {
    name: values.name,
    propertyType: values.propertyType,
    subType: values.subType,
    price: values.price,
    rooms: values.rooms,
    province: values.province,
    district: values.district,
    sector: values.sector,
    cell: values.cell,
    village: values.village,
    address: values.address,
    description: values.description,
    bedrooms: values.bedrooms,
    bathrooms: values.bathrooms,
    metadata: values.metadata ?? [],
    media,
    ...(existingMedia !== undefined ? { existingMedia } : {}),
  };
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
