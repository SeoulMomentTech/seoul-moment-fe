import { useState } from "react";

import type { Category } from "@shared/services/category";
import type { Filter } from "@widgets/filter-sheet/ui/FilterSheet";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  cn,
} from "@seoul-moment/ui";

import useCategories from "../../model/useCategories";
import useProductCategory from "../../model/useProductCategory";

interface CategoryInterface {
  filter: Filter;
  handleFilter(newFilter: Filter): void;
}

const CategoryFilter = ({ filter, handleFilter }: CategoryInterface) => {
  const { data: categories } = useCategories();

  return (
    <AccordionItem className="border-b-black/20" value="category">
      <AccordionTrigger>카테고리</AccordionTrigger>
      <AccordionContent className="flex flex-col pb-0">
        {categories.map((category) => (
          <ProductCategory
            category={category}
            filter={filter}
            handleFilter={handleFilter}
            key={category.id}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};

interface ProductCategoryProps {
  category: Category;
  filter: Filter;
  handleFilter(newFilter: Filter): void;
}

const ProductCategory = ({
  category,
  filter,
  handleFilter,
}: ProductCategoryProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Accordion collapsible type="single">
      <AccordionItem className="pl-[14px]" hideBorder value={category.name}>
        <AccordionTrigger
          className="font-semibold"
          onClick={() => setIsOpen(!isOpen)}
        >
          {category.name}
        </AccordionTrigger>
        {isOpen && (
          <ProductSubCategory
            categoryId={category.id}
            filter={filter}
            handleFilter={handleFilter}
          />
        )}
      </AccordionItem>
    </Accordion>
  );
};

interface ProductSubCategoryProps {
  categoryId: number;
  filter: Filter;
  handleFilter(newFilter: Filter): void;
}

const ProductSubCategory = ({
  filter,
  categoryId,
  handleFilter,
}: ProductSubCategoryProps) => {
  const { data: categories } = useProductCategory(categoryId);

  return (
    <AccordionContent className="flex flex-col pb-0 pl-[12px]">
      {categories.map((category) => (
        <Button
          className={cn(
            "justify-start px-0 py-[10px] text-start text-black/40",
            "hover:bg-transparent hover:text-black",
            filter.productCategoryId === category.id && "text-black",
          )}
          key={category.id}
          onClick={() =>
            handleFilter({ categoryId, productCategoryId: category.id })
          }
          size="sm"
          variant="ghost"
        >
          {category.name}
        </Button>
      ))}
    </AccordionContent>
  );
};

export default CategoryFilter;
