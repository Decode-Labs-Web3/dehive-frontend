import { NextResponse } from "next/server";

// Uses IPFS HTTP API at IPFS_GATEWAY_URL_POST to add JSON content.
// Expects POST body: { record: PaymentTransferRecord }
// Returns: { cid }
export async function POST(req: Request) {
  try {
    const postEndpoint = process.env.IPFS_GATEWAY_URL_POST;
    if (!postEndpoint) {
      return NextResponse.json(
        { error: "IPFS_GATEWAY_URL_POST not configured" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.record) {
      return NextResponse.json({ error: "Missing record" }, { status: 400 });
    }

    const jsonString = JSON.stringify(body.record);
    const formData = new FormData();
    // IPFS API expects field name 'file'
    formData.append(
      "file",
      new Blob([jsonString], { type: "application/json" }),
      "payment.json"
    );

    const res = await fetch(postEndpoint, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json(
        { error: `IPFS add failed: ${txt}` },
        { status: 502 }
      );
    }

    // Typical go-ipfs response lines: { Name, Hash, Size }
    const ipfsResp = await res.json();
    const cid = ipfsResp.Hash || ipfsResp.cid || ipfsResp.Cid;
    if (!cid) {
      return NextResponse.json(
        { error: "CID not found in IPFS response" },
        { status: 500 }
      );
    }
    return NextResponse.json({ cid });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
