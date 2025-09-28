"use client";

import { useState } from "react";
import { ProductCard } from "@/entities/product";
import { cn } from "@/shared/lib/style";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ProductCategoryFilter } from "@/widgets/product-category-filter";

export default function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleChangeCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className={cn("flex flex-col gap-[40px] pb-[50px]", "max-sm:gap-0")}>
      <Tabs
        className="border-b border-black/10 max-sm:border-t max-sm:pl-[20px]"
        defaultValue="all"
      >
        <TabsList className="flex h-[50px] items-center gap-[30px] max-sm:h-[40px]">
          <TabsTrigger className="text-[18px]" value="all">
            All
          </TabsTrigger>
          <TabsTrigger className="text-[18px]" value="fashion">
            Fashion
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div
        className={cn("flex gap-[20px]", "max-sm:flex-col max-sm:gap-[12px]")}
      >
        <aside className="min-w-[197px]">
          <h2 className="text-title-4 mb-[20px] font-bold max-sm:hidden">
            브랜드
          </h2>
          <Accordion collapsible type="single">
            <AccordionItem hideBorder value="A_TO_D">
              <AccordionTrigger className="font-semibold">A~D</AccordionTrigger>
              <AccordionContent className="flex flex-col pb-0">
                <Button
                  className={cn(
                    "justify-start px-0 py-[10px] text-black/40",
                    "hover:bg-transparent hover:text-black",
                  )}
                  size="sm"
                  variant="ghost"
                >
                  Apple 1
                </Button>
                <Button
                  className={cn(
                    "justify-start px-0 py-[10px] text-black/40",
                    "hover:bg-transparent hover:text-black",
                  )}
                  size="sm"
                  variant="ghost"
                >
                  Apple 2
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem hideBorder value="E_TO_H">
              <AccordionTrigger className="font-semibold">E~H</AccordionTrigger>
              <AccordionContent className="flex flex-col pb-0">
                <Button
                  className={cn(
                    "justify-start px-0 py-[10px] text-black/40",
                    "hover:bg-transparent hover:text-black",
                  )}
                  size="sm"
                  variant="ghost"
                >
                  Apple 1
                </Button>
                <Button
                  className={cn(
                    "justify-start px-0 py-[10px] text-black/40",
                    "hover:bg-transparent hover:text-black",
                  )}
                  size="sm"
                  variant="ghost"
                >
                  Apple 2
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem hideBorder value="I_TO_L">
              <AccordionTrigger className="font-semibold">I~L</AccordionTrigger>
              <AccordionContent className="flex flex-col pb-0">
                <Button
                  className={cn(
                    "justify-start px-0 py-[10px] text-black/40",
                    "hover:bg-transparent hover:text-black",
                  )}
                  size="sm"
                  variant="ghost"
                >
                  Apple 1
                </Button>
                <Button
                  className={cn(
                    "justify-start px-0 py-[10px] text-black/40",
                    "hover:bg-transparent hover:text-black",
                  )}
                  size="sm"
                  variant="ghost"
                >
                  Apple 2
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem hideBorder value="M_TO_P">
              <AccordionTrigger className="font-semibold">M~P</AccordionTrigger>
              <AccordionContent className="flex flex-col pb-0">
                <Button
                  className={cn(
                    "justify-start px-0 py-[10px] text-black/40",
                    "hover:bg-transparent hover:text-black",
                  )}
                  size="sm"
                  variant="ghost"
                >
                  Apple 1
                </Button>
                <Button
                  className={cn(
                    "justify-start px-0 py-[10px] text-black/40",
                    "hover:bg-transparent hover:text-black",
                  )}
                  size="sm"
                  variant="ghost"
                >
                  Apple 2
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem hideBorder value="Q_TO_T">
              <AccordionTrigger className="font-semibold">Q~T</AccordionTrigger>
              <AccordionContent className="flex flex-col pb-0">
                <Button
                  className={cn(
                    "justify-start px-0 py-[10px] text-black/40",
                    "hover:bg-transparent hover:text-black",
                  )}
                  size="sm"
                  variant="ghost"
                >
                  Apple 1
                </Button>
                <Button
                  className={cn(
                    "justify-start px-0 py-[10px] text-black/40",
                    "hover:bg-transparent hover:text-black",
                  )}
                  size="sm"
                  variant="ghost"
                >
                  Apple 2
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem hideBorder value="U_TO_Z">
              <AccordionTrigger className="font-semibold">U~Z</AccordionTrigger>
              <AccordionContent className="flex flex-col pb-0">
                <Button
                  className={cn(
                    "justify-start px-0 py-[10px] text-black/40",
                    "hover:bg-transparent hover:text-black",
                  )}
                  size="sm"
                  variant="ghost"
                >
                  Apple 1
                </Button>
                <Button
                  className={cn(
                    "justify-start px-0 py-[10px] text-black/40",
                    "hover:bg-transparent hover:text-black",
                  )}
                  size="sm"
                  variant="ghost"
                >
                  Apple 2
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </aside>
        <section className="flex flex-col gap-[20px]">
          <div className="max-sm:overflow-auto">
            <ProductCategoryFilter
              onCategoryChange={handleChangeCategory}
              selectedCategory={selectedCategory}
            />
          </div>
          <div
            className={cn(
              "flex w-[1063px] flex-wrap gap-x-[20px] gap-y-[40px]",
              "max-sm:w-full max-sm:gap-y-[30px]",
              "max-sm:grid max-sm:grid-cols-2",
            )}
          >
            <ProductCard
              className="max-sm:flex-1"
              imageClassName=" w-[196px] h-[196px] max-sm:w-full max-sm:h-[150px]"
            />
            <ProductCard
              className="max-sm:flex-1"
              imageClassName=" w-[196px] h-[196px] max-sm:w-full max-sm:h-[150px]"
            />
            <ProductCard
              className="max-sm:flex-1"
              imageClassName=" w-[196px] h-[196px] max-sm:w-full max-sm:h-[150px]"
            />
            <ProductCard
              className="max-sm:flex-1"
              imageClassName=" w-[196px] h-[196px] max-sm:w-full max-sm:h-[150px]"
            />
            <ProductCard
              className="max-sm:flex-1"
              imageClassName=" w-[196px] h-[196px] max-sm:w-full max-sm:h-[150px]"
            />
            <ProductCard
              className="max-sm:flex-1"
              imageClassName=" w-[196px] h-[196px] max-sm:w-full max-sm:h-[150px]"
            />
            <ProductCard
              className="max-sm:flex-1"
              imageClassName=" w-[196px] h-[196px] max-sm:w-full max-sm:h-[150px]"
            />
            <ProductCard
              className="max-sm:flex-1"
              imageClassName=" w-[196px] h-[196px] max-sm:w-full max-sm:h-[150px]"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
