import { useNavigate } from "react-router-dom";
import { getCateUnderRoot } from "../../services/searchApi";
import { useQuery } from "@tanstack/react-query";

export default function CategoriesList() {
  const navigate = useNavigate();

  // Mapping category codes/names to cateType for filters
  const getCateType = (category) => {
    const code = category.code?.toLowerCase() || "";
    if (code.includes("phone")) return "phone";
    if (code.includes("laptop")) return "laptop"; // Assuming laptop exists in specFilters
    return "phone"; // default fallback
  };

  const handleCategoryClick = (category) => {
    navigate("/search", {
      state: {
        type: "category",
        categoryId: category.id,
        cateType: getCateType(category)
      }
    });
  };

  // Use React Query for category fetching with caching
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'root'],
    queryFn: async () => {
      const response = await getCateUnderRoot();
      return response?.result?.categoryGetVM || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = categoriesData || [];

  return (
    <div className="w-full bg-white relative px-15 my-5">
      <div className="flex items-center gap-8 justify-center flex-wrap">
        {categories.map((category, i) => (
          <div
            key={category.id || i}
            onClick={() => handleCategoryClick(category)}
            className="group rounded-xl cursor-pointer [box-shadow:rgba(14,30,37,0.12)_2px_2px_4px_0px,rgba(14,30,37,0.32)_4px_4px_16px_0px] w-[160px] h-[160px] relative flex flex-col items-center justify-center gap-5 transition-transform hover:scale-105"
          >
            <img
              src={category.imageUrl}
              className="transition-transform duration-300 group-hover:-translate-y-2 w-[65px] h-[65px] object-contain"
              alt={category.name}
            />
            <span className="font-semibold text-[13px] text-center px-2">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

