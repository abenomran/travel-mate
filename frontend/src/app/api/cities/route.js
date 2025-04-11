// /app/api/cities/route.js
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const namePrefix = searchParams.get("q");
  
    if (!namePrefix) {
      return new Response(JSON.stringify({ error: "Missing query param" }), {
        status: 400,
      });
    }
  
    try {
      const response = await fetch(
        `http://geodb-free-service.wirefreethought.com/v1/geo/cities?limit=5&namePrefix=${namePrefix}`
      );
  
      const data = await response.json();
  
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch city suggestions" }),
        { status: 500 }
      );
    }
  }
  