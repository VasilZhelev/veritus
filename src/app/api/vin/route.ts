import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { vin } = await req.json();

    // Basic validation
    if (!vin || vin.length !== 17) {
      return NextResponse.json({ error: "Invalid VIN length" }, { status: 400 });
    }

    const vinUpper = vin.toUpperCase();
    const url = `https://db.vin/api/v1/vin/${vinUpper}`;

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: "VIN lookup failed", status: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Build the details object
    const details = {
        make: data.brand || null,
        model: data.model || null,
        year: data.year || null,
        fuel: data.fuelType || null,
        registrationCountry: data.registrationCountry || null,
        price: data.price || null,
        currency: data.currency || null,
        imported: data.registrationCountry
          ? data.registrationCountry !== "BG"
          : vinUpper[0].toUpperCase() !== "S", // fallback
      };
      

    return NextResponse.json({ vin: vinUpper, details });
  } catch (error) {
    console.error("VIN decode error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
