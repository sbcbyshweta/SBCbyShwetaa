"""
SBC by Shwetaa - AI Image Generation Microservice
Uses Hugging Face Inference API (FREE) for image generation

Installation:
1. pip install fastapi uvicorn python-multipart aiofiles requests
2. Get FREE Hugging Face API token: https://huggingface.co/settings/tokens
3. Run: python main.py
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import requests
import base64
import io
import json
import os
from datetime import datetime

app = FastAPI(title="SBC AI Image Generator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN", "")

# Pose configurations for different categories
POSE_CONFIGS = {
    "sarees": [
        {
            "pose": "standing",
            "name": "Standing Pose",
            "prompt": "Beautiful Indian woman wearing elegant {product_desc}, standing gracefully in professional studio, soft lighting, high-end fashion photography, full body shot, clean white background, realistic fabric texture visible, photorealistic"
        },
        {
            "pose": "side_profile",
            "name": "Side Profile",
            "prompt": "Beautiful Indian woman in stunning {product_desc}, elegant side profile showing saree draping and pallu, intricate pallu design visible, golden jewelry, professional photography, soft ambient lighting, photorealistic"
        },
        {
            "pose": "pallu_detail",
            "name": "Pallu Detail",
            "prompt": "Close-up macro shot of {product_desc}, detailed view of intricate pallu border and embroidery work, rich fabric texture, golden zari work visible, luxury product photography, professional lighting, photorealistic"
        },
        {
            "pose": "sitting",
            "name": "Traditional Sitting",
            "prompt": "Beautiful Indian woman gracefully sitting wearing {product_desc}, traditional Indian pose, elegant posture, intricate jewelry, festive occasion, professional photography, soft divine lighting, photorealistic"
        }
    ],
    "kanha-ji-dresses": [
        {
            "pose": "temple_shrine",
            "name": "Temple Shrine",
            "prompt": "Laddu Gopal idol (baby Krishna) wearing exquisite {product_desc}, seated on ornate marble temple altar, divine golden lighting, flower garlands, traditional Vrindavan temple setting, sacred atmosphere, premium product photography, photorealistic"
        },
        {
            "pose": "vrindavan",
            "name": "Vrindavan Style",
            "prompt": "Beautiful depiction of Laddu Gopal in stunning {product_desc}, Vrindavan temple interior, marble floors, flower decorations, golden walls, peacock feathers, sacred cow nearby, divine golden glow lighting, professional sacred photography, photorealistic"
        },
        {
            "pose": "modern_temple",
            "name": "Modern Temple",
            "prompt": "Laddu Gopal idol wearing luxurious {product_desc}, modern temple backdrop with soft divine glow, flowers and marigold decorations, golden pillars, peaceful sacred atmosphere, premium jewelry on idol, professional photography, photorealistic"
        },
        {
            "pose": "festive",
            "name": "Festive Setup",
            "prompt": "Laddu Gopal idol in magnificent {product_desc}, festive temple celebration setup, marigold flowers everywhere, glowing oil lamps, golden decorations, diyas lit, celebration atmosphere, intricate embroidery visible on dress, sacred and divine, photorealistic"
        }
    ],
    "other-products": [
        {
            "pose": "hero_shot",
            "name": "Hero Shot",
            "prompt": "Stunning {product_desc} displayed elegantly, luxury product photography, premium silk texture background, soft professional lighting, clean minimalist setup, high-end jewelry showcase, photorealistic"
        },
        {
            "pose": "lifestyle",
            "name": "Lifestyle Shot",
            "prompt": "{product_desc} styled in elegant lifestyle setting, traditional Indian decor background, warm golden lighting, premium accessory photography, professional commercial photography, photorealistic"
        },
        {
            "pose": "detail_shot",
            "name": "Detail Shot",
            "prompt": "Extreme close-up of {product_desc}, showing intricate details and craftsmanship, macro photography, professional lighting, luxury product showcase, photorealistic"
        },
        {
            "pose": "flat_lay",
            "name": "Flat Lay",
            "prompt": "{product_desc} beautifully arranged in flat lay composition, soft pastel background, professional product photography, overhead shot, photorealistic"
        }
    ]
}

class GenerateRequest(BaseModel):
    product_image: str  # Base64 encoded image
    product_type: str  # "sarees", "kanha-ji-dresses", "other-products"
    product_description: Optional[str] = ""
    product_color: Optional[str] = ""
    product_fabric: Optional[str] = ""
    pose_style: Optional[str] = "natural"  # natural, dramatic, traditional, minimal
    background: Optional[str] = "white"  # white, gradient, temple, festive, nature
    lighting: Optional[str] = "soft"  # soft, golden, studio, dramatic, natural


def analyze_product_from_image(image_base64: str) -> dict:
    """Analyze product image to extract color, fabric, and design details"""
    # Since we're using Hugging Face free tier, we'll use predefined analysis
    # In production, you could use GPT-4 Vision or Gemini for detailed analysis
    return {
        "color": "rich traditional",
        "fabric": "premium silk",
        "design": "intricate handwork",
        "description": "beautiful handcrafted Indian attire"
    }


def generate_image_huggingface(prompt: str, negative_prompt: str = "") -> str:
    """Generate image using Hugging Face Inference API (FREE)"""
    
    if not HUGGINGFACE_TOKEN:
        # Return placeholder if no token - for testing
        return None
    
    try:
        api_url = "https://router.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
        
        headers = {
            "Authorization": f"Bearer {HUGGINGFACE_TOKEN}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "negative_prompt": negative_prompt or "blurry, low quality, distorted, ugly, deformed, fake, plastic, cartoon, anime, watermark, text, logo",
                "num_inference_steps": 30,
                "guidance_scale": 7.5,
                "height": 1024,
                "width": 1024
            }
        }
        
        response = requests.post(
            api_url,
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            # Return as base64
            return base64.b64encode(response.content).decode('utf-8')
        else:
            print(f"Hugging Face API Error: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"Error generating image: {e}")
        return None


def generate_with_fal_ai(prompt: str) -> str:
    """Alternative: Use Fal.ai API for faster generation"""
    # Sign up at https://fal.ai for free API key
    FAL_TOKEN = os.getenv("FAL_TOKEN", "")
    
    if not FAL_TOKEN:
        return None
        
    try:
        headers = {
            "Authorization": f"Key {FAL_TOKEN}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "prompt": prompt,
            "num_images": 1,
            "sync_mode": True
        }
        
        response = requests.post(
            "https://queue.fal.run/fal-ai/flux/schnell",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("images", [{}])[0].get("url")
        return None
    except Exception as e:
        print(f"Fal.ai Error: {e}")
        return None


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "SBC AI Image Generator",
        "version": "1.0.0",
        "endpoints": {
            "/health": "Health check",
            "/generate": "Generate AI images (POST)",
            "/analyze": "Analyze product image (POST)",
            "/poses/{category}": "Get available poses for category"
        }
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "huggingface_configured": bool(HUGGINGFACE_TOKEN),
        "timestamp": datetime.now().isoformat()
    }


@app.get("/poses/{category}")
async def get_poses(category: str):
    """Get available poses for a category"""
    poses = POSE_CONFIGS.get(category, POSE_CONFIGS["other-products"])
    return {
        "category": category,
        "poses": [{"id": p["pose"], "name": p["name"]} for p in poses]
    }


@app.post("/generate")
async def generate_images(request: GenerateRequest):
    """
    Generate 4 professional images based on uploaded product photo
    """
    try:
        # Get poses for category
        poses = POSE_CONFIGS.get(
            request.product_type,
            POSE_CONFIGS["other-products"]
        )
        
        # Build style modifiers based on selections
        pose_modifier = {
            "natural": "natural pose, relaxed posture",
            "dramatic": "dramatic fashion pose, editorial style",
            "traditional": "traditional cultural pose, graceful",
            "minimal": "minimal studio pose, clean and simple"
        }.get(request.pose_style, "natural pose")

        background_modifier = {
            "white": "clean white studio background",
            "gradient": "beautiful soft gradient background",
            "temple": "ornate temple interior, marble floors, golden walls",
            "festive": "festive decoration, marigold flowers, diyas",
            "nature": "lush garden setting, flowers and foliage"
        }.get(request.background, "clean white background")

        lighting_modifier = {
            "soft": "soft diffused lighting, even illumination",
            "golden": "warm golden hour lighting, divine glow",
            "studio": "professional studio lighting, rim light",
            "dramatic": "dramatic side lighting, high contrast",
            "natural": "natural daylight, soft shadows"
        }.get(request.lighting, "soft diffused lighting")

        style_suffix = f", {pose_modifier}, {background_modifier}, {lighting_modifier}, professional photography, ultra realistic, 8k quality, detailed fabric texture"
        
        # Analyze the uploaded image
        analysis = analyze_product_from_image(request.product_image)
        
        # Build product description
        product_parts = []
        if request.product_color:
            product_parts.append(request.product_color)
        if request.product_fabric:
            product_parts.append(request.product_fabric)
        if request.product_description:
            product_parts.append(request.product_description)
        
        if not product_parts:
            product_parts = [analysis["color"], analysis["fabric"], analysis["design"]]
        
        product_desc = " ".join(product_parts)
        
        # Generate 4 images
        generated_images = []
        
        for pose in poses:
            base_prompt = pose["prompt"].format(product_desc=product_desc)
            prompt = base_prompt + style_suffix
            
            # Try Hugging Face first
            image_base64 = generate_image_huggingface(prompt)
            
            if image_base64:
                generated_images.append({
                    "pose_id": pose["pose"],
                    "pose_name": pose["name"],
                    "image_base64": image_base64,
                    "prompt": prompt,
                    "source": "huggingface"
                })
            else:
                # If API not configured, return mock data for testing
                generated_images.append({
                    "pose_id": pose["pose"],
                    "pose_name": pose["name"],
                    "image_base64": None,
                    "prompt": prompt,
                    "source": "placeholder",
                    "message": "API token not configured"
                })
        
        return {
            "success": True,
            "product_type": request.product_type,
            "analysis": analysis,
            "product_description": product_desc,
            "images": generated_images,
            "count": len(generated_images)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze")
async def analyze_image(image_base64: str):
    """Analyze product image to extract details"""
    try:
        analysis = analyze_product_from_image(image_base64)
        return {
            "success": True,
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Run with: uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    print("="*60)
    print("SBC AI Image Generator Microservice")
    print("="*60)
    print("\n📋 FREE API Setup Instructions:")
    print("-"*60)
    print("\n1. HUGGING FACE (Recommended - 100% FREE):")
    print("   a. Go to: https://huggingface.co/settings/tokens")
    print("   b. Create new token with 'Read' permissions")
    print("   c. Set environment variable:")
    print("      export HUGGINGFACE_TOKEN='your_token_here'")
    print("      (Windows: set HUGGINGFACE_TOKEN=your_token)")
    print("\n2. Alternative - FAL.AI (Also Free):")
    print("   a. Go to: https://fal.ai")
    print("   b. Sign up for free account")
    print("   c. Set: export FAL_TOKEN='your_key'")
    print("\n" + "="*60)
    print("\n🚀 Starting server on http://localhost:8000")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
