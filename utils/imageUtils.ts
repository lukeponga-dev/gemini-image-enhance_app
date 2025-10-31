export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const [, base64Data] = result.split(',', 2);
        resolve({ base64: base64Data, mimeType: file.type });
      };
      reader.onerror = (error) => reject(error);
    });
  };