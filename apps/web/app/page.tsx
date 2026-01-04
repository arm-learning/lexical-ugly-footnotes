import ClientWrapper from "./_components/ClientWrapper";


export default async function Page(){
  // return null;
  const result = await fetch('http://localhost:3001/content/json').then(res => res.json());
  console.log({ result });
  // const [] = useActionState()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      <h1 className="text-4xl font-bold">Next.js App</h1>
      <ClientWrapper content={result.content} />
    </div>
  );
}
