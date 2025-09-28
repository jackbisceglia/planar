type ExampleInsert = { id?: string };
type Example = { id: string };

export namespace Example {
  export function create(data: ExampleInsert) {
    const inserted = JSON.stringify(data);

    console.log(`inserting ${inserted}`);

    return { id: "123" } satisfies Example;
  }
}
