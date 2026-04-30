import { useState, useRef } from "react";
import {
  Sparkles,
  Upload,
  X,
  Check,
  Loader,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
  Wand2,
  ChevronDown,
} from "lucide-react";

interface AIImageGeneratorProps {
  category: "kanha-ji-dresses" | "sarees" | "other-products";
  onImageGenerated: (imageUrl: string) => void;
  onClose: () => void;
}

interface GeneratedImage {
  pose_id: string;
  pose_name: string;
  image_base64: string | null;
  prompt: string;
  source: string;
  message?: string;
}

const AI_SERVICE_URL = "http://localhost:8000";

const SELECTION_OPTIONS = {
  pose_style: [
    { id: "natural", name: "Natural/Pose" },
    { id: "dramatic", name: "Dramatic/Fashion" },
    { id: "traditional", name: "Traditional/Cultural" },
    { id: "minimal", name: "Minimal/Studio" },
  ],
  background: [
    { id: "white", name: "White Background" },
    { id: "gradient", name: "Soft Gradient" },
    { id: "temple", name: "Temple/Traditional" },
    { id: "festive", name: "Festive/Decorative" },
    { id: "nature", name: "Nature/Garden" },
  ],
  lighting: [
    { id: "soft", name: "Soft Lighting" },
    { id: "golden", name: "Golden Hour" },
    { id: "studio", name: "Studio Light" },
    { id: "dramatic", name: "Dramatic" },
    { id: "natural", name: "Natural Light" },
  ],
};

