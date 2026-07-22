import type { Building } from "./types";
import { DEFAULT_TYPES, dynastyGroup } from "./types";

export type MapFilters = {
  dynasties: string[];
  cities: string[];
  types: string[];
  yingzao: boolean;
  q: string;
};

export const DEFAULT_MAP_TYPES = Array.from(DEFAULT_TYPES);

export function parseMapFilters(searchParams: URLSearchParams): MapFilters {
  const list = (key: string) =>
    searchParams.get(key)?.split(",").filter(Boolean) ?? [];
  const types = list("type");

  return {
    dynasties: list("dyn"),
    cities: list("city"),
    types: types.length ? types : DEFAULT_MAP_TYPES,
    yingzao: searchParams.get("yz") === "1",
    q: searchParams.get("q") ?? "",
  };
}

export function serializeMapFilters(filters: MapFilters): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (filters.dynasties.length) {
    searchParams.set("dyn", filters.dynasties.join(","));
  }
  if (filters.cities.length) {
    searchParams.set("city", filters.cities.join(","));
  }
  const usesDefaultTypes =
    filters.types.length === DEFAULT_MAP_TYPES.length &&
    DEFAULT_MAP_TYPES.every((type) => filters.types.includes(type));
  if (!usesDefaultTypes) searchParams.set("type", filters.types.join(","));
  if (filters.yingzao) searchParams.set("yz", "1");
  if (filters.q) searchParams.set("q", filters.q);
  return searchParams;
}

export function filterBuildingsByMapFilters(
  buildings: Building[],
  filters: MapFilters,
): Building[] {
  const query = filters.q.trim();

  return buildings.filter((building) => {
    if (!filters.types.includes(building.type)) return false;
    if (filters.cities.length && !filters.cities.includes(building.city)) {
      return false;
    }
    if (filters.dynasties.length) {
      const group = dynastyGroup(building);
      if (!group || !filters.dynasties.includes(group)) return false;
    }
    if (filters.yingzao && !building.yingzao) return false;
    if (
      query &&
      !`${building.name}${building.city}${building.county}${building.dynasty}`.includes(
        query,
      )
    ) {
      return false;
    }
    return true;
  });
}
