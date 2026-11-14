import { put, del } from "@vercel/blob";

export async function uploadEventCover(file: File, eventSlug: string) {
  const blob = await put(`events/${eventSlug}/cover`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function uploadQRCode(qrDataUrl: string, ticketId: string) {
  const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const blob = await put(`tickets/${ticketId}/qr.png`, buffer, {
    access: "public",
    contentType: "image/png",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function deleteBlob(url: string) {
  await del(url);
}
