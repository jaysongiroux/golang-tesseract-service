import { CustomerMeter } from "@polar-sh/sdk/models/components/customermeter.js";

export type PolarMeterResponse = {
  OCRMeter: CustomerMeter | null;
  OCRSubscription: { productId: string } | null;
};
