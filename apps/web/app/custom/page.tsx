import CustomClientWrapper from "../_components/CustomClientWrapper";

interface CustomPageProps {
}

const CustomPage = async({ }: CustomPageProps) => {
    const result = await fetch('http://localhost:3001/content/json').then(res => res.json());
    console.log({ result });
    return (
    <>
      <CustomClientWrapper content={result.content} />
    </>
  );
}

export default CustomPage;