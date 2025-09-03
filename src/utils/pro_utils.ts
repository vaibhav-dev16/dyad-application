import { UserSettings } from "@/lib/schemas";

export function isDyadProEnabled(settings: UserSettings) {
  return (
    Boolean(settings?.enableDyadPro) &&
    !!settings?.providerSettings?.auto?.apiKey?.value
  );
}
