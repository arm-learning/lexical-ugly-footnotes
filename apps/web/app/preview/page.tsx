interface PreviewPageProps {
}

const PreviewPage = async ({ }: PreviewPageProps) => {
    const result = await fetch('http://localhost:3001/content/html').then(res => res.json());
    console.log({ result });
    // const content = result.content;
    // const html = new DOMParser().parseFromString(content, 'text/html');

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: result.content }} />
    </>
  );
}

export default PreviewPage;