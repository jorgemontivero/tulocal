import { ImageResponse } from "next/og";
import { createClient } from "@/utils/supabase/server";

export const runtime = "edge";

export const alt = "tulocal.com.ar";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("name,category,logo_url,description,address")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (!shop) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#064e3b", // emerald-900
            color: "#ecfdf5", // emerald-50
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          tulocal.com.ar
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          backgroundImage: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)", // emerald bg
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            height: "100%",
            width: "100%",
            padding: "80px",
            border: "24px solid #059669", // emerald-600
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "40px",
            }}
          >
            {shop.logo_url && (
              <img
                src={shop.logo_url}
                alt={shop.name}
                width={200}
                height={200}
                style={{
                  borderRadius: "100px",
                  objectFit: "cover",
                  border: "8px solid white",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
              />
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  color: "#059669",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  marginBottom: "16px",
                  fontWeight: 600,
                }}
              >
                {shop.category || "Comercio local"}
              </div>
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: "#0f172a", // slate-900
                  lineHeight: 1.1,
                  maxWidth: "750px",
                }}
              >
                {shop.name}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginTop: "auto",
              borderTop: "2px solid #d1fae5", // emerald-100
              paddingTop: "40px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                color: "#334155",
                fontSize: 24,
                maxWidth: "600px",
              }}
            >
              {shop.description && (
                <div
                  style={{
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                >
                  {shop.description}
                </div>
              )}
              {shop.address && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "12px",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: "12px", color: "#059669" }}
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {shop.address}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#059669",
                  color: "white",
                  padding: "16px 32px",
                  borderRadius: "100px",
                  fontSize: 28,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Ver en <b style={{ marginLeft: "8px" }}>tulocal.com.ar</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
