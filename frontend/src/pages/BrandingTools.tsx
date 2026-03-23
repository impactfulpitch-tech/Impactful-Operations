import { useState, useRef } from "react";
import { Download, Upload, Trash2, Copy, Check } from "lucide-react";

export default function BrandingTools() {
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [logoVariations, setLogoVariations] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedLogo(result);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateLogoVariations = () => {
    if (!uploadedLogo) {
      alert("Please upload a logo first");
      return;
    }

    setIsGenerating(true);

    // Simulate processing with canvas
    const img = new Image();
    img.onload = () => {
      const variations = [
        {
          id: "original",
          name: "Original Logo",
          size: "Original",
          width: img.width,
          height: img.height,
          data: uploadedLogo,
        },
        {
          id: "small",
          name: "Small (128x128)",
          size: "128x128",
          width: 128,
          height: 128,
          data: resizeImage(uploadedLogo, 128, 128),
        },
        {
          id: "medium",
          name: "Medium (256x256)",
          size: "256x256",
          width: 256,
          height: 256,
          data: resizeImage(uploadedLogo, 256, 256),
        },
        {
          id: "large",
          name: "Large (512x512)",
          size: "512x512",
          width: 512,
          height: 512,
          data: resizeImage(uploadedLogo, 512, 512),
        },
        {
          id: "favicon",
          name: "Favicon (32x32)",
          size: "32x32",
          width: 32,
          height: 32,
          data: resizeImage(uploadedLogo, 32, 32),
        },
        {
          id: "with_text",
          name: "Logo with Text",
          size: "Custom",
          width: 400,
          height: 200,
          data: addTextToLogo(uploadedLogo, "HRFlow"),
        },
      ];

      setLogoVariations(variations);
      setIsGenerating(false);
    };
    img.src = uploadedLogo;
  };

  const resizeImage = (
    dataUrl: string,
    width: number,
    height: number
  ): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = dataUrl;
    }) as any;
  };

  const addTextToLogo = (dataUrl: string, text: string): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = 400;
        canvas.height = 200;

        // White background
        ctx!.fillStyle = "#ffffff";
        ctx!.fillRect(0, 0, canvas.width, canvas.height);

        // Draw logo on left
        ctx!.drawImage(img, 20, 20, 160, 160);

        // Draw text on right
        ctx!.fillStyle = "#1f2937";
        ctx!.font = "48px bold sans-serif";
        ctx!.fillText(text, 200, 90);

        ctx!.fillStyle = "#6b7280";
        ctx!.font = "16px sans-serif";
        ctx!.fillText("Professional HR Management", 200, 130);

        resolve(canvas.toDataURL("image/png"));
      };
      img.src = dataUrl;
    }) as any;
  };

  const downloadLogo = (variation: any) => {
    const link = document.createElement("a");
    link.href = variation.data;
    link.download = `logo_${variation.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAsFormat = (variation: any, format: "png" | "jpg" | "svg") => {
    const link = document.createElement("a");
    link.href = variation.data;
    link.download = `logo_${variation.id}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (index: number, data: string) => {
    navigator.clipboard.write([
      new ClipboardItem({
        "image/png": fetch(data)
          .then((res) => res.blob())
          .then((blob) => blob),
      }),
    ]);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="p-6 sm:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Branding Tools
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Upload company logos and generate variations for different use cases
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 mb-8">
          <div className="flex flex-col items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Click to upload logo
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  PNG, JPG, or GIF up to 10MB
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            {uploadedLogo && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={generateLogoVariations}
                  disabled={isGenerating}
                  className={`px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                    isGenerating ? "animate-pulse" : ""
                  }`}
                >
                  {isGenerating ? "Generating..." : "Generate Variations"}
                </button>
                <button
                  onClick={() => {
                    setUploadedLogo(null);
                    setLogoVariations([]);
                    setFileName("");
                  }}
                  className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {uploadedLogo && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Uploaded Logo Preview
            </h2>
            <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg p-8 max-w-4xl">
              <img
                src={uploadedLogo}
                alt="Uploaded logo"
                className="max-h-64 max-w-full object-contain"
              />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
              File: {fileName}
            </p>
          </div>
        )}

        {/* Logo Variations Grid */}
        {logoVariations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Logo Variations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logoVariations.map((variation, index) => (
                <div
                  key={variation.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                >
                  {/* Preview */}
                  <div className="bg-slate-100 dark:bg-slate-900 p-6 flex items-center justify-center min-h-48">
                    <img
                      src={variation.data}
                      alt={variation.name}
                      className="max-h-40 max-w-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {variation.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {variation.size}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => downloadLogo(variation)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => copyToClipboard(index, variation.data)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          copiedIndex === index
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600"
                        }`}
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    {/* Format Options */}
                    <div className="flex gap-2 mt-2 text-xs">
                      <button
                        onClick={() => downloadAsFormat(variation, "png")}
                        className="flex-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-300 rounded transition-colors"
                      >
                        PNG
                      </button>
                      <button
                        onClick={() => downloadAsFormat(variation, "jpg")}
                        className="flex-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-300 rounded transition-colors"
                      >
                        JPG
                      </button>
                      <button
                        onClick={() => downloadAsFormat(variation, "svg")}
                        className="flex-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-300 rounded transition-colors"
                      >
                        SVG
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!uploadedLogo && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Upload your company logo to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
