import { siteConfig } from "@/lib/site";
import { getSettings } from "@/lib/store";

export type ContactSettings = {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  address: string;
  hours: string;
  mapUrl: string;
  ratingUrl: string;
  email: string;
  /** Social profile links; empty string means "not shown". */
  instagram: string;
  facebook: string;
  youtube: string;
};

function pick(o: Record<string, string>, key: string, fallback: string): string {
  const v = o[key];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : fallback;
}

function displayPhone(phone: string): string {
  return /^0\d{10}$/.test(phone) ? `${phone.slice(0, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}` : phone;
}

export function mergeSettings(overrides: Record<string, string>): ContactSettings {
  const phone = pick(overrides, "phone", siteConfig.phone);
  return {
    phone,
    phoneDisplay: displayPhone(phone),
    whatsapp: pick(overrides, "whatsapp", siteConfig.whatsapp),
    address: pick(overrides, "address", siteConfig.address),
    hours: pick(overrides, "hours", siteConfig.hours),
    mapUrl: pick(overrides, "mapUrl", siteConfig.mapUrl),
    ratingUrl: pick(overrides, "ratingUrl", siteConfig.rating.url),
    email: pick(overrides, "email", siteConfig.email),
    instagram: pick(overrides, "instagram", ""),
    facebook: pick(overrides, "facebook", ""),
    youtube: pick(overrides, "youtube", ""),
  };
}

export async function getContactSettings(): Promise<ContactSettings> {
  return mergeSettings(await getSettings());
}
