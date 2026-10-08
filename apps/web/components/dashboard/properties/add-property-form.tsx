"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import type { House, RoomType } from "@indanga/db";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApiResponse } from "@/@types";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/components/providers/session-provider";
import { parseAmenities } from "@/lib/amenities";
import { fetcher } from "@/lib/fetcher";
import { getPropertyMediaError } from "@/lib/property-media";
import { useUpload } from "@/hooks/use-upload";
import {
  createHouseSchema,
  type CreateHouseValues,
  type PropertyType,
} from "@/lib/validations/house";
import { PropertyBasics } from "./property-basics";
import { PropertyDetails, PropertyFeatures } from "./property-details";
import { PropertyLocation } from "./property-location";
import { PropertyMediaStep } from "./property-media-step";
import { PropertyReview } from "./property-review";

const basicsFields: (keyof CreateHouseValues)[] = [
  "propertyType",
  "subType",
  "name",
  "description",
];
const locationFields: (keyof CreateHouseValues)[] = [
  "province",
  "district",
  "sector",
  "cell",
  "village",
  "address",
];
const detailsFields: (keyof CreateHouseValues)[] = ["price", "rooms", "bedrooms", "bathrooms"];

interface AddPropertyFormProps {
  houseId?: string;
}

export function AddPropertyForm({ houseId }: AddPropertyFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const session = useSession();
  const [step, setStep] = useState(0);
  const isAdmin = session?.user.role === "admin";
  const providerType = session?.user.providerType;
  const initialType: PropertyType = isAdmin
    ? "House"
    : providerType === "CAR"
      ? "Car"
      : providerType === "HOUSE"
        ? "House"
        : "Hotel";
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
      propertyType: initialType,
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
  const hasFeatures = selectedType !== "Car";
  const mediaStep = hasFeatures ? 4 : 3;
  const reviewStep = mediaStep + 1;
  const steps = [
    "Basics",
    "Location",
    selectedType === "Hotel"
      ? "Rooms & pricing"
      : selectedType === "Car"
        ? "Pricing"
        : "Details & pricing",
    ...(hasFeatures ? ["Features"] : []),
    "Photos & videos",
    "Review",
  ];
  const stepFields = [
    basicsFields,
    locationFields,
    detailsFields,
    ...(hasFeatures ? [["metadata"] as (keyof CreateHouseValues)[]] : []),
  ];

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
    if (!validateMedia()) return;
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

  const label = selectedType === "Car" ? "vehicle" : selectedType.toLowerCase();
  const validateMedia = () => {
    const error = getPropertyMediaError(files, existingMedia);
    if (error) {
      toast.error(error);
      setStep(mediaStep);
      return false;
    }
    return true;
  };
  const continueStep = async () => {
    if (step === mediaStep && !validateMedia()) return;
    const fields = stepFields[step];
    if (fields && !(await form.trigger(fields, { shouldFocus: true }))) return;
    setStep((current) => Math.min(current + 1, reviewStep));
  };
  const onInvalid = (errors: FieldErrors<CreateHouseValues>) => {
    const invalidStep = stepFields.findIndex((fields) => fields.some((field) => errors[field]));
    setStep(invalidStep < 0 ? 0 : invalidStep);
    toast.error("Check the highlighted fields before submitting.");
  };

  if (isEditMode && isLoadingHouse)
    return (
      <div className="space-y-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (isEditMode && !house)
    return <p className="py-8">Unable to load this property. Please refresh and try again.</p>;
  return (
    <div className="w-full space-y-8">
      <nav aria-label="Listing steps" className="overflow-x-auto pb-2">
        <ol className="flex w-full min-w-max justify-between gap-6 sm:gap-8">
          {steps.map((title, index) => (
            <li
              key={title}
              aria-current={index === step ? "step" : undefined}
              className="flex min-w-20 flex-1 flex-col items-center gap-2 text-center"
            >
              <span
                className={`flex size-10 items-center justify-center rounded-full border text-sm font-medium ${index === step ? "border-primary bg-primary text-primary-foreground" : index < step ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
              >
                {index < step ? <Check className="size-4" aria-label="Completed" /> : index + 1}
              </span>
              <span
                className={`text-xs sm:text-sm ${index === step ? "font-semibold text-primary" : "text-muted-foreground"}`}
              >
                {title}
              </span>
            </li>
          ))}
        </ol>
      </nav>
      <Form {...form}>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (isSubmitting || form.formState.isValidating) return;
            if (step < reviewStep) void continueStep();
            else void form.handleSubmit(onSubmit, onInvalid)(event);
          }}
        >
          <fieldset disabled={isSubmitting} className="min-w-0 space-y-6">
            <header className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">{steps[step]}</h2>
              <p className="text-sm text-muted-foreground">
                {step === reviewStep
                  ? "Check your listing before submitting."
                  : "Complete this section to continue."}
              </p>
            </header>
            <div className="w-full pb-4">
              {step === 0 && <PropertyBasics allowTypeSelection={isAdmin && !isEditMode} />}
              {step === 1 && <PropertyLocation />}
              {step === 2 && <PropertyDetails />}
              {hasFeatures && step === 3 && <PropertyFeatures />}
              {step === mediaStep && (
                <PropertyMediaStep
                  files={files}
                  setFiles={setFiles}
                  existingMedia={existingMedia}
                  setExistingMedia={setExistingMedia}
                />
              )}
              {step === reviewStep && (
                <PropertyReview
                  values={form.getValues()}
                  files={files}
                  existingMedia={existingMedia}
                  onEdit={setStep}
                  mediaStep={mediaStep}
                />
              )}
            </div>
            <footer className="flex justify-between gap-3 border-t py-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(isAdmin ? "/admin/properties" : "/dashboard")}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                )}
                {step < reviewStep ? (
                  <Button key="continue" type="submit" disabled={form.formState.isValidating}>
                    Continue
                    <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button key="submit" type="submit">
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {uploadMedia.isPending
                      ? "Uploading media…"
                      : mutation.isPending
                        ? "Saving…"
                        : isEditMode
                          ? "Save changes"
                          : `Add ${label}`}
                  </Button>
                )}
              </div>
            </footer>
          </fieldset>
        </form>
      </Form>
    </div>
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
