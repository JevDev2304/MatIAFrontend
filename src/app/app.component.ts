import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';

interface ChatMessage {
  text: string;
  isUser: boolean;
  audioBase64?: string | null; // Puede ser null al principio
  isLoadingAudio?: boolean;    // 👈 Nuevo: para saber si ese audio específico está cargando
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private apiService = inject(ApiService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  userInput: string = '';
  isLoading: boolean = false;

  messages: ChatMessage[] = [
    {
      text: '¡Hola! 👋 Te doy la bienvenida al perfil interactivo de Juanes. Soy MatIA , tu asistente virtual encargado de proporcionarte detalles sobre su trayectoria en desarrollo, proyectos de IA 🧠 y arquitectura de software. ¿Te gustaría conocer su experiencia laboral 💼, estudios 🎓 o habilidades técnicas? 🚀',
      isUser: false,
      audioBase64: null // No cargamos audio al inicio para ahorrar
    }
  ];

  enviarMensaje() {
    if (!this.userInput.trim()) return;

    const textoEnviado = this.userInput;
    this.messages.push({ text: textoEnviado, isUser: true });
    this.userInput = '';
    this.isLoading = true;
    this.scrollToBottom();

    // 1. Llamada al CHAT (Solo texto, barato/gratis)
    this.apiService.sendMessage(textoEnviado).subscribe({
      next: (response) => {
        this.messages.push({
          text: response.respuesta,
          isUser: false,
          audioBase64: null, // 👈 Viene vacío inicialmente
          isLoadingAudio: false
        });

        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error:', error);
        this.messages.push({ text: 'Error al conectar con el servidor.', isUser: false });
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  // 2. Lógica para reproducir o descargar audio (Consume créditos solo al click)
  playAudio(msg: ChatMessage) {
    // Si ya se está cargando, no hacemos nada
    if (msg.isLoadingAudio) return;

    // A) Si YA tenemos el audio, lo reproducimos directamente
    if (msg.audioBase64) {
      this.reproducirSonido(msg.audioBase64);
      return;
    }

    // B) Si NO tenemos audio, vamos a buscarlo a la API
    msg.isLoadingAudio = true; // Activamos spinner del botón

    this.apiService.generateAudio(msg.text).subscribe({
      next: (response) => {
        // Guardamos el audio en el mensaje para no volver a pedirlo (Caché local)
        msg.audioBase64 = response.audio;
        msg.isLoadingAudio = false;

        // Reproducimos
        this.reproducirSonido(response.audio);
      },
      error: (err) => {
        console.error("Error generando audio", err);
        msg.isLoadingAudio = false;
      }
    });
  }

  // Función auxiliar privada para reproducir
  private reproducirSonido(base64: string) {
    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64}`);
      audio.play().catch(e => console.error("Error play:", e));
    } catch (e) {
      console.error("Error audio:", e);
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
