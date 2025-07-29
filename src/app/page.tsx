"use client";
;
import { useEnvironmentId, useItemInfo, useVariantInfo, useUserContext, CustomElementContext, useConfig } from "./customElement/CustomElementContext.tsx";
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
        <CustomElementContext height={300}>
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
  const config = useConfig();

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
          contentEditorRole: config.contentEditorRole,
          assignedStepCodename: config.assignedStepCodename,
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
          unassignedStepCodename: config.unassignedStepCodename,
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
      <div className={`container py-4 flex flex-col w-full items-center space-y-4`}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md w-full text-center shadow-sm">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 bg-blue-100 rounded-full">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-blue-900 font-semibold text-sm mb-2">Item Currently Assigned</h3>
          <p className="text-blue-700 text-s leading-relaxed">
            If you were recently assigned to this item,  <strong>refresh your browser</strong> to start editing.
          </p>
        </div>
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
    <div className={`container py-4 flex flex-col w-full items-center space-y-4`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md w-full text-center shadow-sm">
        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 bg-blue-100 rounded-full">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-blue-900 font-semibold text-sm mb-2">Item Available for Assignment</h3>
        <p className="text-blue-700 text-xs leading-relaxed">
          This item is currently unassigned to an editor. Please click &quot;Assign to Me&quot; to lock it for editing.
        </p>
      </div>
      <main>
        <button
          type="button"
          disabled={assignItemMutation.isPending || data.data?.workflow.step_identifier.codename === config.assignedStepCodename}
          onClick={() => assignItemMutation.mutate({ itemCodename: item.codename, languageCodename: variant.codename })}
          className="border-2 border-[#5b4ff5] rounded-full px-6 py-2 hover:bg-[#5b4ff5] disabled:bg-[#8C8C8C] disabled:border-[#8C8C8C] not-disabled:hover:text-white bg-white text-black font-bold ml-auto tracking-widest uppercase transition-colors duration-150"
        >
          Assign to Me
        </button>
      </main>
    </div>
  )
}