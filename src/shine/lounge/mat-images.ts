export interface MatImage {
  src: string;
  alt: string;
  description: string;
}

export const matImages: MatImage[] = [
  {
    src: "https://images.metmuseum.org/CRDImages/eg/original/DT1567.jpg",
    alt: "Ancient Egyptian reed mat",
    description: "Reed mat from the tomb of Queen Hetepheres I, ca. 2600 B.C."
  },
  {
    src: "https://images.metmuseum.org/CRDImages/as/original/DP122662.jpg",
    alt: "Tatami mat diagram from Edo period",
    description: "Illustration detailing traditional tatami mat arrangement."
  },
  {
    src: "https://images.metmuseum.org/CRDImages/ao/original/DT1234.jpg",
    alt: "Navajo woven mat",
    description: "19th-century Navajo mat with intricate geometric patterns."
  }
];
