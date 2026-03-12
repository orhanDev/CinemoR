
const hallImages = {
  'IMAX': '/images/halls/imax.jpg',
  '4DX': '/images/halls/4dx.jpg',
  'GOLD CLASS': '/images/halls/gold-class.jpg',
  'SCREENX': '/images/halls/screenx.jpg',
  'STARIUM': '/images/halls/starium.jpg',
  'TEMPUR CINEMA': '/images/halls/tempur.jpg',
  'D-BOX': '/images/halls/dbox.jpg',
  'SKYBOX': '/images/halls/skybox.jpg',
  'SKY AUDITORIUM': '/images/halls/sky-auditorium.jpg',
  'PREMIUM CINEMA': '/images/halls/premium.jpg',
  'MPX': '/images/halls/mpx.jpg'
};

const defaultHallImage = '/images/halls/default-hall.jpg';

export const getHallImage = (hallName) => {
  return hallImages[hallName] || defaultHallImage;
};