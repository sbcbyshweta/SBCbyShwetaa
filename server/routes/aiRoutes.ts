import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { Request, Response } from "express";

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only image files (jpeg, jpg, png, webp, gif) are allowed!"));
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

router.post(
  "/upload-product-image",
  upload.single("image"),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        imageUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      res.status(500).json({ error: "Upload failed" });
    }
  },
);

router.post("/generate-ai-images", async (req: Request, res: Response) => {
  try {
    const { productImage, productType, productDetails } = req.body;

    if (!productImage) {
      return res.status(400).json({ error: "Product image is required" });
    }

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
      return res.status(500).json({
        error: "AI generation not configured",
        message: "Please set REPLICATE_API_TOKEN in environment variables",
        mockMode: true,
      });
    }

    const isSaree = productType === "saree" || productType === "sarees";
    const isKanhaDress = productType === "kanha-ji-dresses";

    let prompts = [];

    if (isSaree) {
      prompts = [
        {
          prompt:
            "Beautiful Indian woman wearing elegant saree, standing pose, professional photography, studio lighting, high quality, 4K",
          pose: "standing",
        },
        {
          prompt:
            "Beautiful Indian woman wearing saree, side profile view, elegant pose, soft lighting, professional photography",
          pose: "side_profile",
        },
        {
          prompt:
            "Close-up of Indian woman in beautiful saree showing detailed pallu draping, intricate embroidery visible, golden jewelry",
          pose: "pallu_shot",
        },
        {
          prompt:
            "Beautiful Indian woman sitting gracefully in saree, traditional pose, elegant posture, professional photography",
          pose: "sitting",
        },
      ];
    } else if (isKanhaDress) {
      prompts = [
        {
          prompt:
            "Divine Krishna idol or temple shrine backdrop, ornate marble temple setting, golden decorations, flowers, divine atmosphere, worship setting",
          pose: "temple_shine",
        },
        {
          prompt:
            "Beautiful Vrindavan style temple interior, marble floors, flower decorations, golden walls, Krishna deity ambiance, sacred atmosphere",
          pose: "vrindavan",
        },
        {
          prompt:
            "Modern temple backdrop with soft divine glow lighting, flowers and marigold decorations, golden pillars, peaceful sacred setting",
          pose: "modern_temple",
        },
        {
          prompt:
            "Traditional Indian shrine with peacock motifs, flower garlands, incense, golden frame, divine lighting, peaceful atmosphere",
          pose: "traditional_shrine",
        },
      ];
    }

    const generatedImages: string[] = [];
    const errors: string[] = [];

    for (const pose of prompts) {
      try {
        const response = await fetch(
          "https://api.replicate.com/v1/predictions",
          {
            method: "POST",
            headers: {
              Authorization: `Token ${REPLICATE_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              version: "stability-ai/sdxl:...",
              input: {
                prompt: pose.prompt,
                negative_prompt:
                  "blurry, low quality, distorted, ugly, deformed",
                guidance_scale: 7.5,
                num_inference_steps: 50,
              },
            }),
          },
        );

        const prediction = await response.json();

        let resultUrl = null;
        let attempts = 0;
        const maxAttempts = 60;

        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const statusResponse = await fetch(
            `https://api.replicate.com/v1/predictions/${prediction.id}`,
            {
              headers: {
                Authorization: `Token ${REPLICATE_API_TOKEN}`,
              },
            },
          );

          const statusData = await statusResponse.json();

          if (statusData.status === "succeeded") {
            resultUrl = statusData.output?.[0];
            break;
          } else if (statusData.status === "failed") {
            errors.push(`Pose ${pose.pose} failed: ${statusData.error}`);
            break;
          }

          attempts++;
        }

        if (resultUrl) {
          generatedImages.push(resultUrl);
        }
      } catch (error: any) {
        errors.push(`Error generating ${pose.pose}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      generatedImages,
      errors: errors.length > 0 ? errors : undefined,
      prompt: isSaree
        ? "Saree fashion photography"
        : "Krishna temple divine setting",
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Generation failed",
      message: error.message,
    });
  }
});

router.post("/inpaint-product", async (req: Request, res: Response) => {
  try {
    const { originalImage, maskImage, prompt } = req.body;

    if (!originalImage) {
      return res.status(400).json({ error: "Original image is required" });
    }

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
      return res.status(500).json({
        error: "AI generation not configured",
        message: "Please set REPLICATE_API_TOKEN",
        mockMode: true,
      });
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "image-to-image-model-version",
        input: {
          image: originalImage,
          mask: maskImage,
          prompt: prompt || "Enhanced product photography",
          strength: 0.75,
          guidance_scale: 7.5,
        },
      }),
    });

    const prediction = await response.json();

    res.json({
      success: true,
      predictionId: prediction.id,
      status: "processing",
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Inpainting failed",
      message: error.message,
    });
  }
});

router.get(
  "/generation-status/:predictionId",
  async (req: Request, res: Response) => {
    try {
      const { predictionId } = req.params;
      const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

      if (!REPLICATE_API_TOKEN) {
        return res.json({
          status: "mock",
          output:
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800",
        });
      }

      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
          },
        },
      );

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post(
  "/save-generated-image",
  upload.single("image"),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image provided" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        imageUrl,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to save image" });
    }
  },
);

export default router;
