import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";

export function useAuth() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, authenticated, login, logout, getAccessToken } = usePrivy();
  const [userProcessed, setUserProcessed] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Fonction pour gérer l'authentification utilisateur côté backend
  const handleUserAuthenticated = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const userId = user?.id;
      const username =
        user?.farcaster?.username ||
        user?.github?.username ||
        user?.twitter?.username ||
        null;

      if (!token || !userId || !username) {
        console.error("Missing data:", { token: !!token, userId, username });
        return;
      }

      const userData = {
        privyUserId: userId,
        name: username
      };

      try {
        // Essayer d'abord l'API backend externe
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth`;
        
        // Si nous sommes en développement et que l'API externe échoue, utiliser l'API locale
        let response;
        try {
          response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(userData)
          });
        } catch (error) {
          console.log("API externe non disponible, utilisation de l'API locale", error instanceof Error ? error.message : 'Erreur inconnue');
          // Utiliser l'API locale de Next.js en cas d'erreur
          response = await fetch(`/api/auth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(userData)
          });
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`API Warning (${response.status}): ${errorText}`);
          console.info("L'authentification côté backend a échoué, mais l'authentification frontend reste valide");
        } else {
          const data = await response.json();
          console.log("User authenticated successfully:", data.user);
        }
      } catch (apiError) {
        // Gestion silencieuse des erreurs de connexion au backend
        console.warn("Impossible de contacter le backend. L'authentification fonctionne en mode frontend uniquement.");
        console.debug("Détail de l'erreur API:", apiError);
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error("Authentication error:", error.message);
      } else {
        console.error("Unknown error:", error);
      }
    }
  }, [user, getAccessToken]);

  useEffect(() => {
    const initUser = async () => {
      if (authenticated && user) {
        const username = user.twitter?.username || user.farcaster?.username || user.github?.username;
        
        if (!username) {
          console.log("Attente des données utilisateur...");
          return;
        }

        if (!userProcessed) {
          handleUserAuthenticated();
          setUserProcessed(true);
        }
      }
    };

    initUser();
  }, [authenticated, user, userProcessed, handleUserAuthenticated]);

  return {
    user,
    authenticated,
    login,
    logout,
    isInitialized
  };
} 