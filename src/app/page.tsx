"use client";

import type { ArticleType } from "@/model";
import { useEffect, useState } from "react";
import { ContentItemList } from "./components/ContentItemList";


export default function Home() {
  const [items, setItems] = useState<ReadonlyArray<ArticleType>>([]);

  useEffect(() => {
    fetch("/api/listItems")
      .then((res) => res.json())
      .then((data) =>
        setItems(data as ReadonlyArray<ArticleType>));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Kontent.ai Items Queue MVP</h1>
        <p className="text-gray-600">Manage and assign unassigned content items</p>
      </header>
      <main className="bg-white rounded-lg shadow-lg p-6">
        <ContentItemList
          items={items.map((item) => ({
            id: item.system.id,
            name: item.elements.title.value,
          }))}
          onAssignItem={() => { }}
        />
      </main>
    </div>
  );
}
