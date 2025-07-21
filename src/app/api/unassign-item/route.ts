import { createManagementClient } from "@kontent-ai/management-sdk";

const managementApiKey = process.env.KONTENT_AI_MANAGEMENT_KEY;
if (!managementApiKey) {
	throw new Error("KONTENT_AI_MANAGEMENT_KEY is not set");
}

export const POST = async (request: Request) => {
	const { environmentId, itemCodename, languageCodename, userId } =
		await request.json();

	if (!itemCodename) {
		return Response.json(
			{ error: "Item codename is required" },
			{ status: 400 },
		);
	}

	if (!languageCodename) {
		return Response.json(
			{ error: "Language codename is required" },
			{ status: 400 },
		);
	}

	if (!userId) {
		return Response.json({ error: "User email is required" }, { status: 400 });
	}

	if (!environmentId) {
		return Response.json(
			{ error: "Environment ID is required" },
			{ status: 400 },
		);
	}

	const client = createManagementClient({
		apiKey: managementApiKey,
		environmentId,
	});

	const variant = await client
		.viewLanguageVariant()
		.byItemCodename(itemCodename)
		.byLanguageCodename(languageCodename)
		.toPromise()
		.then((res) => res.data);

	if (!variant) {
		return Response.json({ error: "Variant not found" }, { status: 404 });
	}

	if (!variant.contributors.some((u) => u.id === userId)) {
		return Response.json(
			{ error: "User is not assigned to this item" },
			{ status: 400 },
		);
	}

	const result = await client
		.upsertLanguageVariant()
		.byItemCodename(itemCodename)
		.byLanguageCodename(languageCodename)
		.withData(() => ({
			...variant._raw,
			contributors: variant.contributors.filter((u) => u.id !== userId),
			workflow: {
				...variant._raw.workflow,
				step_identifier: { codename: "draft" },
			},
		}))
		.toPromise();

	if (!result.data.item.id) {
		return Response.json({ error: "Item not found" }, { status: 404 });
	}

	return Response.json({ status: 200 });
};
