// app/api/export/pdf/route.ts
// Uses @sparticuz/chromium + puppeteer-core — works on Vercel serverless

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { html } = (await req.json()) as { html: string };

    if (!html) {
      return NextResponse.json({ error: "No HTML provided" }, { status: 400 });
    }

    const chromium = await import("@sparticuz/chromium").then((m) => m.default);
    const puppeteer = await import("puppeteer-core").then((m) => m.default);

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="cv.pdf"',
      },
    });
  } catch (e) {
    console.error("[/api/export/pdf]", e);
    return NextResponse.json({ error: "PDF export failed" }, { status: 500 });
  }
}
