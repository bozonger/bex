export interface LoginCredentials{
    username: string;
    password: string;
}

export interface Wochenbericht {
  fileName?: string; 
  KalenderWoche: string;
  Jahr: string;
  Bericht: string;
}