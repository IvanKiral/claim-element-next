const createMapiUrl = (environmentId: string) => `https://manage.kontent.ai/v2/projects/${environmentId}/early-access/variants/filter`;

const getDraftItemsFromMapi = async (environmentId: string, apiKey: string) => {
  const url = createMapiUrl(environmentId);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      "filters": [
        {
          "workflow_steps": [
            {
              workflow_identifier: {codename: "default"},
              step_identifiers: {codename: "draft"},
            }
          ]
        }
      ]
    })
  });
  return response.json();
}

export default getDraftItemsFromMapi;