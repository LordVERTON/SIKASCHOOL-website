"use client";

import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type LiveClassProps = {
  serverUrl: string;
  token: string;
  className?: string;
  onLeavePath?: string;
};

export default function LiveClass({ serverUrl, token, className, onLeavePath }: LiveClassProps) {
  const router = useRouter();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const roomOptions = useMemo(
    () => ({
      video: true,
      audio: true,
    }),
    []
  );

  // Fonction pour rediriger vers le calendrier
  const redirectToCalendar = useCallback(() => {
    if (onLeavePath) {
      window.location.href = onLeavePath;
    } else {
      router.back();
    }
  }, [onLeavePath, router]);

  // Intercepter le bouton Leave de LiveKit
  useEffect(() => {
    const handleLeaveButton = () => {
      // Attendre que les éléments LiveKit soient chargés
      const checkForLeaveButton = () => {
        const leaveButtons = document.querySelectorAll(
          'button[aria-label*="Leave"], button[aria-label*="leave"], button[title*="Leave"], button[title*="leave"], .lk-button[aria-label*="Leave"], .lk-button[aria-label*="leave"]'
        );
        
        leaveButtons.forEach(button => {
          // Supprimer les anciens event listeners
          const newButton = button.cloneNode(true) as HTMLElement;
          button.parentNode?.replaceChild(newButton, button);
          
          // Ajouter le nouvel event listener
          newButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            redirectToCalendar();
          });
        });
      };

      // Vérifier immédiatement
      checkForLeaveButton();
      
      // Observer les changements dans le DOM pour capturer les boutons qui apparaissent plus tard
      const observer = new MutationObserver(() => {
        checkForLeaveButton();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Nettoyer l'observer après 30 secondes pour éviter les fuites mémoire
      setTimeout(() => {
        observer.disconnect();
      }, 30000);
    };

    // Démarrer l'interception après un court délai pour laisser LiveKit se charger
    const timeoutId = setTimeout(handleLeaveButton, 1000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [onLeavePath, router, redirectToCalendar]);

  return (
    <div className={className ?? 'h-screen w-full'}>
      <style jsx global>{`
        /* Masquer tous les boutons d'enregistrement */
        [data-lk-recording-button],
        .lk-button[data-lk-recording-button],
        button[data-lk-recording-button],
        .lk-control-bar button[aria-label*="recording"],
        .lk-control-bar button[aria-label*="enregistrement"],
        .lk-control-bar button[title*="recording"],
        .lk-control-bar button[title*="enregistrement"],
        .lk-control-bar button[aria-label*="record"],
        .lk-control-bar button[title*="record"],
        button[aria-label*="Start recording"],
        button[aria-label*="Stop recording"],
        button[title*="Start recording"],
        button[title*="Stop recording"],
        .lk-button[aria-label*="recording"],
        .lk-button[aria-label*="record"],
        .lk-button[title*="recording"],
        .lk-button[title*="record"] {
          display: none !important;
        }
        
        /* Masquer les indicateurs d'enregistrement */
        .lk-recording-indicator,
        .lk-recording-status,
        [data-lk-recording-status],
        .lk-recording-badge,
        .lk-recording-dot,
        [class*="recording"],
        [class*="record"] {
          display: none !important;
        }
        
        /* Masquer les boutons avec icônes d'enregistrement */
        .lk-control-bar button svg[data-testid*="recording"],
        .lk-control-bar button svg[data-testid*="record"],
        .lk-control-bar button svg path[d*="recording"],
        .lk-control-bar button svg path[d*="record"] {
          display: none !important;
        }
      `}</style>
      {connectionError ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="rounded-lg border border-stroke bg-white p-6 text-center dark:border-strokedark dark:bg-blacksection">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              Erreur de connexion
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              {connectionError}
            </p>
            <button
              onClick={() => {
                setConnectionError(null);
                window.location.reload();
              }}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Réessayer
            </button>
          </div>
        </div>
      ) : (
        <LiveKitRoom
          serverUrl={serverUrl}
          token={token}
          connect
          {...roomOptions}
          data-lk-theme="default"
          onConnected={() => {
            setConnectionError(null);
          }}
                  onDisconnected={(_reason) => {
            // LiveKit disconnected - toujours rediriger vers le calendrier
            redirectToCalendar();
          }}
          onError={(error) => {
            // LiveKit error
            if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
              setConnectionError('Connexion au serveur de visio expirée. Vérifiez votre connexion internet.');
            } else if (error.message?.includes('unauthorized') || error.message?.includes('permission')) {
              setConnectionError('Accès refusé. Vérifiez vos permissions.');
            } else {
              setConnectionError('Erreur de connexion au serveur de visio.');
            }
          }}
        >
          <VideoConference />
        </LiveKitRoom>
      )}
    </div>
  );
}
