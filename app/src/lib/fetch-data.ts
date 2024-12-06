// place files you want to import through the `$lib` alias in this folder.

const fetchData = async (url: string): Promise<unknown> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Error fetching data');
    }

    const data = await response.json();

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.warn(error.message);
      throw new Error(error.message, { cause: error });
    }
    console.warn(`Unknown error fetching ${url}}`);
    throw new Error(`Unknown error fetching ${url}}`);
  }
};

export default fetchData;
