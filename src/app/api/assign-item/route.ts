import { createManagementClient } from "@kontent-ai/management-sdk";

const managementApiKey = process.env.KONTENT_AI_MANAGEMENT_KEY;
if (!managementApiKey) {
	throw new Error("KONTENT_AI_MANAGEMENT_KEY is not set");
}

const subscriptionId = process.env.KONTENT_AI_SUBSCRIPTION_ID;
if (!subscriptionId) {
	throw new Error("KONTENT_AI_SUBSCRIPTION_ID is not set");
}

const subscriptionApiKey = process.env.KONTENT_AI_SUBSCRIPTION_KEY;
if (!subscriptionApiKey) {
	throw new Error("KONTENT_AI_SUBSCRIPTION_KEY is not set");
}

export const POST = async (request: Request) => {
	const { environmentId, itemCodename, languageCodename, userEmail, contentEditorRole, assignedStepCodename, unassignedStepCodename } =
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

	if (!userEmail) {
		return Response.json({ error: "User email is required" }, { status: 400 });
	}

	if (!environmentId) {
		return Response.json(
			{ error: "Environment ID is required" },
			{ status: 400 },
		);
	}
	if(!contentEditorRole) {
		return Response.json({ error: "Content editor role is required" }, { status: 400 });
	}
	if(!assignedStepCodename) {
		return Response.json({ error: "Step codename is required" }, { status: 400 });
	}

	const client = createManagementClient({
		apiKey: managementApiKey,
		environmentId,
	});

	const subscriptionClient = createManagementClient({
		apiKey: subscriptionApiKey,
		subscriptionId: subscriptionId,
	});

	const envUserRoles = await subscriptionClient
		.listSubscriptionUsers()
		.toPromise()
		.then((res) =>
			res.data.items.flatMap((item) =>
				item.projects
					.filter((project) =>
						project.environments.some((env) => env.id === environmentId),
					)
					.flatMap((project) => {
						const collectionGroups = project.environments.find(
							(env) => env.id === environmentId,
						)?.collectionGroups;

						if (!collectionGroups) {
							return null;
						}
						return collectionGroups.flatMap((cg) => cg.roles);
					})
					.filter((i) => i != null),
			),
		);

	const variant = await client
		.viewLanguageVariant()
		.byItemCodename(itemCodename)
		.byLanguageCodename(languageCodename)
		.toPromise()
		.then((res) => res.data);

	if (
		variant.contributors.some((c) => {
			const filteredRoles = envUserRoles.filter((u) => u.id === c.id);

			return filteredRoles.some((r) => r.codename === contentEditorRole);
		})
	) {
		return Response.json(
			{ error: "Item is not available to be assigned" },
			{ status: 400 },
		);
	}

	if (!variant) {
		return Response.json({ error: "Variant not found" }, { status: 404 });
	}

	const result = await client
		.upsertLanguageVariant()
		.byItemCodename(itemCodename)
		.byLanguageCodename(languageCodename)
		.withData(() => ({
			elements:[],
			contributors: [...variant.contributors, { email: userEmail }],
			workflow: {
				...variant._raw.workflow,
				step_identifier: { codename: assignedStepCodename },
			},
		}))
		.toPromise();

	if (!result.data.item.id) {
		return Response.json({ error: "Item not found" }, { status: 404 });
	}

	return Response.json({ status: 200 });
};
