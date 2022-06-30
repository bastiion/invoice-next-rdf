const config = {
  backend_base_url: 'http://localhost:3000'
}
export function fetcher<TData, TVariables>(
  query: string,
  variables?: TVariables
) {
  return async (): Promise<TData> => {
    const res = await fetch(`${config.backend_base_url}/`, {
      method: "POST",
      body: JSON.stringify({ query, variables }),

      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    if (json.errors?.length) {
      console.error("Graphql Error:", {errors: json.errors }, query, variables);
    }
    const { data } = json

    return data;
  };
}
