import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const GenderDropdown = ({ selectedGender, onSelectGender }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex cursor-pointer items-center gap-[6px] rounded-[4px] border-none bg-transparent px-3 py-2 text-[14px] font-medium text-black outline-none transition-colors duration-200 hover:bg-[#f5f5f5] data-[state=open]:bg-[#f5f5f5]">
        <span className="max-[768px]:hidden">{selectedGender}</span>
        <ChevronDown className="size-[10px] transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="min-w-[180px] rounded-[8px] border-[#e5e5e5] p-0 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-[768px]:min-w-[160px]"
      >
        <DropdownMenuItem
          onSelect={() => onSelectGender("Women")}
          className={`cursor-pointer rounded-none px-4 py-[10px] text-[14px] text-[#333] focus:bg-[#f5f5f5] focus:text-[#333] ${
            selectedGender === "Women" ? "bg-[#f0f0f0] font-semibold text-black" : ""
          }`}
        >
          Women
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => onSelectGender("Men")}
          className={`cursor-pointer rounded-none px-4 py-[10px] text-[14px] text-[#333] focus:bg-[#f5f5f5] focus:text-[#333] ${
            selectedGender === "Men" ? "bg-[#f0f0f0] font-semibold text-black" : ""
          }`}
        >
          Men
        </DropdownMenuItem>

        {/* KIDS — shadcn/Radix sub dropdown, opens sideways */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className={`mt-1 cursor-pointer rounded-none border-t border-[#e5e5e5] px-4 py-[10px] pt-[10px] text-[14px] text-[#333] focus:bg-[#f5f5f5] focus:text-[#333] data-[state=open]:bg-[#f5f5f5] ${
              selectedGender === "Kids" || selectedGender === "Boy" || selectedGender === "Girl"
                ? "font-semibold text-black"
                : ""
            }`}
          >
            Kids
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent
            sideOffset={8}
            className="min-w-[160px] rounded-[8px] border-[#e5e5e5] p-0 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
          >
            <DropdownMenuItem
              onSelect={() => onSelectGender("Kids")}
              className={`cursor-pointer rounded-none px-4 py-[10px] text-[14px] text-[#333] focus:bg-[#f5f5f5] focus:text-[#333] ${
                selectedGender === "Kids" ? "bg-[#f0f0f0] font-semibold text-black" : ""
              }`}
            >
              All Kids
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onSelectGender("Boy")}
              className={`cursor-pointer rounded-none px-4 py-[10px] text-[14px] text-[#333] focus:bg-[#f5f5f5] focus:text-[#333] ${
                selectedGender === "Boy" ? "bg-[#f0f0f0] font-semibold text-black" : ""
              }`}
            >
              Boy
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onSelectGender("Girl")}
              className={`cursor-pointer rounded-none px-4 py-[10px] text-[14px] text-[#333] focus:bg-[#f5f5f5] focus:text-[#333] ${
                selectedGender === "Girl" ? "bg-[#f0f0f0] font-semibold text-black" : ""
              }`}
            >
              Girl
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GenderDropdown;