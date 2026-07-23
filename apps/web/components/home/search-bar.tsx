"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Car, Home, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  location: z.string(),
  propertyType: z.string(),
  budget: z.string(),
});

export type PropertySearchValues = z.infer<typeof searchSchema>;

type SearchBarProps = {
  className?: string;
  defaultValues?: PropertySearchValues;
  onSearch?: (values: PropertySearchValues) => void;
};

const tabs = [
  { value: "homes", label: "Homes", icon: Home },
  { value: "hotels", label: "Hotels", icon: Building2 },
  { value: "cars", label: "Cars", icon: Car },
];

export function SearchBar({ className, defaultValues, onSearch }: SearchBarProps) {
  const router = useRouter();
  const form = useForm<PropertySearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: defaultValues ?? {
      location: "Kigali",
      propertyType: "all",
      budget: "any",
    },
  });

  function submit(values: PropertySearchValues) {
    if (onSearch) {
      onSearch(values);
      return;
    }

    const params = new URLSearchParams();
    if (values.location !== "all") params.set("location", values.location);
    if (values.propertyType !== "all") params.set("type", values.propertyType);
    if (values.budget !== "any") params.set("budget", values.budget);
    router.push(`/houses?${params.toString()}`);
  }

  return (
    <section className={cn("relative z-20 -mt-6 px-4 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto max-w-4xl rounded-xl border border-border/60 bg-card/95 p-5 shadow-xl shadow-black/10 backdrop-blur-sm sm:p-6">
        <Tabs defaultValue="homes" className="gap-5">
          <TabsList className="mx-auto w-fit bg-muted p-1">
            {tabs.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value}>
                <Icon className="mr-1.5 size-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map(({ value }) => (
            <TabsContent key={value} value={value}>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(submit)}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Location</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <MapPin className="size-4 text-muted-foreground" />
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All locations</SelectItem>
                            <SelectItem value="Kigali">Kigali, Rwanda</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="Apartment">Apartment</SelectItem>
                            <SelectItem value="House">House</SelectItem>
                            <SelectItem value="Studio">Studio</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Budget</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="any">Any budget</SelectItem>
                            <SelectItem value="0-350000">Under RWF 350K</SelectItem>
                            <SelectItem value="350000-500000">RWF 350K – 500K</SelectItem>
                            <SelectItem value="500000-">RWF 500K+</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col justify-end">
                    <Button type="submit" className="w-full font-semibold">
                      <Search className="size-4" />
                      Search
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
