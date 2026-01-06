import { redirect } from "next/navigation";

export default function JsonEditorPage() {
    redirect("/demo?format=json");
}
