"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { formatNumber } from "@/lib/digitFormat";
import { Button } from "@/components/ui/button";

// Type pour les tokens perp
interface PerpToken {
  name: string;
  logo: string | null;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  openInterest: number;
  funding: number;
  maxLeverage: number;
  onlyIsolated: boolean;
}

// Données mockées pour le token perp
const mockPerpToken: PerpToken = {
  name: "BTC-PERP",
  logo: null,
  price: 65000,
  change24h: 2.5,
  volume: 25000000000,
  marketCap: 1250000000000,
  openInterest: 15000000000,
  funding: 0.01,
  maxLeverage: 100,
  onlyIsolated: false
};

export default function PerpTokenPage() {
  const router = useRouter();
  const [token, setToken] = useState<PerpToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    const loadData = () => {
      setLoading(true);
      
      // Simuler un délai de chargement
      setTimeout(() => {
        setToken(mockPerpToken);
        setLoading(false);
      }, 1000);
    };
    
    loadData();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!token) {
    return <div>Token non trouvé</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{token.name}</h1>
        <Button onClick={() => router.back()}>Retour</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Prix</span>
              <span className="font-medium">${formatNumber(token.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Variation 24h</span>
              <span className={token.change24h >= 0 ? "text-green-500" : "text-red-500"}>
                {token.change24h >= 0 ? "+" : ""}{token.change24h}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Volume 24h</span>
              <span className="font-medium">${formatNumber(token.volume)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Capitalisation</span>
              <span className="font-medium">${formatNumber(token.marketCap)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Détails du marché</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Intérêt ouvert</span>
              <span className="font-medium">${formatNumber(token.openInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Funding</span>
              <span className="font-medium">{token.funding}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Leverage max</span>
              <span className="font-medium">{token.maxLeverage}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mode isolé uniquement</span>
              <span className="font-medium">{token.onlyIsolated ? "Oui" : "Non"}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 