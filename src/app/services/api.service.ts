import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Respuesta del chat (texto inmediato)
export interface ChatResponse {
  respuesta: string;
  audio: string | null; // Vendrá null al principio
}

// Respuesta del audio (cuando se pide explícitamente)
export interface AudioResponse {
  audio: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  // Define tu URL base para no repetirla
  private baseUrl = 'http://127.0.0.1:8000';

  /**
   * 1. Enviar mensaje al Chat (RAG + Gemini)
   * Esto NO gasta créditos de ElevenLabs.
   */
  sendMessage(mensajeUsuario: string): Observable<ChatResponse> {
    const body = { texto: mensajeUsuario };
    return this.http.post<ChatResponse>(`${this.baseUrl}/chat`, body);
  }

  /**
   * 2. Generar Audio bajo demanda
   * Llama a este método SOLO cuando el usuario haga clic en el icono de altavoz.
   * Esto SÍ gasta créditos.
   */
  generateAudio(textoParaAudio: string): Observable<AudioResponse> {
    const body = { texto: textoParaAudio };
    return this.http.post<AudioResponse>(`${this.baseUrl}/text-to-speech`, body);
  }
}
