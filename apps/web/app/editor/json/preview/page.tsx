import { redirect } from "next/navigation";

export default function JsonPreviewPage() {
    redirect("/demo/preview?format=json");
}
