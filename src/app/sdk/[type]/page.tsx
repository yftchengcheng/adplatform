"use client";

import { useParams } from "next/navigation";
import SDKTemplateList from "@/components/sdk-template-list";

export default function SDKTemplatePage() {
  const params = useParams();
  const type = params.type as Parameters<typeof SDKTemplateList>[0]["type"];

  return <SDKTemplateList type={type} />;
}
