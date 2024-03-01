type Response = {
  success: true;
  status: number;
  data?: any,
} | {
  success: false,
  status: number | null
}
const safeFetch = async (method: string, url: string, data?: any): Promise<Response> => {
  let response = null;

  try {
    response = await fetch(`${url}`, {
      method: method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
    });
    const responseData = await response.json();
    if (response.status > 299) {
      return {
        success: true,
        status: response.status,
      };
    }
    return {
      success: true,
      status: 200,
      data: responseData,
    };
  } catch (error) {
    return {
      success: false,
      status: null,
    };
  }

};

export default safeFetch;
