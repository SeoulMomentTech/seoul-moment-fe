interface StructuredDataScriptProps {
  schemaPromise: Promise<Record<string, unknown>>;
}

export async function StructuredDataScript({
  schemaPromise,
}: StructuredDataScriptProps) {
  const schema = await schemaPromise;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      type="application/ld+json"
    />
  );
}
