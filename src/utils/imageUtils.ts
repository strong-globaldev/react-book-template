export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (imagePaths: string[]): Promise<void> => {
  const promises = imagePaths.map(path => preloadImage(path));
  await Promise.all(promises);
};