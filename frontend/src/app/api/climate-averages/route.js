import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!lat || !lon || !start || !end) {
    return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
  }

  // 🧠 Convert future dates to 2024 equivalents
  const convertTo2024 = (dateStr) => {
    const date = new Date(dateStr);
    date.setFullYear(2024);
    return date.toISOString().split("T")[0];
  };

  const start2024 = convertTo2024(start);
  const end2024 = convertTo2024(end);

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start2024}&end_date=${end2024}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,windspeed_10m_max&timezone=auto`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.daily || !data.daily.time) {
      return NextResponse.json({ error: "No climate data available." }, { status: 404 });
    }

    const dailyData = data.daily.time.map((date, idx) => ({
      date,
      High: data.daily.temperature_2m_max[idx],
      Low: data.daily.temperature_2m_min[idx],
      Mean: data.daily.temperature_2m_mean[idx],
      Precipitation: data.daily.precipitation_sum[idx],
      Wind: data.daily.windspeed_10m_max[idx],
    }));

    return NextResponse.json(dailyData);
  } catch (error) {
    console.error("Weather archive error:", error);
    return NextResponse.json({ error: "Failed to fetch data." }, { status: 500 });
  }
}