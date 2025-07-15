import type { CoreClientTypes } from "@/model";
import { createDeliveryClient } from "@kontent-ai/delivery-sdk";

const environmentId = process.env.NEXT_PUBLIC_KONTENT_AI_ENVIRONMENT_ID;
if (!environmentId) {
  throw new Error("NEXT_PUBLIC_KONTENT_AI_ENVIRONMENT_ID is not set");
}

const deliveryApiKey = process.env.KONTENT_AI_DELIVERY_PREVIEW_KEY;
if (!deliveryApiKey) {
  throw new Error("KONTENT_AI_DELIVERY_PREVIEW_KEY is not set");
}

export const GET = async () => {
  const client = createDeliveryClient<CoreClientTypes>({
    environmentId,
    previewApiKey: deliveryApiKey,
    defaultQueryConfig: {
      usePreviewMode: true,
    },
  });

  const items = await client
    .items()
    .type("article")
    .allFilter("elements.queue_assigned", ["false"])
    .elementsParameter(["title"])
    .toAllPromise();

  return Response.json(items.data.items);
};
