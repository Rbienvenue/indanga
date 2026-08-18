
import { useEffect, useState } from 'react';

import { toast } from 'sonner';

export interface LocationData {
  provinces: string[];
  districts: Record<string, string[]>;
  sectors: Record<string, Record<string, string[]>>;
  cells: Record<string, Record<string, Record<string, string[]>>>;
  villages: Record<string, Record<string, Record<string, Record<string, string[]>>>>;
}

export function useLocations() {
  const [locations, setLocations] = useState<LocationData>({
    provinces: [],
    districts: {},
    sectors: {},
    cells: {},
    villages: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/data/villages.csv', {
          cache: 'force-cache',
        });
        const csvText = await response.text();

        const rows = csvText.split('\n').slice(1);
        const locationMap = new Map<string, Set<string>>();
        const districtMap = new Map<string, Set<string>>();
        const sectorMap = new Map<string, Set<string>>();
        const cellMap = new Map<string, Set<string>>();

        rows.forEach((row) => {
          const [province_name, , district_name, , sector_name, , cell_name, , village_name] = row.split(',');
          if (!province_name || !district_name || !sector_name || !cell_name || !village_name) {
            return;
          }

          const cleanProvince = province_name.replace(/"/g, '').trim();
          const cleanDistrict = district_name.replace(/"/g, '').trim();
          const cleanSector = sector_name.replace(/"/g, '').trim();
          const cleanCell = cell_name.replace(/"/g, '').trim();
          const cleanVillage = village_name.replace(/"/g, '').trim();
          if (!cleanProvince || !cleanDistrict || !cleanSector || !cleanCell || !cleanVillage) {
            return;
          }

          // Build hierarchies
          if (!locationMap.has(cleanProvince)) {
            locationMap.set(cleanProvince, new Set());
          }
          locationMap.get(cleanProvince)?.add(cleanDistrict);

          const districtKey = `${cleanProvince}-${cleanDistrict}`;
          if (!districtMap.has(districtKey)) {
            districtMap.set(districtKey, new Set());
          }
          districtMap.get(districtKey)?.add(cleanSector);

          const sectorKey = `${cleanProvince}-${cleanDistrict}-${cleanSector}`;
          if (!sectorMap.has(sectorKey)) {
            sectorMap.set(sectorKey, new Set());
          }
          sectorMap.get(sectorKey)?.add(cleanCell);

          const cellKey = `${cleanProvince}-${cleanDistrict}-${cleanSector}-${cleanCell}`;
          if (!cellMap.has(cellKey)) {
            cellMap.set(cellKey, new Set());
          }
          cellMap.get(cellKey)?.add(cleanVillage);
        });

        setLocations({
          provinces: Array.from(locationMap.keys()),
          districts: Array.from(locationMap.entries()).reduce(
            (acc, [province, districts]) => {
              acc[province] = Array.from(districts);
              return acc;
            },
            {} as Record<string, string[]>,
          ),
          sectors: Array.from(districtMap.entries()).reduce<Record<string, Record<string, string[]>>>(
            (acc, [key, sectors]) => {
              const [province, district] = key.split('-');
              if (!province || !district) return acc;
              if (!acc[province]) acc[province] = {};
              acc[province][district] = Array.from(sectors);
              return acc;
            },
            {},
          ),
          cells: Array.from(sectorMap.entries()).reduce<Record<string, Record<string, Record<string, string[]>>>>(
            (acc, [key, cells]) => {
              const [province, district, sector] = key.split('-');
              if (!province || !district || !sector) return acc;
              if (!acc[province]) acc[province] = {};
              if (!acc[province][district]) acc[province][district] = {};
              acc[province][district][sector] = Array.from(cells);
              return acc;
            },
            {},
          ),
          villages: Array.from(cellMap.entries()).reduce<
            Record<string, Record<string, Record<string, Record<string, string[]>>>>
          >((acc, [key, villages]) => {
            const [province, district, sector, cell] = key.split('-');
            if (!province || !district || !sector || !cell) return acc;
            if (!acc[province]) acc[province] = {};
            if (!acc[province][district]) acc[province][district] = {};
            if (!acc[province][district][sector]) acc[province][district][sector] = {};
            acc[province][district][sector][cell] = Array.from(villages);
            return acc;
          }, {}),
        });
      } catch  {
        toast.error('Failed to load location data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { locations, isLoading };
}
