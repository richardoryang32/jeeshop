import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getImageKit } from "@/configs/imagekit";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const formData = await request.formData();

    const name = formData.get("name");
    const username = formData.get("username");
    const description = formData.get("description");
    const email = formData.get("email");
    const contacts = formData.get("contacts");
    const address = formData.get("address");
    const image = formData.get("image");

    if (!name || !username || !description || !email || !contacts || !image) {
      return NextResponse.json({ error: "missing store info" }, { status: 400 });
    }

    const existingStore = await prisma.store.findFirst({ where: { userId } });
    if (existingStore) return NextResponse.json({ store: existingStore.status });

    const isUsernameTaken = await prisma.store.findFirst({
      where: { username: username.toLowerCase() }
    });

    if (isUsernameTaken) {
      return NextResponse.json({ error: "username already taken" }, { status: 400 });
    }

    const imagekit = getImageKit();

    const buffer = Buffer.from(await image.arrayBuffer());
    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: "logos"
    });

    const optimizedUrl = imagekit.url({
      path: uploaded.filePath,
      transformation: [{ quality: "auto" }, { format: "webp" }, { width: 200 }]
    });

    const newStore = await prisma.store.create({
      data: {
        userId,
        name,
        description,
        username: username.toLowerCase(),
        email,
        contact: contacts,
        address,
        logo: optimizedUrl,
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { store: { connect: { id: newStore.id } } }
    });

    return NextResponse.json({ message: "applied, waiting for approval" });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET(request) {
  const { userId } = getAuth(request);
  const store = await prisma.store.findFirst({ where: { userId } });
  return NextResponse.json({ store: store?.status ?? "unregistered" });
}
