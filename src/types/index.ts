export interface CellGroup {
    id: string;
    leaderName: string;
    leaderPhone: string;
    type: "Niños" | "Jóvenes" | "Adultos" | "Online";
    day: string;
    time: string;
    address: string;
    neighborhood: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    distance?: number;
}

export const CELL_TYPES = ["Niños", "Jóvenes", "Adultos", "Online"] as const;
