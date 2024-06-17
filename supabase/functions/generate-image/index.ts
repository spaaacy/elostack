Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed!", {
      status: 405,
    });
  }

  try {
    const requestData = await req.json();
    let prompt;
    if (!requestData.imagePrompt) {
      prompt = `Design a logo that is screen-print, flat, vector. This is the title for which the logo is to be designed: ${requestData.title} `;
    } else prompt = requestData.imagePrompt;
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
        }),
      }
    );
    const result = await response.json();
    return new Response({ imageUrl: result.data[0].url }, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(error, { status: 500 });
  }
});
