import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Récupérer les données envoyées par le client
    const userData = await request.json();
    
    // Simuler un stockage ou une vérification des données
    console.log('API - Utilisateur authentifié:', userData);
    
    // Renvoyer une réponse de succès
    return NextResponse.json({ 
      success: true, 
      user: userData,
      message: 'Authentification réussie (API mock)'
    });
  } catch (error) {
    console.error('Erreur lors du traitement de l\'authentification:', error);
    
    // Renvoyer une réponse d'erreur
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur de traitement de la requête' 
      }, 
      { status: 500 }
    );
  }
} 