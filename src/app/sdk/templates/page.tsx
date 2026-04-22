"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SDKTemplatesShowcase } from "@/components/sdk-templates-showcase";

export default function SDKTemplatesStylePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  返回
                </Button>
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">SDK模板样式</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 内容 */}
      <main className="flex-1">
        <SDKTemplatesShowcase className="h-[calc(100vh-60px)]" />
      </main>
    </div>
  );
}
