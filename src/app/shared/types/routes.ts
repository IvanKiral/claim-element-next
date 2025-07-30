import type { LanguageVariantContracts, SharedContracts } from "@kontent-ai/management-sdk";

export type GetItemResponse = {
  contributors: SharedContracts.UserReferenceDataContract[];
  workflow: LanguageVariantContracts.ILanguageVariantWorkflowContract;
};
