"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Scale,
  MapPin,
  RefreshCw,
  Edit3,
  Calendar,
  Trash2,
  Plus,
  Loader2,
  Check,
  X
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HouseholdNav } from "@/components/household/household-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { storageApi } from "@/lib/api/storage";
import { aiApi, MaterialAnalysisResult } from "@/lib/api/ai";
import { listingsApi } from "@/lib/api/listings";
import { pickupsApi } from "@/lib/api/pickups";
import { addressesApi, AddressItem } from "@/lib/api/addresses";

type FlowStep = "PHOTO" | "MATERIAL" | "QUANTITY" | "LOCATION" | "SCHEDULE" | "REVIEW";

interface PhotoItem {
  file?: File;
  previewUrl: string;
  uploadedUrl?: string;
}

export default function CreateListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const [step, setStep] = useState<FlowStep>("PHOTO");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingMatrix, setPricingMatrix] = useState<Record<string, any>>({});
  const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Form State
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [materialQuery, setMaterialQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [selectedMaterial, setSelectedMaterial] = useState("PET Plastic");
  const [selectedCategory, setSelectedCategory] = useState("Plastic");
  const [aiSuggestion, setAiSuggestion] = useState<MaterialAnalysisResult | null>(null);
  const [useAISuggestion, setUseAISuggestion] = useState(false);

  const [quantity, setQuantity] = useState<number>(5.0);
  const [unit, setUnit] = useState<string>("kg");
  const [expectedRate, setExpectedRate] = useState<number>(30);
  const [quality, setQuality] = useState<string>("Clean / Sorted");

  // Geolocation & Address
  const [isLocating, setIsLocating] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<any>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  // Manual Address Fields
  const [addressLabel, setAddressLabel] = useState("Home");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [zipCode, setZipCode] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<AddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [useSavedAddress, setUseSavedAddress] = useState(true);

  // Preferred Slot
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  // Fetch standard pricing & saved addresses on mount
  useEffect(() => {
    // 1. Fetch backend pricing matrix
    listingsApi.getMaterials()
      .then((res) => {
        setPricingMatrix(res);
      })
      .catch((err) => {
        console.error("Failed to load backend rates, using static fallback:", err);
      });

    // 2. Fetch saved addresses
    addressesApi.getAddresses()
      .then((addrs) => {
        setSavedAddresses(addrs);
        const def = addrs.find((a) => a.is_default);
        if (def) setSelectedAddressId(def.id);
        else if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
      })
      .catch(() => { });
  }, []);

  // Sync expected rate when material changes
  useEffect(() => {
    const rateInfo = pricingMatrix[selectedMaterial];
    if (rateInfo) {
      setExpectedRate(rateInfo.rate);
    }
  }, [selectedMaterial, pricingMatrix]);

  // Fetch slots when arriving at schedule step
  useEffect(() => {
    if (step === "SCHEDULE") {
      setIsLoadingSlots(true);
      pickupsApi.getAvailableSlots()
        .then((res) => {
          setAvailableSlots(res);
          const dates = Object.keys(res);
          if (dates.length > 0) {
            setSelectedDate(dates[0]);
            if (res[dates[0]].length > 0) {
              setSelectedTimeSlot(res[dates[0]][0]);
            }
          }
        })
        .catch((err) => {
          toast("Failed to fetch available collection slots.", "error");
        })
        .finally(() => {
          setIsLoadingSlots(false);
        });
    }
  }, [step, toast]);

  // Handle autocomplete suggestions
  useEffect(() => {
    if (!materialQuery) {
      setSuggestions([]);
      return;
    }
    const matches = Object.keys(pricingMatrix).filter(m =>
      m.toLowerCase().includes(materialQuery.toLowerCase())
    );
    setSuggestions(matches);
  }, [materialQuery, pricingMatrix]);

  // Dynamic values calculation
  const getEstimatedPayoutRange = () => {
    const total = expectedRate * quantity;
    return {
      rate: expectedRate,
      estimatedMin: Math.round(total * 0.9),
      estimatedMax: Math.round(total * 1.15),
      unit: pricingMatrix[selectedMaterial]?.unit || "unit"
    };
  };

  // Browser Camera Feed
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setShowCamera(true);
      }
    } catch (err: any) {
      console.error(err);
      toast("Unable to open webcam stream. Opening standard file capture instead.", "error");
      // Fallback: trigger native camera file input
      cameraInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
            const previewUrl = URL.createObjectURL(file);
            setPhotos(prev => [...prev, { file, previewUrl }]);
            toast("Photo captured successfully!", "success");
          }
        }, "image/jpeg", 0.85);
      }
      stopCamera();
    }
  };

  // Upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 8 * 1024 * 1024) {
        toast(`File ${file.name} exceeds 8MB size limit.`, "error");
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      setPhotos(prev => [...prev, { file, previewUrl }]);
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePhotoUploadAndProcess = async () => {
    if (photos.length === 0) {
      toast("Please capture or upload at least one photo.", "error");
      return;
    }

    setIsProcessing(true);
    toast("Uploading scrap media to cloud...", "info");

    try {
      const uploadedPhotos = [...photos];
      // Upload photos in series
      for (let i = 0; i < uploadedPhotos.length; i++) {
        const p = uploadedPhotos[i];
        if (p.file && !p.uploadedUrl) {
          const res = await storageApi.uploadImage(p.file);
          uploadedPhotos[i].uploadedUrl = res.url;
        }
      }
      setPhotos(uploadedPhotos);

      const firstUrl = uploadedPhotos[0].uploadedUrl;
      if (firstUrl) {
        toast("Identifying material using AI models...", "info");
        const analysis = await aiApi.analyzeMaterial(firstUrl);
        setAiSuggestion(analysis);
        setSelectedMaterial(analysis.material);
        setSelectedCategory(analysis.category);
        setUseAISuggestion(true);
        toast(`AI identified ${analysis.material} (${analysis.category})!`, "success");
      }

      setStep("MATERIAL");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Media process failed. Proceeding with manual input.", "error");
      setStep("MATERIAL");
    } finally {
      setIsProcessing(false);
    }
  };

  // HTML5 Browser Geolocation API
  const handleGPSDetect = () => {
    setIsLocating(true);
    setLocationPermissionDenied(false);

    if (!navigator.geolocation) {
      toast("Geolocation is not supported by your browser.", "error");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          toast("Resolving coordinates to address...", "info");
          const addressData = await addressesApi.reverseGeocode(latitude, longitude);
          setDetectedAddress(addressData);
          setStreetAddress(addressData.street_address);
          setCity(addressData.city);
          setState(addressData.state);
          setZipCode(addressData.postal_code);
          toast("Location detected successfully!", "success");
        } catch (err) {
          toast("Could not reverse-geocode. Please enter address details manually.", "error");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error(err);
        setLocationPermissionDenied(true);
        setIsLocating(false);
        toast("Location permission denied. Please enter address manually.", "error");
      },
      { timeout: 8000 }
    );
  };

  // Form submits / API calls
  const handleSubmitListingFlow = async () => {
    setIsSubmitting(true);
    toast("Creating listing and booking collection route...", "info");

    try {
      let finalAddressId = selectedAddressId;

      // 1. Create Address if manual / detected and not using saved
      if (!useSavedAddress || savedAddresses.length === 0) {
        if (!streetAddress || !zipCode) {
          throw new Error("Please provide street address and postal code.");
        }
        const newAddress = await addressesApi.createAddress({
          label: addressLabel,
          street_address: streetAddress,
          city,
          state,
          postal_code: zipCode,
          contact_phone: contactPhone || undefined,
          is_default: savedAddresses.length === 0,
          latitude: detectedAddress?.latitude,
          longitude: detectedAddress?.longitude
        });
        finalAddressId = newAddress.id;
      }

      // 2. Submit Listing to database
      const mediaUrls = photos.map(p => p.uploadedUrl).filter(Boolean) as string[];
      const payoutVal = getEstimatedPayoutRange();
      const priceRangeStr = `₹${payoutVal.estimatedMin} - ₹${payoutVal.estimatedMax}`;

      const listing = await listingsApi.createListing({
        material: selectedMaterial,
        category: selectedCategory,
        title: `${quality} ${selectedMaterial}`,
        description: `Segregated doorstep scrap collection for ${selectedMaterial}. Quality: ${quality}.`,
        images: mediaUrls,
        quantity,
        unit,
        quality,
        estimated_price: expectedRate * quantity,
        estimated_price_range: priceRangeStr,
        location: detectedAddress ? {
          latitude: detectedAddress.latitude,
          longitude: detectedAddress.longitude,
          address: streetAddress
        } : undefined
      });

      // 3. Create Doorstep Pickup Request
      await pickupsApi.createPickup({
        listing_id: listing.id,
        address_id: finalAddressId,
        preferred_time: `${selectedDate} ${selectedTimeSlot}`,
        notes: `Expected doorstep rate target: ₹${expectedRate}/${unit}. Quality: ${quality}.`
      });

      toast("Doorstep collection scheduled successfully!", "success");
      router.push("/individual/household/pickups");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to schedule collection. Please check details.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMaterialsForCategory = () => {
    return Object.keys(pricingMatrix).filter(m =>
      pricingMatrix[m].category === selectedCategory
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-slate-900 flex flex-col justify-between">
      <Navbar />
      <HouseholdNav />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">List Scrap & Book Doorstep Collection</h1>
            <p className="text-xs text-slate-500 mt-0.5"> calib_scale_id: CPCB-M-9022 </p>
          </div>
          <Badge variant="brand" className="bg-[#0F766E] text-white text-xs px-2 py-0.5">Standard mandi pricing</Badge>
        </div>

        {/* --- STEP 1: PHOTO --- */}
        {step === "PHOTO" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">Step 1: Capture or Upload Scrap Photos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                {showCamera ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-black flex flex-col items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <div className="absolute bottom-4 flex gap-3">
                      <Button onClick={capturePhoto} className="bg-[#0F766E] hover:bg-[#115E59] text-white px-4 py-2 text-xs font-bold">Capture Snap</Button>
                      <Button onClick={stopCamera} variant="outline" className="bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 px-4 py-2 text-xs font-bold">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={startCamera}
                      className="border-2 border-dashed border-slate-300 hover:border-[#0F766E] hover:bg-teal-50/10 rounded-xl p-8 transition flex flex-col items-center justify-center gap-2"
                    >
                      <div className="h-10 w-10 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center">
                        <Camera className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-950">Take Photo</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-[#0F766E] hover:bg-teal-50/10 rounded-xl p-8 transition flex flex-col items-center justify-center gap-2"
                    >
                      <div className="h-10 w-10 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center">
                        <Upload className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-950">Upload Photos</span>
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                />

                {/* Previews grid */}
                {photos.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-slate-700">Selected Photos ({photos.length})</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {photos.map((p, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                          <img src={p.previewUrl} alt={`Scrap preview ${idx + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-dashed border-slate-300 rounded-lg hover:border-[#0F766E] hover:bg-teal-50/10 flex flex-col items-center justify-center gap-1 aspect-square transition text-slate-400 hover:text-[#0F766E]"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-[10px] font-bold">Add More</span>
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between bg-slate-50/50 border-t border-slate-100 p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep("MATERIAL")}
                  className="border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  Skip to Manual Entry
                </Button>

                <Button
                  onClick={handlePhotoUploadAndProcess}
                  disabled={photos.length === 0 || isProcessing}
                  className="bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Analyze & Continue
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* --- STEP 2: MATERIAL IDENTIFICATION --- */}
        {step === "MATERIAL" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">Step 2: Material Identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                {aiSuggestion && (
                  <div className="p-3.5 rounded-lg border border-teal-200 bg-teal-50/30 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#0F766E] animate-pulse" />
                      <div>
                        <span className="font-bold text-slate-900 block">Gemini suggests: {aiSuggestion.material}</span>
                        <span className="text-slate-500 text-[11px]">Confidence score: {Math.round(aiSuggestion.confidence * 100)}%</span>
                      </div>
                    </div>
                    {useAISuggestion ? (
                      <Badge variant="success">Using AI Selection</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedMaterial(aiSuggestion.material);
                          setSelectedCategory(aiSuggestion.category);
                          setUseAISuggestion(true);
                        }}
                        className="bg-[#0F766E] text-white hover:bg-[#115E59] text-[10px] px-2.5 py-1"
                      >
                        Apply AI selection
                      </Button>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">What material are you listing?</label>
                  <div className="relative">
                    <Input
                      placeholder="Type material name (e.g. Cardboard box, PET bottles)"
                      value={materialQuery}
                      onChange={(e) => {
                        setMaterialQuery(e.target.value);
                        setUseAISuggestion(false);
                      }}
                      className="w-full text-xs"
                    />

                    {suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto text-xs">
                        {suggestions.map((s) => (
                          <div
                            key={s}
                            onClick={() => {
                              setSelectedMaterial(s);
                              setSelectedCategory(pricingMatrix[s].category);
                              setMaterialQuery("");
                              setSuggestions([]);
                            }}
                            className="p-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                          >
                            {s} ({pricingMatrix[s].category})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Category Filter</label>
                  <div className="flex flex-wrap gap-2">
                    {["Plastic", "Paper", "Metal", "Glass", "E-Waste", "Other"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setUseAISuggestion(false);
                          const mats = Object.keys(pricingMatrix).filter(m => pricingMatrix[m].category === cat);
                          if (mats.length > 0) setSelectedMaterial(mats[0]);
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${selectedCategory === cat
                            ? "border-[#0F766E] bg-teal-50/20 text-[#0F766E]"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Selected Classification</label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => {
                      setSelectedMaterial(e.target.value);
                      setSelectedCategory(pricingMatrix[e.target.value]?.category || "Other");
                    }}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] font-semibold"
                  >
                    {getMaterialsForCategory().map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-slate-50/50 border-t border-slate-100 p-4">
                <Button variant="outline" onClick={() => setStep("PHOTO")} className="border-slate-200 text-xs font-semibold">Back</Button>
                <Button onClick={() => setStep("QUANTITY")} className="bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5">
                  Next Step
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* --- STEP 3: QUANTITY & CUSTOM EXPECTED RATE --- */}
        {step === "QUANTITY" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">Step 3: Weight, Price, & Condition Specs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Estimated Quantity</label>
                    <Input
                      type="number"
                      min={0.1}
                      step={0.5}
                      value={quantity}
                      onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                      className="w-full text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Unit</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] font-semibold"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="grams">Grams (g)</option>
                      <option value="pieces">Pieces</option>
                      <option value="bags">Bags</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Expected Rate (₹ per {unit})</label>
                    <Input
                      type="number"
                      min={0}
                      value={expectedRate}
                      onChange={(e) => setExpectedRate(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-semibold text-[#0F766E]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Condition / Quality</label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] font-semibold"
                    >
                      <option value="Clean / Sorted">Clean / Sorted (Segregated, Dry)</option>
                      <option value="Mostly clean">Mostly Clean (Minor sorting needed)</option>
                      <option value="Mixed">Mixed Quality (Unsorted scrap lot)</option>
                      <option value="Damaged / Contaminated">Damaged / Contaminated</option>
                    </select>
                  </div>
                </div>

                {/* dynamic payout estimation */}
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Standard Mandi Benchmark Rate</span>
                    <span className="text-slate-500 font-medium">
                      {pricingMatrix[selectedMaterial] ? `₹${pricingMatrix[selectedMaterial].rate} / ${pricingMatrix[selectedMaterial].unit}` : "No benchmark rate"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-emerald-100/50 pt-2">
                    <span className="text-xs text-slate-600 font-bold">Estimated Payout range (based on expected rate)</span>
                    <span className="text-emerald-800 font-extrabold text-base">
                      ₹{getEstimatedPayoutRange().estimatedMin} - ₹{getEstimatedPayoutRange().estimatedMax}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    *Calibrated digital scales are used at doorstep. Final price is confirmed upon weight inspection.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-slate-50/50 border-t border-slate-100 p-4">
                <Button variant="outline" onClick={() => setStep("MATERIAL")} className="border-slate-200 text-xs font-semibold">Back</Button>
                <Button onClick={() => setStep("LOCATION")} className="bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5">
                  Next Step
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* --- STEP 4: LOCATION / GEOLOCATION --- */}
        {step === "LOCATION" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">Step 4: Geolocation & Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                {savedAddresses.length > 0 && (
                  <div className="my-2 flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setUseSavedAddress(true)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${useSavedAddress
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                      Use Saved Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseSavedAddress(false)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${!useSavedAddress
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                      New Pickup Address
                    </button>
                  </div>
                )}

                {useSavedAddress && savedAddresses.length > 0 ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Select Saved Location</label>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] font-semibold"
                    >
                      {savedAddresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label || "Home"} ({a.street_address}, {a.city})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-3">
                      <Button
                        type="button"
                        onClick={handleGPSDetect}
                        disabled={isLocating}
                        className="bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 w-full justify-center"
                      >
                        {isLocating ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Locating GPS...
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3.5 w-3.5" />
                            Detect Geolocation via GPS
                          </>
                        )}
                      </Button>
                    </div>

                    {locationPermissionDenied && (
                      <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 flex gap-2 text-xs text-amber-800">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Location access is required to suggest nearby pickup availability. Please enter address details manually below.</span>
                      </div>
                    )}

                    {detectedAddress && (
                      <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/20 text-xs space-y-1">
                        <span className="font-bold text-emerald-800 block">Detected coordinates: {detectedAddress.latitude.toFixed(5)}, {detectedAddress.longitude.toFixed(5)}</span>
                        <span className="text-slate-600 block">Address: {detectedAddress.street_address}</span>
                      </div>
                    )}

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">Address Label</label>
                          <Input value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)} className="text-xs" placeholder="e.g. Home, Office" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">Contact Phone</label>
                          <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="text-xs" placeholder="e.g. +91 98200 12345" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">Street Address</label>
                        <Input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} className="text-xs" placeholder="Flat/House No, Building, Road name" />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">City</label>
                          <Input value={city} onChange={(e) => setCity(e.target.value)} className="text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">State</label>
                          <Input value={state} onChange={(e) => setState(e.target.value)} className="text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">PIN Code</label>
                          <Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="text-xs" placeholder="400050" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between bg-slate-50/50 border-t border-slate-100 p-4">
                <Button variant="outline" onClick={() => setStep("QUANTITY")} className="border-slate-200 text-xs font-semibold">Back</Button>
                <Button onClick={() => setStep("SCHEDULE")} className="bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5">
                  Next Step
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* --- STEP 5: PICKUP DETAILS / SCHEDULER --- */}
        {step === "SCHEDULE" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">Step 5: Preferred Pickup Window</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                {isLoadingSlots ? (
                  <div className="py-8 text-center space-y-2">
                    <Loader2 className="h-6 w-6 text-[#0F766E] animate-spin mx-auto" />
                    <p className="text-xs text-slate-500">Loading collector scheduling slots...</p>
                  </div>
                ) : Object.keys(availableSlots).length === 0 ? (
                  <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-800 text-center space-y-1">
                    <AlertCircle className="h-5 w-5 mx-auto mb-1" />
                    <span className="font-bold block">No pickup slots available currently</span>
                    <span>All local route collectors are fully occupied. Please attempt booking again tomorrow morning.</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Preferred Date</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {Object.keys(availableSlots).map((date) => (
                          <button
                            key={date}
                            type="button"
                            onClick={() => {
                              setSelectedDate(date);
                              const slots = availableSlots[date];
                              if (slots.length > 0) setSelectedTimeSlot(slots[0]);
                            }}
                            className={`p-3 rounded-lg border text-center text-xs font-bold transition flex flex-col justify-center gap-1 ${selectedDate === date
                                ? "border-[#0F766E] bg-teal-50/20 text-[#0F766E]"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                          >
                            <Calendar className="h-4 w-4 mx-auto text-[#0F766E]" />
                            {date}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Preferred Time Window</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(availableSlots[selectedDate] || []).map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition flex items-center justify-between ${selectedTimeSlot === slot
                                ? "border-[#0F766E] bg-teal-50/20 text-[#0F766E] font-bold"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                          >
                            <span>{slot}</span>
                            {selectedTimeSlot === slot && <Check className="h-4 w-4 text-[#0F766E]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between bg-slate-50/50 border-t border-slate-100 p-4">
                <Button variant="outline" onClick={() => setStep("LOCATION")} className="border-slate-200 text-xs font-semibold">Back</Button>
                <Button
                  onClick={() => setStep("REVIEW")}
                  disabled={!selectedDate || !selectedTimeSlot}
                  className="bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
                >
                  Review Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* --- STEP 6: REVIEW & SUBMIT --- */}
        {step === "REVIEW" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-1 border-b border-slate-100">
                <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">Review & Confirm Collection</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 divide-y divide-slate-100 text-xs">
                {/* Photos */}
                <div className="pb-3 flex justify-between items-start gap-4">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1.5">Photos</span>
                    {photos.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto max-w-sm">
                        {photos.map((p, i) => (
                          <img key={i} src={p.previewUrl} alt={`Scrap photo ${i + 1}`} className="h-12 w-12 rounded object-cover border border-slate-200" />
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-semibold">No photos uploaded</span>
                    )}
                  </div>
                  <button type="button" onClick={() => setStep("PHOTO")} className="text-teal-700 hover:text-[#115E59] font-bold flex items-center gap-0.5">
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                </div>

                {/* Material Spec */}
                <div className="py-3 flex justify-between items-start gap-4">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-1.5 w-full">
                    <div>
                      <span className="text-slate-400 font-semibold">Material</span>
                      <span className="font-bold text-slate-800 block mt-0.5">{selectedMaterial}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">Category</span>
                      <span className="font-bold text-slate-800 block mt-0.5">{selectedCategory}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">Quantity / Weight</span>
                      <span className="font-bold text-slate-800 block mt-0.5">{quantity} {unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">Expected Rate</span>
                      <span className="font-bold text-[#0F766E] block mt-0.5">₹{expectedRate} / {unit}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setStep("MATERIAL")} className="text-teal-700 hover:text-[#115E59] font-bold flex items-center gap-0.5">
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                </div>

                {/* Geolocation Address */}
                <div className="py-3 flex justify-between items-start gap-4">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Doorstep Pickup Address</span>
                    {useSavedAddress && savedAddresses.length > 0 ? (
                      <span className="font-bold text-slate-800">
                        {savedAddresses.find(a => a.id === selectedAddressId)?.street_address}, {savedAddresses.find(a => a.id === selectedAddressId)?.city}
                      </span>
                    ) : (
                      <span className="font-bold text-slate-800">{streetAddress}, {city}</span>
                    )}
                  </div>
                  <button type="button" onClick={() => setStep("LOCATION")} className="text-teal-700 hover:text-[#115E59] font-bold flex items-center gap-0.5">
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                </div>

                {/* Schedule window */}
                <div className="py-3 flex justify-between items-start gap-4">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Pickup Appointment</span>
                    <span className="font-bold text-slate-800 block">{selectedDate} &bull; {selectedTimeSlot}</span>
                  </div>
                  <button type="button" onClick={() => setStep("SCHEDULE")} className="text-teal-700 hover:text-[#115E59] font-bold flex items-center gap-0.5">
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                </div>

                {/* Price total */}
                <div className="py-3 flex justify-between items-center bg-emerald-50/30 p-3 rounded-xl border border-emerald-100">
                  <div>
                    <span className="text-slate-500 font-bold block">Estimated doorstep settlement payout</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">*Calibrated scale verification</span>
                  </div>
                  <span className="text-[#0F766E] font-extrabold text-base">
                    ₹{getEstimatedPayoutRange().estimatedMin} - ₹{getEstimatedPayoutRange().estimatedMax}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-slate-50/50 border-t border-slate-100 p-4">
                <Button variant="outline" onClick={() => setStep("SCHEDULE")} className="border-slate-200 text-xs font-semibold">Back</Button>
                <Button
                  onClick={handleSubmitListingFlow}
                  isLoading={isSubmitting}
                  className="bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow"
                >
                  Create Pickup Request
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
