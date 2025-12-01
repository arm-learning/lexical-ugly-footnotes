import ClientWrapper from "./_components/ClientWrapper";


export default function Page(): React.JSX.Element {

  // const [] = useActionState()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      <h1 className="text-4xl font-bold">Next.js App</h1>
      <ClientWrapper />

    </div>
  );
}
