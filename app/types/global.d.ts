// Estensione dei tipi di React per compatibilità
import * as React from 'react';

declare global {
  namespace React {
    // Aggiungi qui eventuali tipi mancanti
  }
}

// Esporta i tipi di React per renderli disponibili in tutta l'applicazione
export type ReactNode = React.ReactNode;
export type FormEvent = React.FormEvent;
export type MouseEvent = React.MouseEvent;
