const makeFont = (fontFamily) => () => ({
  className: '',
  variable: '',
  style: { fontFamily },
})

export const Inter = makeFont('Inter, sans-serif')
export const Poppins = makeFont('Poppins, sans-serif')
export const Manrope = makeFont('Manrope, sans-serif')
export const Montserrat = makeFont('Montserrat, sans-serif')
export const Outfit = makeFont('Outfit, sans-serif')
export const Sora = makeFont('Sora, sans-serif')
export const Urbanist = makeFont('Urbanist, sans-serif')
export const Raleway = makeFont('Raleway, sans-serif')
export const DM_Sans = makeFont('DM Sans, sans-serif')
export const Plus_Jakarta_Sans = makeFont('Plus Jakarta Sans, sans-serif')
export const Space_Grotesk = makeFont('Space Grotesk, sans-serif')
export const Open_Sans = makeFont('Open Sans, sans-serif')
export const Roboto = makeFont('Roboto, sans-serif')
export const Lato = makeFont('Lato, sans-serif')
export const Nunito = makeFont('Nunito, sans-serif')
export const Merriweather = makeFont('Merriweather, serif')
export const Playfair_Display = makeFont('Playfair Display, serif')
export const Bebas_Neue = makeFont('Bebas Neue, sans-serif')

export default {
  Inter,
  Poppins,
  Manrope,
  Montserrat,
  Outfit,
  Sora,
  Urbanist,
  Raleway,
  DM_Sans,
  Plus_Jakarta_Sans,
  Space_Grotesk,
  Open_Sans,
  Roboto,
  Lato,
  Nunito,
  Merriweather,
  Playfair_Display,
  Bebas_Neue,
}