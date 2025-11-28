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

    // Extract country from VIN if not provided by API
    // VIN first character indicates manufacturing region
    const getCountryFromVIN = (vin: string): string | null => {
      const firstChar = vin[0].toUpperCase();
      const wmiMap: Record<string, string> = {
        '1': 'US', '4': 'US', '5': 'US', // USA
        '2': 'CA', // Canada
        '3': 'MX', // Mexico
        'J': 'JP', // Japan
        'K': 'KR', // South Korea
        'L': 'CN', // China
        'S': 'GB', // UK
        'V': 'FR', // France (also Spain)
        'W': 'DE', // Germany
        'Y': 'SE', // Sweden (also Finland)
        'Z': 'IT', // Italy
      };
      return wmiMap[firstChar] || null;
    };

    const detectedCountry = data.registrationCountry || getCountryFromVIN(vinUpper);

    // Build the details object
    const details = {
        make: data.brand || null,
        model: data.model || null,
        year: data.year || null,
        fuel: data.fuelType || null,
        registrationCountry: detectedCountry,
        price: data.price || null,
        currency: data.currency || null,
        imported: detectedCountry
          ? detectedCountry !== "BG"
          : vinUpper[0].toUpperCase() !== "S", // fallback
      };
      

    return NextResponse.json({ vin: vinUpper, details });
  } catch (error) {
    console.error("VIN decode error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
