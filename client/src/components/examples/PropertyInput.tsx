import PropertyInput from "../PropertyInput";

export default function PropertyInputExample() {
  return (
    <PropertyInput 
      onSubmit={(url) => console.log("Analyze property:", url)}
      isLoading={false}
    />
  );
}
