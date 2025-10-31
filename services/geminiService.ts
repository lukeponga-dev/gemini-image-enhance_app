import { GoogleGenAI, Modality } from "@google/genai";

// This check is for robustness, assuming process.env.API_KEY is populated by the environment.
if (!process.env.API_KEY) {
  // In a real app, you might want to show a message to the user or disable functionality.
  // For this context, we will throw an error during development if the key is missing.
  console.warn("API_KEY environment variable not set. App will not function correctly.");
}

export const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });


/**
 * Edits an image using a text prompt.
 * @param prompt The text prompt describing the edit.
 * @param imageBase64 The base64 encoded string of the image.
 * @param mimeType The MIME type of the image.
 * @returns A promise that resolves to the base64 string of the edited image.
 */
export const editImage = async (
  prompt: string,
  imageBase64: string,
  mimeType: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
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
      config: {
        responseModalities: [Modality.IMAGE],
      },
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
 * Generates an image from a text prompt.
 * @param prompt The text prompt describing the image to generate.
 * @param aspectRatio The desired aspect ratio for the image.
 * @returns A promise that resolves to the base64 string of the generated image.
 */
export const generateImage = async (
  prompt: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return base64ImageBytes;
    }
    
    throw new Error("No images were generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. The model may not have been able to fulfill the request.");
  }
};

// FIX: Add getProResponse function for complex text generation.
/**
 * Generates a response from the pro model for complex queries.
 * @param prompt The text prompt for the model.
 * @returns A promise that resolves to the model's text response.
 */
export const getProResponse = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error getting pro response:", error);
    throw new Error("Failed to get response from pro model. The model may not have been able to fulfill the request.");
  }
};

/**
 * Applies the style of one image to the content of another.
 * @param contentImageBase64 Base64 of the content image.
 * @param contentMimeType Mime type of the content image.
 * @param styleImageBase64 Base64 of the style image.
 * @param styleMimeType Mime type of the style image.
 * @returns A promise that resolves to the base64 string of the new image.
 */
export const transferStyle = async (
  contentImageBase64: string,
  contentMimeType: string,
  styleImageBase64: string,
  styleMimeType: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: contentImageBase64, mimeType: contentMimeType } },
          { inlineData: { data: styleImageBase64, mimeType: styleMimeType } },
          { text: 'Apply the artistic style of the second image to the content of the first image.' },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
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

/**
 * Upscales a low-resolution image.
 * @param imageBase64 The base64 encoded string of the image.
 * @param mimeType The MIME type of the image.
 * @param factor The upscaling factor (e.g., 2, 4, 8).
 * @returns A promise that resolves to the base64 string of the upscaled image.
 */
export const upscaleImage = async (
  imageBase64: string,
  mimeType: string,
  factor: number
): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: mimeType } },
          { text: `Upscale this image by ${factor}x, enhancing details, improving clarity, and increasing the resolution significantly. Make it look like a high-quality photograph.` },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
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
 * @param imageBase64 The base64 encoded string of the image.
 * @param mimeType The MIME type of the image.
 * @returns A promise that resolves to the base64 string of the color-corrected image.
 */
export const correctColors = async (
  imageBase64: string,
  mimeType: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: mimeType } },
          { text: "Automatically correct the colors of this image. Adjust brightness, contrast, saturation, and white balance to make the colors look natural and vibrant. Do not crop or change the composition." },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
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