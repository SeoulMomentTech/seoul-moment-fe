import { revalidateTag, revalidatePath } from "next/cache";

export const runtime = "nodejs"; // ✅ revalidateTag는 Node 런타임 전용

export async function POST(req: Request) {
  try {
    const { tag, path } = await req.json();

    if (!tag && !path) {
      return new Response("Missing tag or path", { status: 400 });
    }

    if (tag) {
      revalidateTag(tag);
      console.log("[revalidateTag]", tag);
    }

    if (path) {
      revalidatePath(path);
      console.log("[revalidatePath]", path);
    }

    return Response.json({ ok: true, tag, path });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return new Response(e?.message ?? "Bad Request", { status: 400 });
  }
}
