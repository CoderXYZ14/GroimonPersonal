import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AutomationStats } from "@/components/AutomationStats";
import { AutomationTabs } from "@/components/AutomationTabs";
import { AutomationTable } from "@/components/AutomationTable";

export default function AutomationPage() {
  return (
    <div className="flex flex-col gap-8">
      <AutomationStats />
      <div className="flex items-center justify-between">
        <AutomationTabs />
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="default"
            className="bg-primary hover:bg-primary/90"
          >
            <Link href="/dashboard/automation/create">
              <Plus className="mr-2 h-4 w-4" />
              Post automation
            </Link>
          </Button>
        </div>
      </div>
      <AutomationTable />
    </div>
  );
}
