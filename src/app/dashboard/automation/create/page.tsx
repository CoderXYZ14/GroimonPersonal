import { CreateAutomationForm } from "@/components/CreateAutomationForm";

export default function CreateAutomationPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create Automation</h1>
        <p className="text-muted-foreground">
          Set up automated responses for your Instagram DMs
        </p>
      </div>
      <CreateAutomationForm />
    </div>
  );
}