export default function AIImageGenerator({
  category,
  onImageGenerated,
  onClose,
}: AIImageGeneratorProps) {
  const [step, setStep] = useState<
    "options" | "upload" | "generating" | "preview"
  >("options");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [selections, setSelections] = useState({
    pose_style: "natural",
    background: "white",
    lighting: "soft",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContinueToUpload = () => {
    setStep("upload");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setStep("generating");
      setError(null);
      generateImages();
    };
    reader.readAsDataURL(file);
  };

  const generateImages = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImages([]);

    try {
      const base64Data = uploadedImage!.split(",")[1];

      const response = await fetch(`${AI_SERVICE_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_image: base64Data,
          product_type: category,
          product_description: "",
          pose_style: selections.pose_style,
          background: selections.background,
          lighting: selections.lighting,
        }),
      });

      if (!response.ok) {
        throw new Error("AI service error");
      }

      const data = await response.json();

      if (data.success) {
        setGeneratedImages(data.images || []);
        setStep("preview");
      } else {
        throw new Error(data.message || "Generation failed");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setGenerationError(err.message || "Failed to connect to AI service");
      setStep("preview");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectImage = (image: GeneratedImage) => {
    if (image.image_base64) {
      const dataUrl = `data:image/jpeg;base64,${image.image_base64}`;
      setSelectedImage(dataUrl);
    } else if (uploadedImage) {
      setSelectedImage(uploadedImage);
    }
  };

  const handleApprove = () => {
    if (selectedImage) {
      onImageGenerated(selectedImage);
    }
  };

  const handleUseOriginal = () => {
    if (uploadedImage) {
      onImageGenerated(uploadedImage);
    }
  };

  const handleRetry = () => {
    setStep("generating");
    setGeneratedImages([]);
    setSelectedImage(null);
    setGenerationError(null);
    generateImages();
  };

  const categoryName =
    category === "kanha-ji-dresses"
      ? "Kanha Ji Dress"
      : category === "sarees"
        ? "Saree"
        : "Special Collection";

  return (
    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Image Generator</h2>
            <p className="text-white/80 text-xs">Create professional images</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition"
        >
          <X className="text-white" size={20} />
        </button>
      </div>

      <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
        {/* OPTIONS STEP */}
        {step === "options" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Customize Your {categoryName} Images
              </h3>
              <p className="text-gray-500 text-sm">
                Select options below for personalized AI-generated images
              </p>
            </div>

            <div className="space-y-4">
              {/* Pose Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pose Style
                </label>
                <div className="relative">
                  <select
                    value={selections.pose_style}
                    onChange={(e) =>
                      setSelections({
                        ...selections,
                        pose_style: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none"
                  >
                    {SELECTION_OPTIONS.pose_style.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* Background */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Style
                </label>
                <div className="relative">
                  <select
                    value={selections.background}
                    onChange={(e) =>
                      setSelections({
                        ...selections,
                        background: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none"
                  >
                    {SELECTION_OPTIONS.background.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* Lighting */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lighting
                </label>
                <div className="relative">
                  <select
                    value={selections.lighting}
                    onChange={(e) =>
                      setSelections({ ...selections, lighting: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none"
                  >
                    {SELECTION_OPTIONS.lighting.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleContinueToUpload}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <Wand2 size={18} />
              Continue to Upload Photo
            </button>
          </div>
        )}

        {/* UPLOAD STEP */}
        {step === "upload" && (
          <div className="space-y-6">
            <div
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-purple-400 transition cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="text-purple-600" size={32} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Your {categoryName} Photo
              </h4>
              <p className="text-gray-500 text-sm mb-4">
                Upload a clear photo of your {categoryName.toLowerCase()}
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={() => setStep("options")}
              className="w-full py-2 text-gray-600 hover:text-gray-900 text-sm"
            >
              ← Back to Options
            </button>
          </div>
        )}

        {/* GENERATING STEP */}
        {step === "generating" && (
          <div className="space-y-6 text-center py-8">
            {uploadedImage && (
              <div className="relative rounded-xl overflow-hidden mb-6">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="w-full h-32 object-contain bg-gray-100 rounded-xl"
                />
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  Original
                </div>
              </div>
            )}

            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Loader className="text-purple-600 animate-spin" size={32} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                AI is generating...
              </h4>
              <p className="text-gray-500 text-sm mt-1">
                Creating 4 high-quality variations
              </p>
            </div>

            {generationError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{generationError}</p>
                <button
                  onClick={handleRetry}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                >
                  <RefreshCw size={14} className="inline mr-1" />
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* PREVIEW STEP */}
        {step === "preview" && (
          <div className="space-y-6">
            {/* Original vs Generated */}
            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="text-gray-600" size={18} />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    Original Photo
                  </p>
                  <p className="text-xs text-gray-500">{uploadedFile?.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setStep("upload");
                  setUploadedImage(null);
                  setUploadedFile(null);
                  setGeneratedImages([]);
                }}
                className="text-purple-600 text-xs font-medium"
              >
                Change
              </button>
            </div>

            {/* Generated Images Grid */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="text-purple-600" size={16} />
                AI Generated ({generatedImages.length})
              </h4>

              {generatedImages.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                  <AlertCircle
                    className="text-amber-600 mx-auto mb-2"
                    size={28}
                  />
                  <p className="text-amber-800 font-medium mb-2">
                    AI Service Not Available
                  </p>
                  <p className="text-amber-700 text-sm mb-4">
                    You can use your original photo instead.
                  </p>
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm"
                  >
                    <RefreshCw size={14} className="inline mr-1" />
                    Try Again
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {generatedImages.map((image) => (
                  <div
                    key={image.pose_id}
                    className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${
                      selectedImage ===
                      (image.image_base64
                        ? `data:image/jpeg;base64,${image.image_base64}`
                        : uploadedImage)
                        ? "ring-4 ring-purple-500 ring-offset-2"
                        : "hover:ring-2 hover:ring-purple-300"
                    }`}
                    onClick={() => handleSelectImage(image)}
                  >
                    {image.image_base64 ? (
                      <img
                        src={`data:image/jpeg;base64,${image.image_base64}`}
                        alt={image.pose_name}
                        className="w-full h-36 object-cover"
                      />
                    ) : (
                      <div className="w-full h-36 bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="text-gray-400" size={28} />
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white font-medium text-xs">
                        {image.pose_name}
                      </p>
                    </div>

                    {selectedImage ===
                      (image.image_base64
                        ? `data:image/jpeg;base64,${image.image_base64}`
                        : uploadedImage) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check className="text-white" size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleUseOriginal}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition text-sm"
              >
                Use Original
              </button>
              <button
                onClick={handleApprove}
                disabled={!selectedImage}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 text-sm"
              >
                Use Selected & Continue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span>Powered by Hugging Face</span>
        <span>100% Free</span>
      </div>
    </div>
  );
}
