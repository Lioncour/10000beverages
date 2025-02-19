export async function updateFavicon(imageUrl: string) {
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = imageUrl;
  document.getElementsByTagName('head')[0].appendChild(link);
} 