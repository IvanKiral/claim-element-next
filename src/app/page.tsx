"use client";
;
import { useEnvironmentId, useItemInfo, useVariantInfo, useUserContext, CustomElementContext } from "./customElement/CustomElementContext.tsx";
import dynamic from 'next/dynamic'
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { GetItemResponse } from "./shared/types/routes.ts";
import Loader from "./components/Loader.tsx";

const EnsureKontentAsParent = dynamic(() => import('./customElement/EnsureKontentAsParent.tsx'), {
  ssr: false,    // disable server-side rendering for this import
})

const queryClient = new QueryClient()

export default function Home() {
  return (
    <EnsureKontentAsParent>
      <QueryClientProvider client={queryClient}>
        <CustomElementContext height={"dynamic"}>
          <CustomElement />
        </CustomElementContext>
      </QueryClientProvider>
    </EnsureKontentAsParent>
  );
}


const CustomElement = () => {
  const environmentId = useEnvironmentId();
  const item = useItemInfo();
  const variant = useVariantInfo();
  const userContext = useUserContext();

  const data = useQuery({
    queryKey: ["item"],
    queryFn: () => fetch(`/api/get-item?environmentId=${environmentId}&itemCodename=${item.codename}&languageCodename=${variant.codename}`)
      .then(r => r.json() as Promise<GetItemResponse>),
  });


  const assignItemMutation = useMutation({
    mutationFn: (payload: { itemCodename: string, languageCodename: string }) =>
      fetch("/api/assign-item", {
        method: "POST",
        body: JSON.stringify({
          itemCodename: payload.itemCodename,
          languageCodename: payload.languageCodename,
          userEmail: userContext?.email,
          environmentId,
        }),
        headers: { "Content-Type": "application/json" },
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item"] })
    }
  });

  const unassignItemMutation = useMutation({
    mutationFn: (payload: { itemCodename: string, languageCodename: string }) =>
      fetch("/api/unassign-item", {
        method: "POST",
        body: JSON.stringify({
          itemCodename: payload.itemCodename,
          languageCodename: payload.languageCodename,
          userId: userContext?.id,
          environmentId,
        }),
        headers: { "Content-Type": "application/json" },
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item"] })
    }
  });

  if (data.isLoading) {
    return <Loader />
  }

  if (data.data?.contributors.some((u) => u.id === userContext?.id)) {
    return (
      <div className={`container py-4 flex flex-row w-full items-center`}>
        <main>
          <button
            type="button"
            disabled={unassignItemMutation.isPending}
            onClick={() => unassignItemMutation.mutate({ itemCodename: item.codename, languageCodename: variant.codename })}
            className="border-2 border-[#5b4ff5] rounded-full px-6 py-2 hover:bg-[#5b4ff5] disabled:bg-[#8C8C8C] disabled:border-[#8C8C8C] not-disabled:hover:text-white bg-white text-black font-bold ml-auto tracking-widest uppercase transition-colors duration-150"
          >
            Unassign Item
          </button>
        </main>
      </div>
    )
  }


  return (
    <div className={`container py-4 flex flex-row w-full items-center`}>
      <main >
        <button
          type="button"
          disabled={assignItemMutation.isPending || data.data?.workflow.step_identifier.codename === "locked"}
          onClick={() => assignItemMutation.mutate({ itemCodename: item.codename, languageCodename: variant.codename })}
          className="border-2 border-[#5b4ff5] rounded-full px-6 py-2 hover:bg-[#5b4ff5] disabled:bg-[#8C8C8C] disabled:border-[#8C8C8C] not-disabled:hover:text-white bg-white text-black font-bold ml-auto tracking-widest uppercase transition-colors duration-150"
        >
          Assign Item
        </button>
      </main>
    </div>
  )
}