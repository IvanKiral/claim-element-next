import dotenv from 'dotenv';
import {generateDeliveryModelsAsync} from "@kontent-ai/model-generator";

dotenv.config();

// Helper function to convert snake_case to camelCase
const toCamelCase = (str: string): string => {
  return str.replace(/_(.)/g, (_, letter) => letter.toUpperCase());
};

const {NEXT_PUBLIC_KONTENT_AI_ENVIRONMENT_ID, KONTENT_AI_MANAGEMENT_KEY} = process.env;

if(!NEXT_PUBLIC_KONTENT_AI_ENVIRONMENT_ID){
  throw new Error("VITE_ENVIRONMENT_ID cannot be empty!");
}

if(!KONTENT_AI_MANAGEMENT_KEY){
  throw new Error("VITE_MAPI_API_KEY cannot be empty!");
}

await generateDeliveryModelsAsync(
  {
    environmentId: NEXT_PUBLIC_KONTENT_AI_ENVIRONMENT_ID,
    managementApiKey: KONTENT_AI_MANAGEMENT_KEY,
    addTimestamp: false,
    createFiles: true,
    outputDir: "./src/model",
    moduleFileExtension: "ts",
    fileResolvers: {
      taxonomy: (item) => toCamelCase(item.codename),
      contentType: (item) => toCamelCase(item.codename),
      snippet: (item) => toCamelCase(item.codename)
    },
    formatOptions: {
      printWidth: 120,
      tabWidth: 2,
      useTabs: false,
      trailingComma: "all",
      parser: "typescript"
    }
  }
);