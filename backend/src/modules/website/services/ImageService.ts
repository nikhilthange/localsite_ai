const INDUSTRY_IMAGES: Record<string, {
  hero: string[];
  about: string[];
  services: string[];
  gallery: string[];
  team: string[];
  portfolio: string[];
}> = {
  cafe: {
    hero: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80', 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&q=80', 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80', 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1603366445787-09714680cbf1?w=400&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80'],
  },
  restaurant: {
    hero: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80', 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=400&q=80', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80'],
  },
  hotel: {
    hero: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=800&q=80', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80', 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80'],
  },
  gym: {
    hero: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80', 'https://images.unsplash.com/photo-1906620852772-8f02e4a0d4e5?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'],
  },
  salon: {
    hero: ['https://images.unsplash.com/photo-1560869713-7d0a29430803?w=1920&q=80', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1633681926028-ee50ba5f2f7b?w=800&q=80', 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80', 'https://images.unsplash.com/photo-1602271947327-57ebc2028637?w=800&q=80', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80'],
  },
  hospital: {
    hero: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80', 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1920&q=80', 'https://images.unsplash.com/photo-1587351021759-3772687fe598?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80', 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80', 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80', 'https://images.unsplash.com/photo-1587351021759-3772687fe598?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80'],
    portfolio: [],
  },
  clinic: {
    hero: ['https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=1920&q=80', 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1920&q=80', 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=800&q=80', 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=800&q=80', 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=800&q=80', 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80', 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80'],
    portfolio: [],
  },
  'law-firm': {
    hero: ['https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=80', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80', 'https://images.unsplash.com/photo-1447968954315-3f0c44f7313c?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=800&q=80', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80', 'https://images.unsplash.com/photo-1447968954315-3f0c44f7313c?w=800&q=80', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80', 'https://images.unsplash.com/photo-1447968954315-3f0c44f7313c?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'],
    portfolio: [],
  },
  construction: {
    hero: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&q=80', 'https://images.unsplash.com/photo-1571632836272-4aa9a5a0e5d3?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80', 'https://images.unsplash.com/photo-1571632836272-4aa9a5a0e5d3?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80', 'https://images.unsplash.com/photo-1571632836272-4aa9a5a0e5d3?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1568454537842-d933259bb258?w=400&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80', 'https://images.unsplash.com/photo-1571632836272-4aa9a5a0e5d3?w=800&q=80'],
  },
  'real-estate': {
    hero: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80', 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'],
  },
  photographer: {
    hero: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80', 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80', 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80', 'https://images.unsplash.com/photo-1520854228256-700e5b0485ce?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80', 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80'],
  },
  'travel-agency': {
    hero: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'],
  },
  school: {
    hero: ['https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=1920&q=80', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&q=80', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80', 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80', 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'],
    portfolio: [],
  },
  'coaching-institute': {
    hero: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&q=80', 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&q=80'],
    portfolio: [],
  },
  'digital-agency': {
    hero: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80'],
    about: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
    services: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'],
    gallery: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'],
    team: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'],
    portfolio: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'],
  },
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

export class ImageService {
  private imageMap: typeof INDUSTRY_IMAGES;

  constructor() {
    this.imageMap = INDUSTRY_IMAGES;
  }

  getImages(industry: string): typeof INDUSTRY_IMAGES[string] {
    return this.imageMap[industry] || this.imageMap['digital-agency'];
  }

  getHeroImage(industry: string): string {
    const images = this.getImages(industry);
    return pick(images.hero) || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80';
  }

  getAboutImage(industry: string): string {
    const images = this.getImages(industry);
    return pick(images.about) || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80';
  }

  getServiceImages(industry: string, count: number = 3): string[] {
    const images = this.getImages(industry);
    return pickN(images.services, count);
  }

  getGalleryImages(industry: string, count: number = 6): string[] {
    const images = this.getImages(industry);
    return pickN(images.gallery, count);
  }

  getTeamImages(industry: string, count: number = 2): string[] {
    const images = this.getImages(industry);
    return pickN(images.team, count);
  }

  getPortfolioImages(industry: string, count: number = 4): string[] {
    const images = this.getImages(industry);
    return pickN(images.portfolio, count);
  }
}
