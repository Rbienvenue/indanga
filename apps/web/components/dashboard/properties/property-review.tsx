"use client";

import { Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { getPriceUnit } from "@/lib/booking-kind";
import { propertyAmenityLabels, type CreateHouseValues } from "@/lib/validations/house";

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-b pb-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          aria-label={`Edit ${title.toLowerCase()}`}
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>
      </div>
      {children}
    </section>
  );
}

export function PropertyReview({
  values,
  files,
  existingMedia,
  onEdit,
  mediaStep,
}: {
  values: CreateHouseValues;
  files: File[];
  existingMedia: string[];
  onEdit: (step: number) => void;
  mediaStep: number;
}) {
  const location = [values.province, values.district, values.sector, values.cell, values.village]
    .filter(Boolean)
    .join(", ");
  return (
    <div className="space-y-4">
      <ReviewSection title="Basics" onEdit={() => onEdit(0)}>
        <p className="text-lg font-medium">{values.name}</p>
        <p className="text-sm text-muted-foreground">
          {values.propertyType}
          {values.subType ? ` · ${values.subType}` : ""}
        </p>
        <p className="whitespace-pre-wrap break-words text-sm">{values.description}</p>
      </ReviewSection>
      <ReviewSection title="Location" onEdit={() => onEdit(1)}>
        <p className="text-sm">{location}</p>
        {values.address && <p className="text-sm text-muted-foreground">{values.address}</p>}
      </ReviewSection>
      <ReviewSection
        title={values.propertyType === "Hotel" ? "Rooms & pricing" : "Details & pricing"}
        onEdit={() => onEdit(2)}
      >
        {values.propertyType === "Hotel" ? (
          <ul className="space-y-2">
            {values.rooms?.map((room, index) => (
              <li
                key={room.id ?? index}
                className="flex flex-wrap justify-between gap-2 rounded-md bg-muted/50 p-3 text-sm"
              >
                <span>
                  {room.name} · {room.totalRooms} rooms
                </span>
                <span className="font-medium">
                  {Number(room.price).toLocaleString()} RWF / night
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-medium">
            {Number(values.price).toLocaleString()} RWF {getPriceUnit(values.propertyType)}
          </p>
        )}
        {values.propertyType === "House" && (
          <p className="text-sm text-muted-foreground">
            {values.bedrooms ?? 0} bedrooms · {values.bathrooms ?? 0} bathrooms
          </p>
        )}
      </ReviewSection>
      {values.propertyType !== "Car" && (
        <ReviewSection title="Features" onEdit={() => onEdit(3)}>
          {values.metadata?.length ? (
            <div className="flex flex-wrap gap-2">
              {values.metadata.map((amenity) => (
                <span key={amenity} className="rounded-md bg-muted px-2 py-1 text-xs">
                  {propertyAmenityLabels[amenity]}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No features selected.</p>
          )}
        </ReviewSection>
      )}
      <ReviewSection title="Photos & videos" onEdit={() => onEdit(mediaStep)}>
        <p className="text-sm">{files.length + existingMedia.length} media items</p>
        {!!existingMedia.length && (
          <p className="text-sm text-muted-foreground">
            {existingMedia.length} existing items retained
          </p>
        )}
        {!!files.length && (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {files.map((file, index) => (
              <li key={index} className="break-words">
                {file.name}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">
          New photos and videos will upload when you submit.
        </p>
      </ReviewSection>
    </div>
  );
}
