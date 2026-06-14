"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, QrCode, Camera } from "lucide-react";
import { toast } from "sonner";
import { ProductIdSchema } from "@/lib/domain";

interface QRScanInputProps {
  onCodeScanned: (code: string) => void;
}

export function QRScanInput({ onCodeScanned }: QRScanInputProps) {
  const [pastedCode, setPastedCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [hasCamera, setHasCamera] = useState(false);

  // Check for camera availability
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {
          setHasCamera(true);
        })
        .catch(() => {
          setHasCamera(false);
        });
    }
  }, []);

  const validateCode = (code: string): boolean => {
    const result = ProductIdSchema.safeParse(code.trim());
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid format");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      toast.info("QR code image uploaded (mock: extracting code...)");
      setTimeout(() => {
        const mockCode = `RLQ-QUAL-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
        if (validateCode(mockCode)) {
          onCodeScanned(mockCode.trim());
          setPastedCode(mockCode);
        }
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = () => {
    if (!pastedCode.trim()) return;
    if (validateCode(pastedCode)) {
      onCodeScanned(pastedCode.trim());
    }
  };

  const handleCameraScan = () => {
    if (!hasCamera) {
      toast.info("Camera not available. Please use manual entry or upload image.");
      return;
    }
    // Mock camera scan - in real implementation would use camera API
    toast.info("Camera scan (mock: opening camera...)");
    setTimeout(() => {
      const mockCode = `RLQ-QUAL-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
      if (validateCode(mockCode)) {
        onCodeScanned(mockCode);
        setPastedCode(mockCode);
      }
    }, 1000);
  };

  const handleLinkPaste = (link: string) => {
    // Extract code from URL patterns like:
    // - /verify?code=RLQ-QUAL-001
    // - https://relique.ch/verify?code=RLQ-QUAL-001
    // - verify?code=RLQ-QUAL-001
    const urlMatch = link.match(/[?&]code=([^&]+)/i);
    if (urlMatch) {
      const extractedCode = decodeURIComponent(urlMatch[1] || "");
      if (validateCode(extractedCode)) {
        onCodeScanned(extractedCode.trim());
        setPastedCode(extractedCode.trim());
        return;
      }
    }
    // If no URL pattern, try direct code
    if (validateCode(link)) {
      onCodeScanned(link.trim());
      setPastedCode(link.trim());
    }
  };

  return (
    <Tabs defaultValue="manual" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="manual">Enter Code</TabsTrigger>
        <TabsTrigger value="qr">QR Scan</TabsTrigger>
        <TabsTrigger value="link">Paste Link</TabsTrigger>
      </TabsList>
      <TabsContent value="manual" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code-input">Enter Product ID</Label>
          <Input
            id="code-input"
            placeholder="e.g., RLQ-QUAL-001"
            value={pastedCode}
            onChange={(e) => {
              setPastedCode(e.target.value);
              setError(null);
            }}
            className={error ? "border-destructive" : ""}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Format: RLQ-XXXX-XXXX (e.g., RLQ-QUAL-001)
          </p>
        </div>
        <Button onClick={handlePaste} className="w-full" disabled={!pastedCode.trim() || !!error}>
          Verify Code
        </Button>
      </TabsContent>
      <TabsContent value="qr" className="space-y-4">
        {hasCamera && (
          <div className="space-y-2">
            <Label>Scan QR Code</Label>
            <div className="border-2 border-dashed p-8 text-center space-y-4">
              <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Use your camera to scan a QR code
                </p>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCameraScan}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Open Camera
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label>Upload QR Code Image</Label>
          <div className="border-2 border-dashed p-8 text-center space-y-4">
            <QrCode className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Upload an image containing a QR code
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paste-code">Or Enter Code Manually</Label>
          <Input
            id="paste-code"
            placeholder="e.g., RLQ-QUAL-001"
            value={pastedCode}
            onChange={(e) => {
              setPastedCode(e.target.value);
              setError(null);
            }}
            className={error ? "border-destructive" : ""}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button onClick={handlePaste} className="w-full" disabled={!pastedCode.trim() || !!error}>
            Verify Code
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="link" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="link-input">Paste Verification Link</Label>
          <Input
            id="link-input"
            placeholder="e.g., https://relique.ch/verify?code=RLQ-QUAL-001"
            value={pastedCode}
            onChange={(e) => {
              setPastedCode(e.target.value);
              setError(null);
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              handleLinkPaste(pasted);
            }}
            className={error ? "border-destructive" : ""}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Paste a verification link or URL containing a product code
          </p>
        </div>
        <Button onClick={() => handleLinkPaste(pastedCode)} className="w-full" disabled={!pastedCode.trim() || !!error}>
          Extract & Verify
        </Button>
      </TabsContent>
    </Tabs>
  );
}

