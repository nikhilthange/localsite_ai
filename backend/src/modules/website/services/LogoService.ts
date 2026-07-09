const LOGO_STYLE_PROMPTS: Record<string, string> = {
  emblem: 'An elegant emblem-style logo with decorative border and classic typography, suitable for a prestigious brand',
  wordmark: 'A clean wordmark logo with custom typography, modern and professional',
  'wordmark-bold': 'A bold, impactful wordmark logo with heavy typography and strong presence',
  script: 'An elegant script-style logo with flowing, handwritten calligraphy, luxurious and sophisticated',
  minimal: 'A minimalist modern logo with clean lines, simple geometry, and contemporary aesthetic',
  abstract: 'An abstract mark logo with geometric shapes and modern design language',
  mascot: 'A friendly mascot logo with character design, approachable and memorable',
  lettermark: 'A lettermark logo featuring stylized initials, monogram-style design',
};

function getLogoPrompt(businessName: string, industry: string, primaryColor: string, logoStyle: string): string {
  const styleDesc = LOGO_STYLE_PROMPTS[logoStyle] || LOGO_STYLE_PROMPTS.wordmark;
  return `Create a professional ${industry} logo for "${businessName}". ${styleDesc}. Primary color: ${primaryColor}. The design should be clean, scalable, and suitable for both web and print. Vector style, flat design, transparent background, high quality, professional branding.`;
}

function getFaviconPrompt(businessName: string, industry: string, primaryColor: string): string {
  return `Create a simple, recognizable favicon for "${businessName}" a ${industry} business. Use color ${primaryColor}. Simple icon style, minimal detail, 64x64 pixels, transparent background, flat design.`;
}

export class LogoService {
  getLogoPrompt(businessName: string, industry: string, primaryColor: string, logoStyle: string = 'wordmark'): string {
    return getLogoPrompt(businessName, industry, primaryColor, logoStyle);
  }

  getFaviconPrompt(businessName: string, industry: string, primaryColor: string): string {
    return getFaviconPrompt(businessName, industry, primaryColor);
  }

  regenerateLogoPrompt(currentPrompt: string, feedback?: string): string {
    if (feedback) {
      return `${currentPrompt}. ${feedback}`;
    }
    return currentPrompt;
  }

  getLogoStyles(): Record<string, string> {
    return { ...LOGO_STYLE_PROMPTS };
  }
}
