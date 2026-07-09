const IMAGE_MAP = {
  cafe: {
    hero: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80'],
  },
  restaurant: {
    hero: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'],
  },
  hotel: {
    hero: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'],
  },
  gym: {
    hero: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80'],
  },
  salon: {
    hero: ['https://images.unsplash.com/photo-1560869713-7d0a29430803?w=1920&q=80', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1633681926028-ee50ba5f2f7b?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80'],
  },
  default: {
    hero: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
  },
};

function resolveIndustry(category) {
  if (!category) return 'default';
  const k = category.toLowerCase().trim();
  if (IMAGE_MAP[k]) return k;
  if (k.includes('cafe') || k.includes('coffee')) return 'cafe';
  if (k.includes('restaurant') || k.includes('food')) return 'restaurant';
  if (k.includes('hotel') || k.includes('resort')) return 'hotel';
  if (k.includes('gym') || k.includes('fitness')) return 'gym';
  if (k.includes('salon') || k.includes('spa') || k.includes('beauty')) return 'salon';
  if (k.includes('hospital') || k.includes('health')) return 'hospital';
  if (k.includes('clinic') || k.includes('medical')) return 'default';
  if (k.includes('law') || k.includes('legal')) return 'default';
  if (k.includes('construct') || k.includes('builder')) return 'default';
  if (k.includes('real estate') || k.includes('property')) return 'default';
  if (k.includes('photo') || k.includes('photography')) return 'default';
  if (k.includes('travel') || k.includes('tour')) return 'default';
  if (k.includes('school') || k.includes('edu')) return 'default';
  if (k.includes('coach') || k.includes('tutor')) return 'default';
  if (k.includes('digital') || k.includes('agency') || k.includes('tech') || k.includes('software') || k.includes('startup')) return 'default';
  return 'default';
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class ImageService {
  getImages(category) {
    const key = resolveIndustry(category);
    return IMAGE_MAP[key] || IMAGE_MAP.default;
  }

  getHeroImage(category) {
    const images = this.getImages(category);
    return pick(images.hero) || IMAGE_MAP.default.hero[0];
  }

  getAboutImage(category) {
    const images = this.getImages(category);
    return pick(images.about) || IMAGE_MAP.default.about[0];
  }

  getGalleryImages(category, count = 6) {
    const images = this.getImages(category);
    const shuffled = [...images.gallery].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}
