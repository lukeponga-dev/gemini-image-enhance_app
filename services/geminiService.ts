import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// This check is for robustness, assuming process.env.API_KEY is populated by the environment.
if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. App will not function correctly.");
}

export const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Edits an image using a text prompt.
 */
export const editImage = async (
  prompt: string,
  imageBase64: string,
  mimeType: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      // responseModalities: [Modality.IMAGE], // Deprecated, model infers modality
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data found in the response.");

  } catch (error) {
    console.error("Error editing image:", error);
    throw new Error("Failed to edit image. The model may not have been able to fulfill the request.");
  }
};

/**
 * Generates an image from a text prompt using Nano Banana Pro (Gemini 3 Pro Image Preview).
 */
export const generateImage = async (
  prompt: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9", // Adjusted supported aspect ratios
  imageSize: "1K" | "2K" | "4K"
): Promise<string> => {
  try {
    const ai = getAiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: imageSize,
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      // Find the image part, do not assume it is the first part.
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No images were generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image.");
  }
};

/**
 * Generates a video from a text prompt using Veo 3.
 */
export const generateVideo = async (
    prompt: string,
    aspectRatio: "16:9" | "9:16"
  ): Promise<string> => {
    try {
      const ai = getAiClient();
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: aspectRatio,
        }
      });
  
      // Polling
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5s interval
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }
  
      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!videoUri) throw new Error("No video URI returned.");
      
      // Fetch video bytes. Key must be appended manually for the download link.
      const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      
      // Convert blob to base64 data URL for display
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
  
    } catch (error) {
      console.error("Error generating video:", error);
      throw new Error("Failed to generate video.");
    }
};

/**
 * Analyzes media (image or video) using Gemini 3 Pro Preview.
 */
export const analyzeMedia = async (
    prompt: string,
    mediaData: string,
    mimeType: string
): Promise<string> => {
    try {
        const ai = getAiClient();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { data: mediaData, mimeType: mimeType } },
                    { text: prompt || "Analyze this content." }
                ]
            }
        });
        return response.text || "No analysis generated.";
    } catch (error) {
        console.error("Error analyzing media:", error);
        throw new Error("Failed to analyze media.");
    }
}

/**
 * Generates a response from the pro model for complex queries with Thinking Mode.
 */
export const getProResponse = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Error getting pro response:", error);
    throw new Error("Failed to get response from pro model.");
  }
};

/**
 * Applies the style of one image to the content of another.
 */
export const transferStyle = async (
  contentImageBase64: string,
  contentMimeType: string,
  styleImageBase64: string,
  styleMimeType: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: contentImageBase64, mimeType: contentMimeType } },
          { inlineData: { data: styleImageBase64, mimeType: styleMimeType } },
          { text: 'Apply the artistic style of the second image to the content of the first image.' },
        ],
      },
      // responseModalities: [Modality.IMAGE], // Deprecated, model infers modality
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data found in the response for style transfer.");
  } catch (error) {
    console.error("Error in style transfer:", error);
    throw new Error("Failed to perform style transfer.");
  }
};

export type UpscaleStyle = 'balanced' | 'gentle' | 'ultra';

/**
 * Upscales a low-resolution image.
 */
export const upscaleImage = async (
  imageBase64: string,
  mimeType: string,
  factor: number,
  style: UpscaleStyle = 'balanced'
): Promise<string> => {
  try {
    const ai = getAiClient();
    let prompt: string;

    switch (style) {
      case 'gentle':
        prompt = `Gently upscale this image by ${factor}x. Enhance details subtly, preserve natural textures, and improve clarity without over-sharpening. The result should be smooth and clean, prioritizing a natural look.`;
        break;
      case 'ultra':
        prompt = `Upscale this image by ${factor}x with maximum detail enhancement. Generate photorealistic textures and ultra-sharp focus. This is for high-end, professional quality results. Reconstruct fine details meticulously.`;
        break;
      case 'balanced':
      default:
        prompt = `Upscale this image by ${factor}x, enhancing details, improving clarity, and increasing the resolution significantly. Make it look like a high-quality photograph with a balanced approach to sharpness and naturalism.`;
        break;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      // responseModalities: [Modality.IMAGE], // Deprecated, model infers modality
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data found in the upscaling response.");
  } catch (error) {
    console.error("Error upscaling image:", error);
    throw new Error("Failed to upscale image.");
  }
};

/**
 * Automatically corrects the colors of an image.
 */
export const correctColors = async (
  imageBase64: string,
  mimeType: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: mimeType } },
          { text: "Automatically correct the colors of this image. Adjust brightness, contrast, saturation, and white balance to make the colors look natural and vibrant. Do not crop or change the composition." },
        ],
      },
      // responseModalities: [Modality.IMAGE], // Deprecated, model infers modality
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data found in the color correction response.");
  } catch (error) {
    console.error("Error correcting colors:", error);
    throw new Error("Failed to correct colors.");
  }
};