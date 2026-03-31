export interface TreasureData {
  id: number
  lat: number
  lng: number
  question: string
}

export const TREASURES: TreasureData[] = [
  { id: 1, lat: -3.871476, lng: -38.611448, question: 'Qual é a capital do Ceará?' },
  { id: 2, lat: -3.872361, lng: -38.612103, question: 'Em que ano o Brasil foi descoberto?' },
  { id: 3, lat: -3.871619, lng: -38.610658, question: 'Qual é o maior estado do Brasil?' },
  { id: 4, lat: -3.872779, lng: -38.611270, question: 'Qual é o rio mais longo do Brasil?' },
]