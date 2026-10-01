import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export default function ResponsiveFilterPanel({
  children,
  title = "Filter Products",
  buttonText = "Filter & Sort",
}) {
  return (
    <>
      {/* ================= DESKTOP ================= */}
      <div className="hidden lg:block min-w-0">
        {children}
      </div>

      {/* ================= MOBILE + TABLET ================= */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="flex h-11 w-full items-center justify-between rounded-lg border-gray-200 bg-white px-4 text-sm font-medium shadow-sm"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                {buttonText}
              </span>

              <span className="text-xs text-gray-400">
                Open filters
              </span>
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-[min(88vw,380px)] overflow-y-auto p-0"
          >
            <SheetHeader className="border-b border-gray-100 px-5 py-4 pr-12">
              <SheetTitle className="text-left text-lg font-semibold">
                {title}
              </SheetTitle>
            </SheetHeader>

            <div className="p-4">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}