export interface PropertyOwner {
  id: number;
  nom: string;
  prenom: string;
  whatsapp: string;
}

export interface Property {
  id: number;
  titre: string;
  description: string;
  ville: string;
  commune: string;
  prix: number;
  type: string;
  nombrePieces: number | null;
  surface: number | null;
  status: string;
  createdAt: string;
  owner: PropertyOwner;
}