"use client";

import { useParams } from "next/navigation";
import SDKTemplateEdit from "@/components/sdk-template-edit";

export default function SDKTemplateEditPage() {
  const params = useParams();
  const type = params.type as Parameters<typeof SDKTemplateEdit>[0]["type"];
  const id = params.id as string | undefined;

  return <SDKTemplateEdit type={type} templateId={id} />;
}
