import { useState, useRef } from "react";
import {
  Upload,
  Loader,
  X,
  Check,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Wand2,
  Shirt,
  Crown,
  Palette,
  Zap,
  Camera,
  Sparkle,
  RotateCcw,
  Info,
  Lightbulb,
} from "lucide-react";

interface AIImageGeneratorProps {
  category: "kanha-ji-dresses" | "sarees" | "other-products";
  productName?: string;
  productDescription?: string;
  onImageGenerated: (imageUrl: string) => void;
  onClose?: () => void;
}

interface GenerationTask {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  imageUrl?: string;
  error?: string;
  pose: string;
  timestamp: number;
}

interface GenerationStatus {
  totalTasks: number;
  completed: number;
  failed: number;
  processing: number;
  tasks: GenerationTask[];
}

const API_URL = "/api";

export default function AIImageGenerator({
  category,
  productName = "",
  productDescription = "",
  onImageGenerated,
  onClose,
}: AIImageGeneratorProps) {
  const [step, setStep] = useState<"upload" | "generate" | "select" | "final">(
    "upload",
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] =
    useState<GenerationStatus | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiConfigured, setApiConfigured] = useState(true);
  const [showRetryOption, setShowRetryOption] = useState(false);
  const [generationMode, setGenerationMode] = useState<
    "direct" | "upload-only"
  >("direct");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSaree = category === "sarees";
  const isKanhaDress = category === "kanha-ji-dresses";

  const getPoseDescriptions = () => {
    if (isSaree) {
      return [
        {
          id: "standing",
          name: "Standing Pose",
          description:
            "sbcbyshweta girl wearing YOUR saree - elegant standing pose",
          prompt:
            "Beautiful Indian woman wearing [SAREE_DESCRIPTION], standing gracefully, professional photography, studio lighting",
        },
        {
          id: "side_profile",
          name: "Side Profile",
          description: "sbcbyshweta girl - showing saree drape & pallu",
          prompt:
            "Beautiful Indian woman in [SAREE_DESCRIPTION], side profile, showing intricate pallu draping, golden jewelry",
        },
        {
          id: "pallu_shot",
          name: "Pallu Detail",
          description: "Close-up of saree border & design",
          prompt:
            "Close-up shot of [SAREE_DESCRIPTION], detailed view of pallu border and embroidery work, professional macro photography",
        },
        {
          id: "sitting",
          name: "Traditional Pose",
          description: "sbcbyshweta girl sitting gracefully",
          prompt:
            "Beautiful Indian woman sitting gracefully wearing [SAREE_DESCRIPTION], traditional pose, elegant posture",
        },
      ];
    } else if (isKanhaDress) {
      return [
        {
          id: "idol_main",
          name: "Main Shrine View",
          description: "Laddu Gopal wearing YOUR dress on marble altar",
          prompt:
            "Beautiful Laddu Gopal (Krishna) idol wearing [DRESS_DESCRIPTION], seated on ornate marble altar, temple background with flowers and diyas, divine golden lighting",
        },
        {
          id: "closeup_dress",
          name: "Dress Detail",
          description: "Close-up showing YOUR dress embroidery & work",
          prompt:
            "Close-up of Laddu Gopal idol wearing [DRESS_DESCRIPTION], detailed view of golden zari embroidery, intricate handwork visible, soft divine glow lighting",
        },
        {
          id: "full_shrine",
          name: "Full Shrine",
          description: "Complete temple shrine with decorations",
          prompt:
            "Laddu Gopal idol in [DRESS_DESCRIPTION], complete temple shrine setup, marble platform, flower garlands, oil lamps, golden altar, Vrindavan style decorations",
        },
        {
          id: "festive",
          name: "Festive Setup",
          description: "Special festival decoration with YOUR dress",
          prompt:
            "Laddu Gopal wearing [DRESS_DESCRIPTION] in festive temple setup, marigold flowers everywhere, diyas glowing, golden decorations, celebration atmosphere, sacred and divine",
        },
      ];
    }
    return [];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setStep("generate");
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const uploadToServer = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${API_URL}/ai/upload-product-image`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        return data.imageUrl;
      }
      return null;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const generateImages = async () => {
    if (!uploadedFile) return;

    setIsGenerating(true);
    setError(null);
    setShowRetryOption(false);

    const tasks: GenerationTask[] = getPoseDescriptions().map((pose) => ({
      id: pose.id,
      status: "pending",
      pose: pose.name,
      timestamp: Date.now(),
    }));

    setGenerationStatus({
      totalTasks: tasks.length,
      completed: 0,
      failed: 0,
      processing: 0,
      tasks,
    });

    try {
      const imageUrl = await uploadToServer(uploadedFile);

      if (!imageUrl) {
        throw new Error("Failed to upload image to server");
      }

      const response = await fetch(`${API_URL}/ai/generate-ai-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productImage: imageUrl,
          productType: category,
          productDetails: {
            name: productName,
            description: productDescription,
          },
        }),
      });

      const data = await response.json();

      if (data.mockMode || !data.success) {
        setApiConfigured(false);

        const mockImages = getPoseDescriptions().map((pose, index) => ({
          id: pose.id,
          url:
            uploadedImage ||
            `https://via.placeholder.com/600x800?text=${encodeURIComponent(pose.name)}`,
        }));

        const updatedTasks = tasks.map((task, index) => ({
          ...task,
          status: "completed" as const,
          imageUrl: mockImages[index]?.url,
        }));

        setGenerationStatus({
          totalTasks: tasks.length,
          completed: tasks.length,
          failed: 0,
          processing: 0,
          tasks: updatedTasks,
        });

        setStep("select");
        setIsGenerating(false);
        return;
      }

      if (data.success && data.generatedImages?.length > 0) {
        const completedTasks = tasks.map((task, index) => ({
          ...task,
          status: data.generatedImages[index]
            ? ("completed" as const)
            : ("failed" as const),
          imageUrl: data.generatedImages[index] || undefined,
        }));

        setGenerationStatus({
          totalTasks: tasks.length,
          completed:
            tasks.length -
            completedTasks.filter((t) => t.status === "failed").length,
          failed: completedTasks.filter((t) => t.status === "failed").length,
          processing: 0,
          tasks: completedTasks,
        });

        setStep("select");
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate images");

      const failedTasks = tasks.map((task) => ({
        ...task,
        status: "failed" as const,
        error: err.message,
      }));

      setGenerationStatus({
        totalTasks: tasks.length,
        completed: 0,
        failed: tasks.length,
        processing: 0,
        tasks: failedTasks,
      });

      setShowRetryOption(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const useOriginalImage = () => {
    if (uploadedImage) {
      onImageGenerated(uploadedImage);
      setStep("final");
    }
  };

  const retryFailed = () => {
    setShowRetryOption(false);
    setError(null);
    generateImages();
  };

  const toggleImageSelection = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(selectedImages.filter((img) => img !== imageUrl));
    } else {
      setSelectedImages([...selectedImages, imageUrl]);
    }
  };

  const selectAllImages = () => {
    if (!generationStatus) return;

    const allCompleted = generationStatus.tasks
      .filter((t) => t.status === "completed" && t.imageUrl)
      .map((t) => t.imageUrl!);

    if (selectedImages.length === allCompleted.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(allCompleted);
    }
  };

  const approveAndUse = () => {
    if (selectedImages.length === 0) {
      setError("Please select at least one image");
      return;
    }

    const primaryImage = selectedImages[0];
    onImageGenerated(primaryImage);

    if (selectedImages.length > 1) {
      localStorage.setItem(
        `product_gallery_${Date.now()}`,
        JSON.stringify(selectedImages),
      );
    }

    setStep("final");
  };

  const resetGenerator = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setStep("upload");
    setError(null);
    setSelectedImages([]);
    setGenerationStatus(null);
    setShowRetryOption(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                {isSaree
                  ? "Saree Image Generator"
                  : isKanhaDress
                    ? "Kanha Ji Dress Generator"
                    : "Product Image Generator"}
              </h3>
              <p className="text-white/80 text-sm">
                {isSaree
                  ? "Upload your saree photo - get professional sbcbyshweta girl images"
                  : isKanhaDress
                    ? "Upload your dress photo - get Laddu Gopal wearing YOUR dress"
                    : "Enhance your product images"}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="text-white" size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">How it works:</p>
            <p>
              {isSaree
                ? "Upload your saree photo. The AI will create professional images of our sbcbyshweta model wearing YOUR exact saree - keeping the design 100% authentic!"
                : isKanhaDress
                  ? "Upload your Kanha Ji dress photo. The AI will create stunning images of Laddu Gopal idol wearing YOUR exact dress on beautiful temple backdrops!"
                  : "Upload your product photo. The AI will enhance it with professional styling."}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <p className="text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </p>
        </div>
      )}

      <div className="p-6">
        {step === "upload" && (
          <div className="space-y-6">
            <div
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-purple-400 transition cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="text-purple-600" size={40} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Your Product Photo
              </h4>
              <p className="text-gray-500 mb-4">
                {isSaree
                  ? "Upload a clear photo of YOUR saree - this will be used to generate images with our model wearing YOUR exact saree"
                  : isKanhaDress
                    ? "Upload a clear photo of YOUR Kanha Ji dress - this will be used to generate images of Laddu Gopal wearing YOUR exact dress"
                    : "Upload a clear photo of your product"}
              </p>
              <p className="text-sm text-gray-400">PNG, JPG, WEBP up to 10MB</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="text-amber-600 flex-shrink-0 mt-0.5"
                  size={18}
                />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold">Important:</p>
                  <p>
                    {isSaree
                      ? "Upload the ACTUAL saree you want to sell. The AI will preserve the exact design, color, and pattern of YOUR saree."
                      : isKanhaDress
                        ? "Upload the ACTUAL dress you want to sell. The AI will show Laddu Gopal wearing YOUR exact dress with all embroidery details preserved."
                        : "Upload a clear, well-lit photo of your product."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "generate" && (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={uploadedImage!}
                alt="Uploaded product"
                className="w-full h-48 object-contain bg-gray-100"
              />
              <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Check size={12} />
                Your Product Photo
              </div>
              <button
                onClick={resetGenerator}
                className="absolute top-3 right-3 p-2 bg-white/90 rounded-lg hover:bg-white transition"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-purple-900 font-medium mb-2 flex items-center gap-2">
                <Sparkles size={18} />
                What happens next?
              </p>
              <p className="text-purple-800 text-sm">
                {isSaree
                  ? "The AI will create 4 images of our sbcbyshweta model wearing YOUR exact saree. The design, color, and pattern will be 100% authentic to your photo."
                  : isKanhaDress
                    ? "The AI will create 4 images of Laddu Gopal idol wearing YOUR exact dress with beautiful temple backdrops. All embroidery details preserved!"
                    : "The AI will enhance your product photo with professional styling."}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={useOriginalImage}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <ImageIcon size={18} />
                Use Original Photo
              </button>
              <button
                onClick={generateImages}
                disabled={isGenerating}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate AI Images
                  </>
                )}
              </button>
            </div>

            {isGenerating && generationStatus && (
              <div className="space-y-3">
                {generationStatus.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        task.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : task.status === "failed"
                            ? "bg-red-100 text-red-600"
                            : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {task.status === "completed" ? (
                        <Check size={16} />
                      ) : task.status === "failed" ? (
                        <AlertCircle size={16} />
                      ) : (
                        <Loader className="animate-spin" size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.pose}</p>
                      <p className="text-xs text-gray-500">
                        {task.status === "pending"
                          ? "Waiting..."
                          : task.status === "processing"
                            ? "Creating image..."
                            : task.status === "completed"
                              ? "Complete!"
                              : "Failed"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showRetryOption && (
              <button
                onClick={retryFailed}
                className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Retry Failed Images
              </button>
            )}
          </div>
        )}

        {step === "select" && generationStatus && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Generated Images
                </h4>
                <p className="text-sm text-gray-500">
                  {generationStatus.completed} of {generationStatus.totalTasks}{" "}
                  successful
                </p>
              </div>
              <button
                onClick={selectAllImages}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {selectedImages.length ===
                generationStatus.tasks.filter((t) => t.status === "completed")
                  .length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <ImageIcon
                  className="text-blue-600 flex-shrink-0 mt-0.5"
                  size={18}
                />
                <p className="text-sm text-blue-900">
                  <strong>Base Image:</strong> Your uploaded product photo was
                  used as reference. The AI created these variations while
                  keeping your product design 100% authentic!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {generationStatus.tasks
                .filter((t) => t.status === "completed" && t.imageUrl)
                .map((task) => (
                  <div
                    key={task.id}
                    className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${
                      selectedImages.includes(task.imageUrl!)
                        ? "ring-4 ring-purple-500 ring-offset-2"
                        : "hover:ring-2 hover:ring-purple-300"
                    }`}
                    onClick={() => toggleImageSelection(task.imageUrl!)}
                  >
                    <img
                      src={task.imageUrl}
                      alt={task.pose}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition">
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white font-medium">{task.pose}</p>
                      </div>
                    </div>
                    {selectedImages.includes(task.imageUrl!) && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check className="text-white" size={18} />
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetGenerator}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Generate New
              </button>
              <button
                onClick={approveAndUse}
                disabled={selectedImages.length === 0}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Use Selected ({selectedImages.length})
              </button>
            </div>
          </div>
        )}

        {step === "final" && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Image Selected!
            </h4>
            <p className="text-gray-600 mb-6">
              Your{" "}
              {isKanhaDress ? "Kanha Ji dress" : isSaree ? "saree" : "product"}{" "}
              image is ready to be added to the product
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={resetGenerator}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Generate More
              </button>
              <button
                onClick={() => {
                  if (onClose) onClose();
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition"
              >
                Continue to Product
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {isSaree
            ? "Your saree design is protected - AI uses your photo as reference to maintain 100% authenticity"
            : isKanhaDress
              ? "Your dress design is protected - AI preserves all embroidery and work details"
              : "Images are optimized for web and stored permanently"}
        </p>
      </div>
    </div>
  );
}
