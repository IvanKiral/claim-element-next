import { createManagementClient } from "@kontent-ai/management-sdk";
import { NextRequest } from "next/server";

const managementApiKey = process.env.KONTENT_AI_MANAGEMENT_KEY;
if (!managementApiKey) {
	throw new Error("KONTENT_AI_MANAGEMENT_KEY is not set");
}

export const GET = async (request: NextRequest) => {
	const searchParams = request.nextUrl.searchParams;
	const environmentId = searchParams.get("environmentId");
	const itemCodename = searchParams.get("itemCodename");
	const languageCodename = searchParams.get("languageCodename");

	if (!environmentId) {
		return Response.json(
			{ error: "Environment ID is required" },
			{ status: 400 },
		);
	}

	if (!itemCodename) {
		return Response.json(
			{ error: "itemCodenmae is required" },
			{ status: 400 },
		);
	}

	if (!languageCodename) {
		return Response.json(
			{ error: "languageCodename is required" },
			{ status: 400 },
		);
	}

	const client = createManagementClient({
		apiKey: managementApiKey,
		environmentId: environmentId,
	});

	const variant = await client
		.viewLanguageVariant()
		.byItemCodename(itemCodename)
		.byLanguageCodename(languageCodename)
		.toPromise()
		.then((res) => res.data);

	const workflow = await client
		.listWorkflows()
		.toPromise()
		.then((res) =>
			res.data.find((w) => w.id === variant.workflow.workflowIdentifier.id),
		);

	if (!workflow) {
		return Response.json({ error: "Workflow not found" }, { status: 400 });
	}

	return Response.json({
		contributors: variant.contributors,
		workflow: {
			...workflow,
			step_identifier: {
				...workflow.steps.find(
					(s) => s.id === variant.workflow.stepIdentifier.id,
				),
			},
		},
	});
};
