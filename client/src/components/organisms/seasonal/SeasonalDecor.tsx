import { useState } from "react";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { RamadanBanner, RamadanDecorBody } from "./RamadanDecorComponents";

export default function SeasonalDecor() {
  const { data: settings } = usePublicSettings();
  const decorationEnabled = settings?.decoration?.enabled === true;
  const [bannerDismissed, setBannerDismissed] = useState(false);

  if (!decorationEnabled) return null;

  return (
    <>
      {!bannerDismissed && <RamadanBanner onDismiss={() => setBannerDismissed(true)} />}
      <RamadanDecorBody />
    </>
  );
}
