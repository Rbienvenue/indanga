import { useLocations } from '@/hooks/use-locations';
import { useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';


const provinceMap = {
  'Kigali City': 'Umujyi wa kigali',
  Northern: 'Amajyaruguru',
  Southern: 'Amajyepfo',
  Eastern: 'Iburasirazuba',
  Western: 'Iburengerazuba',
};

interface LocationSelectorProps {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  onProvinceChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onCellChange: (value: string) => void;
  onVillageChange: (value: string) => void;
  errors?: {
    province?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
  };
  className?: string;
  styles?: string;
  labels?: {
    province?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
  };
  placeholders?: {
    province?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
  };
  locale?: 'en' | 'rw';
}

export function LocationSelector({
  province,
  district,
  sector,
  cell,
  village,
  onProvinceChange,
  onDistrictChange,
  onSectorChange,
  onCellChange,
  onVillageChange,
  errors,
  className = '',
  styles = '',
  labels = {
    province: 'Province',
    district: 'District',
    sector: 'Sector',
    cell: 'Cell',
    village: 'Village',
  },
  placeholders = {
    province: 'Select province',
    district: 'Select district',
    sector: 'Select sector',
    cell: 'Select cell',
    village: 'Select village',
  },
  locale = 'en',
}: LocationSelectorProps) {
  const { locations, isLoading } = useLocations();

  // biome-ignore lint/correctness/useExhaustiveDependencies: callback props are intentionally omitted to avoid rerunning resets when parent handlers are recreated.
  useEffect(() => {
    if (!province) {
      onDistrictChange('');
      onSectorChange('');
      onCellChange('');
      onVillageChange('');
    }
  }, [province]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: callback props are intentionally omitted to avoid rerunning resets when parent handlers are recreated.
  useEffect(() => {
    if (!district) {
      onSectorChange('');
      onCellChange('');
      onVillageChange('');
    }
  }, [district]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: callback props are intentionally omitted to avoid rerunning resets when parent handlers are recreated.
  useEffect(() => {
    if (!sector) {
      onCellChange('');
      onVillageChange('');
    }
  }, [sector]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: callback props are intentionally omitted to avoid rerunning resets when parent handlers are recreated.
  useEffect(() => {
    if (!cell) {
      onVillageChange('');
    }
  }, [cell]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid  grid-cols-1 md:grid-cols-2 gap-4 ">
        <div className="space-y-2">
          <Label className={className}>
            {labels?.province ?? 'Province'} <span className="text-red-500">*</span>
          </Label>
          <Select value={province} onValueChange={onProvinceChange}>
            <SelectTrigger className={cn(styles, errors?.province && 'border-red-500')}>
              <SelectValue placeholder={placeholders?.province} />
            </SelectTrigger>
            <SelectContent>
              {locations.provinces.map((p) => (
                <SelectItem key={p} value={p}>
                  {locale === 'en' ? p : provinceMap[p as keyof typeof provinceMap]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.province && <span className="text-sm text-red-500">{errors.province}</span>}
        </div>
        <div className="space-y-2">
          <Label className={className}>
            {labels?.district ?? 'District'} <span className="text-red-500">*</span>
          </Label>
          <Select value={district} onValueChange={onDistrictChange}>
            <SelectTrigger disabled={!province} className={cn(styles, errors?.district && 'border-red-500')}>
              <SelectValue placeholder={placeholders?.district} />
            </SelectTrigger>
            <SelectContent>
              {province &&
                locations.districts[province]?.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors?.district && <span className="text-sm text-red-500">{errors.district}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={className}>
            {labels?.sector ?? 'Sector'} <span className="text-red-500">*</span>
          </Label>
          <Select value={sector} onValueChange={onSectorChange}>
            <SelectTrigger disabled={!district} className={cn(styles, errors?.sector && 'border-red-500')}>
              <SelectValue placeholder={placeholders?.sector} />
            </SelectTrigger>
            <SelectContent>
              {district &&
                locations.sectors[province]?.[district]?.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors?.sector && <span className="text-sm text-red-500">{errors.sector}</span>}
        </div>

        <div className="space-y-2">
          <Label className={className}>
            {labels?.cell ?? 'Cell'} <span className="text-red-500">*</span>
          </Label>
          <Select value={cell} onValueChange={onCellChange}>
            <SelectTrigger disabled={!sector} className={cn(styles, errors?.cell && 'border-red-500')}>
              <SelectValue placeholder={placeholders?.cell} />
            </SelectTrigger>
            <SelectContent>
              {sector &&
                locations.cells[province]?.[district]?.[sector]?.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors?.cell && <span className="text-sm text-red-500">{errors.cell}</span>}
        </div>
      </div>

      <div className="space-y-2">
        <Label className={className}>
          {labels?.village ?? 'Village'} <span className="text-red-500">*</span>
        </Label>
        <Select value={village} onValueChange={onVillageChange}>
          <SelectTrigger disabled={!cell} className={cn(styles, errors?.village && 'border-red-500')}>
            <SelectValue placeholder={placeholders?.village} />
          </SelectTrigger>
          <SelectContent>
            {cell &&
              locations.villages[province]?.[district]?.[sector]?.[cell]?.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {errors?.village && <span className="text-sm text-red-500">{errors.village}</span>}
      </div>
    </div>
  );
}
