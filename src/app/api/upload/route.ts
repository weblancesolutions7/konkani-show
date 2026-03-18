import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!process.env.AWS_S3_BUCKET_NAME) {
        return NextResponse.json({ error: "AWS_S3_BUCKET_NAME is not configured" }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate a clean filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
    const fileName = `uploads/${timestamp}-${sanitizedName}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      // Note: We rely on the S3 Bucket Policy for public read access 
      // as recommended in the implementation plan.
    };

    await s3.send(new PutObjectCommand(params));

    // Construct the public URL
    // Standard S3 URL format: https://bucket-name.s3.region.amazonaws.com/key
    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${fileName}`;

    return NextResponse.json({ secure_url: url });
  } catch (error: any) {
    console.error("S3 upload error:", error);
    return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
  }
}
