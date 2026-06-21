import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation, AlertCircle, Locate, Loader2 } from 'lucide-react';

const T = {
  primary: '#E74C3C',
  light:   '#FF6B5B',
  bg:      'rgba(231,76,60,0.07)',
  border:  'rgba(231,76,60,0.18)',
};

const PHARMACIES_DB = [

  // ══════════════════════════════════════════════════════════════════
  // ABIDJAN — COCODY / RIVIERA / ANGRÉ / II PLATEAUX
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Pharmacie Saint-François de Sales',
    quartier: 'Cocody Danga', ville: 'Abidjan', commune: 'Cocody',
    address: 'Cocody Danga, face Mosquée, Abidjan',
    phone: '+22522480909',
    horaires: 'Lun–Sam 7h30–21h · Dim 9h–18h',
    urgence: false,
    lat: 5.3600, lng: -3.9690,
    actifs_dispo: ['niacinamide', 'vitamine c', 'spf', 'zinc'],
    note: 4.2,
  },
  {
    name: 'Pharmacie Arnica',
    quartier: 'Riviera 2', ville: 'Abidjan', commune: 'Cocody',
    address: 'Riviera 2, près petite mosquée, Cocody, Abidjan',
    phone: '+22522595678',
    horaires: 'Lun–Sam 7h30–21h · Dim 8h–18h',
    urgence: false,
    lat: 5.3730, lng: -3.9500,
    actifs_dispo: ['niacinamide', 'vitamine c', 'acide hyaluronique', 'spf', 'retinol', 'centella asiatica'],
    note: 4.5,
  },
  {
    name: 'Pharmacie Bel Horizon',
    quartier: 'Angré Nord', ville: 'Abidjan', commune: 'Cocody',
    address: 'Bd Latrille Angré Nord, 50m Petro Ivoire Latrille, Abidjan',
    phone: '+22522503311',
    horaires: 'Lun–Sam 7h30–21h · Dim 9h–18h',
    urgence: false,
    lat: 5.3780, lng: -3.9680,
    actifs_dispo: ['retinol', 'niacinamide', 'vitamine c', 'acide hyaluronique', 'spf', 'centella asiatica', 'peptides', 'azelaic acid'],
    note: 4.6,
  },
  {
    name: "Pharmacie de l'Ivoire",
    quartier: 'Hôtel Ivoire', ville: 'Abidjan', commune: 'Cocody',
    address: 'Résidence Hôtel Ivoire, Cocody, Abidjan',
    phone: '+22522446312',
    horaires: 'Lun–Dim 7h–22h',
    urgence: false,
    lat: 5.3481, lng: -3.9775,
    actifs_dispo: ['niacinamide', 'vitamine c', 'spf', 'retinol', 'acide hyaluronique', 'peptides', 'zinc'],
    note: 4.7,
  },
  {
    name: 'Pharmacie de Cocody',
    quartier: 'Petit Marché', ville: 'Abidjan', commune: 'Cocody',
    address: 'Cocody Petit Marché, Abidjan',
    phone: '+22522442495',
    horaires: 'Lun–Sam 8h–20h',
    urgence: false,
    lat: 5.3542, lng: -3.9831,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.0,
  },
  {
    name: 'Pharmacie Blockhauss',
    quartier: 'Blockhauss', ville: 'Abidjan', commune: 'Cocody',
    address: 'Cocody Blockhauss, face station TOTAL, Abidjan',
    phone: '+22527224868',
    horaires: 'Lun–Dim 7h–22h · 24h/24',
    urgence: true,
    lat: 5.3486, lng: -3.9772,
    actifs_dispo: ['niacinamide', 'vitamine c', 'spf', 'retinol', 'acide hyaluronique', 'zinc', 'peptides'],
    note: 4.6,
  },

  // ══════════════════════════════════════════════════════════════════
  // ABIDJAN — PLATEAU
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Grande Pharmacie du Commerce',
    quartier: 'Plateau', ville: 'Abidjan', commune: 'Plateau',
    address: '24 Rue du Commerce, Av. Général De Gaulle, Imm. EBREIN, Plateau',
    phone: '+22520321212',
    horaires: 'Lun–Dim 7h–22h · 24h/24',
    urgence: true,
    lat: 5.3196, lng: -4.0166,
    actifs_dispo: ['retinol', 'niacinamide', 'acide hyaluronique', 'spf', 'peptides', 'vitamine c', 'acide salicylique', 'zinc', 'centella asiatica', 'azelaic acid'],
    note: 4.8,
  },
  {
    name: 'Pharmacie Centrale du Plateau',
    quartier: 'Plateau', ville: 'Abidjan', commune: 'Plateau',
    address: "Av. Franchet d'Espérey, Plateau, Abidjan",
    phone: '+22520215400',
    horaires: 'Lun–Dim 7h–22h · 24h/24',
    urgence: true,
    lat: 5.3211, lng: -4.0145,
    actifs_dispo: ['retinol', 'niacinamide', 'acide hyaluronique', 'spf', 'vitamine c', 'zinc', 'peptides'],
    note: 4.7,
  },
  {
    name: 'Pharmacie du Forum',
    quartier: 'Adjamé', ville: 'Abidjan', commune: 'Adjamé',
    address: 'Adjamé Forum, Boulevard Nangui Abrogoua, Abidjan',
    phone: '+22520381364',
    horaires: 'Lun–Sam 7h–21h',
    urgence: false,
    lat: 5.3610, lng: -4.0120,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.0,
  },
  {
    name: 'Pharmacie Adjamé Bracodi',
    quartier: 'Bracodi', ville: 'Abidjan', commune: 'Adjamé',
    address: 'Adjamé Bracodi, derrière RAIL TAXI Gare, Abidjan',
    phone: '+22520375433',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 5.3641, lng: -4.0160,
    actifs_dispo: ['niacinamide', 'spf', 'zinc', 'vitamine c'],
    note: 3.9,
  },

  // ══════════════════════════════════════════════════════════════════
  // ABIDJAN — YOPOUGON
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Grande Pharmacie Bel Air',
    quartier: 'Yopougon Maroc', ville: 'Abidjan', commune: 'Yopougon',
    address: 'Yopougon Maroc, face STADE, Abidjan',
    phone: '+22523526175',
    horaires: 'Lun–Sam 7h–21h',
    urgence: false,
    lat: 5.3470, lng: -4.0680,
    actifs_dispo: ['niacinamide', 'spf', 'zinc', 'vitamine c', 'acide salicylique'],
    note: 4.1,
  },
  {
    name: 'Pharmacie du Cénacle',
    quartier: 'Zone CHU', ville: 'Abidjan', commune: 'Yopougon',
    address: 'Face Station Petro-Ivoire, après Cité Policière BAE, Zone CHU, Yopougon',
    phone: '+22523522323',
    horaires: 'Lun–Dim 7h–22h · 24h/24',
    urgence: true,
    lat: 5.3560, lng: -4.0590,
    actifs_dispo: ['niacinamide', 'vitamine c', 'spf', 'zinc', 'acide hyaluronique', 'retinol'],
    note: 4.4,
  },
  {
    name: 'Pharmacie Toît Rouge',
    quartier: 'Toît Rouge', ville: 'Abidjan', commune: 'Yopougon',
    address: 'Yopougon Toît Rouge, Abidjan',
    phone: '+22523560000',
    horaires: 'Lun–Sam 8h–20h',
    urgence: false,
    lat: 5.3420, lng: -4.0720,
    actifs_dispo: ['niacinamide', 'spf', 'zinc', 'vitamine c'],
    note: 3.9,
  },
  {
    name: "Pharmacie de l'Avocatier",
    quartier: 'Avocatier', ville: 'Abidjan', commune: 'Yopougon',
    address: 'Yopougon Avocatier, à gauche après la CIE Nord, Abidjan',
    phone: '+22527244970',
    horaires: 'Lun–Sam 7h30–21h',
    urgence: false,
    lat: 5.3530, lng: -4.0640,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.0,
  },

  // ══════════════════════════════════════════════════════════════════
  // ABIDJAN — MARCORY / TREICHVILLE / KOUMASSI / PORT-BOUËT
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Pharmacie Immaculée',
    quartier: 'Zone 4C', ville: 'Abidjan', commune: 'Marcory',
    address: 'Marcory Zone 4C, Rue Dr Calmette, Abidjan',
    phone: '+22521354422',
    horaires: 'Lun–Sam 7h–21h',
    urgence: false,
    lat: 5.3040, lng: -3.9860,
    actifs_dispo: ['niacinamide', 'spf', 'zinc', 'acide salicylique', 'vitamine c'],
    note: 4.0,
  },
  {
    name: 'Pharmacie de Koumassi',
    quartier: 'Remblais', ville: 'Abidjan', commune: 'Koumassi',
    address: 'Koumassi Remblais, face Clinique Ste Anielle-Dominique, Abidjan',
    phone: '+22521362748',
    horaires: 'Lun–Sam 7h30–21h',
    urgence: false,
    lat: 5.2930, lng: -3.9750,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc'],
    note: 4.0,
  },
  {
    name: 'Pharmacie Saint Albert',
    quartier: 'Koumassi Centre', ville: 'Abidjan', commune: 'Koumassi',
    address: 'Koumassi Centre, Abidjan',
    phone: '+22521361985',
    horaires: 'Lun–Sam 7h–21h',
    urgence: false,
    lat: 5.2950, lng: -3.9720,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 3.9,
  },
  {
    name: 'Pharmacie Route de Bingerville',
    quartier: 'Port-Bouët', ville: 'Abidjan', commune: 'Port-Bouët',
    address: 'Port-Bouët Terminus 19 (Vridi), Abidjan',
    phone: '+22521275860',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 5.2540, lng: -3.9410,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.8,
  },

  // ══════════════════════════════════════════════════════════════════
  // ABIDJAN — ABOBO
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Pharmacie Irys',
    quartier: 'Anonkoua Koute', ville: 'Abidjan', commune: 'Abobo',
    address: 'Abobo Anonkoua Koute, en face Hôpital des Sœurs, Abidjan',
    phone: '+22507126779',
    horaires: 'Lun–Sam 7h30–21h',
    urgence: false,
    lat: 5.4050, lng: -4.0240,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.1,
  },
  {
    name: "Pharmacie de l'Étoile",
    quartier: 'Brigade Gendarmerie', ville: 'Abidjan', commune: 'Abobo',
    address: 'Rond-Point de la Brigade de Gendarmerie, Abobo, Abidjan',
    phone: '+22501024406',
    horaires: 'Lun–Sam 7h–21h',
    urgence: false,
    lat: 5.4180, lng: -4.0310,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc'],
    note: 4.0,
  },
  {
    name: 'Pharmacie Saint Antoine',
    quartier: 'Sagbé Céleste', ville: 'Abidjan', commune: 'Abobo',
    address: 'Abobo Sagbé Céleste, derrière Rail Taxi Gare, Abidjan',
    phone: '+22527202477',
    horaires: 'Lun–Sam 7h30–21h',
    urgence: false,
    lat: 5.4260, lng: -4.0190,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.0,
  },

  // ══════════════════════════════════════════════════════════════════
  // BOUAKÉ
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Pharmacie du Commerce (TSF)',
    quartier: 'Quartier Commerce', ville: 'Bouaké', commune: 'Bouaké',
    address: 'Bouaké Quartier Commerce, face BICICI, Bouaké',
    phone: '+22527316363',
    horaires: 'Lun–Sam 7h30–20h · Dim 8h–13h',
    urgence: false,
    lat: 7.6911, lng: -5.0311,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.1,
  },
  {
    name: 'Pharmacie Rehoboth du Stade',
    quartier: 'Nouveau Stade', ville: 'Bouaké', commune: 'Bouaké',
    address: 'Immeuble FANNY, face Nouveau Stade, Bouaké',
    phone: '+22527316347',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 7.6905, lng: -5.0391,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.2,
  },
  {
    name: 'Pharmacie Sainte Marie de Ngattakro',
    quartier: 'Ngattakro', ville: 'Bouaké', commune: 'Bouaké',
    address: 'Bouaké Ngattakro, route de Béoumi, face Église CMA, Bouaké',
    phone: '+22527316316',
    horaires: 'Lun–Sam 7h30–19h30',
    urgence: false,
    lat: 7.6831, lng: -5.0366,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc'],
    note: 4.2,
  },
  {
    name: 'Pharmacie du Gbêkê',
    quartier: 'Commerce Centre', ville: 'Bouaké', commune: 'Bouaké',
    address: 'Bouaké Commerce, face banque BHCI, Bouaké',
    phone: '+22527316319',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 7.6814, lng: -5.0278,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique', 'retinol'],
    note: 4.3,
  },
  {
    name: 'Pharmacie Avicenne',
    quartier: 'Kottiakoffikro', ville: 'Bouaké', commune: 'Bouaké',
    address: 'Bouaké quartier Kottiakoffikro, Bouaké',
    phone: '+22527316218',
    horaires: 'Lun–Sam 8h–20h',
    urgence: false,
    lat: 7.6905, lng: -5.0391,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc'],
    note: 4.0,
  },

  // ══════════════════════════════════════════════════════════════════
  // YAMOUSSOUKRO
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Pharmacie des 220 Logements',
    quartier: '220 Logements', ville: 'Yamoussoukro', commune: 'Yamoussoukro',
    address: 'Boulevard face BICICI, 220 Logements, Yamoussoukro',
    phone: '+22527306422',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 6.8276, lng: -5.2893,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc'],
    note: 4.0,
  },
  {
    name: 'Pharmacie Notre-Dame de Fatima',
    quartier: 'Dioulabougou', ville: 'Yamoussoukro', commune: 'Yamoussoukro',
    address: 'Quartier Dioulabougou, Centre Commercial Mofaïté, Yamoussoukro',
    phone: '+22527306457',
    horaires: 'Lun–Sam 7h30–21h',
    urgence: false,
    lat: 6.8276, lng: -5.2893,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.2,
  },
  {
    name: 'Pharmacie Erginal',
    quartier: 'Assabou', ville: 'Yamoussoukro', commune: 'Yamoussoukro',
    address: 'Quartier Assabou, Yamoussoukro',
    phone: '+22527306462',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 6.8359, lng: -5.2658,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc'],
    note: 4.0,
  },
  {
    name: 'Grande Pharmacie Morofé',
    quartier: 'Morofé', ville: 'Yamoussoukro', commune: 'Yamoussoukro',
    address: 'Quartier Morofé, Yamoussoukro',
    phone: '+22527235797',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 6.8463, lng: -5.2920,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide hyaluronique'],
    note: 4.1,
  },
  {
    name: 'Pharmacie de Yamoussoukro',
    quartier: 'Quartier Énergie', ville: 'Yamoussoukro', commune: 'Yamoussoukro',
    address: 'Quartier Énergie, près Grand Marché, Yamoussoukro',
    phone: '+22527306404',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 6.8199, lng: -5.2789,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc'],
    note: 3.9,
  },
  {
    name: 'Pharmacie Azi',
    quartier: 'Quartier Commerce', ville: 'Yamoussoukro', commune: 'Yamoussoukro',
    address: 'Quartier Commerce, route internationale, Yamoussoukro',
    phone: '+22527306426',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 6.8276, lng: -5.2893,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.0,
  },

  // ══════════════════════════════════════════════════════════════════
  // SAN-PÉDRO
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Pharmacie Nitoro',
    quartier: 'Nitoro', ville: 'San-Pédro', commune: 'San-Pédro',
    address: 'Boulevard de la République, ex Carrefour SIB, Quartier Nitoro, San-Pédro',
    phone: '+22527347139',
    horaires: 'Lun–Sam 7h30–21h',
    urgence: false,
    lat: 4.7444, lng: -6.6318,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.1,
  },
  {
    name: 'Pharmacie Georges Denise',
    quartier: 'Rue des Banques', ville: 'San-Pédro', commune: 'San-Pédro',
    address: 'Rue des Banques, face Côte d\'Ivoire Telecom, San-Pédro',
    phone: '+22527347123',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 4.7579, lng: -6.6424,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc'],
    note: 4.0,
  },
  {
    name: 'Pharmacie du Bien-Être',
    quartier: 'Quartier Soleil', ville: 'San-Pédro', commune: 'San-Pédro',
    address: 'Quartier Soleil, près Collège La Fayette, route de Bereby, San-Pédro',
    phone: '+22527347131',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 4.7654, lng: -6.6761,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc'],
    note: 3.9,
  },
  {
    name: 'Pharmacie Sainte Claudine',
    quartier: 'Bado 18', ville: 'San-Pédro', commune: 'San-Pédro',
    address: 'Bado 18, face CNPS, San-Pédro',
    phone: '+22527347144',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 4.7579, lng: -6.6424,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.9,
  },
  {
    name: 'Pharmacie de la Cité',
    quartier: 'Quartier Cité', ville: 'San-Pédro', commune: 'San-Pédro',
    address: 'San-Pédro Quartier Cité, San-Pédro',
    phone: '+22527357146',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 4.7579, lng: -6.6424,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.8,
  },

  // ══════════════════════════════════════════════════════════════════
  // KORHOGO
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Pharmacie Nour',
    quartier: 'Route de Bouaké', ville: 'Korhogo', commune: 'Korhogo',
    address: 'Korhogo Quartier 14, route de Bouaké, Korhogo',
    phone: '+22507072902',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 9.4669, lng: -5.6143,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 4.0,
  },
  {
    name: 'Pharmacie de la Grande Mosquée',
    quartier: 'Centre-ville', ville: 'Korhogo', commune: 'Korhogo',
    address: 'Face Grande Mosquée de Korhogo, Korhogo',
    phone: '+22527245722',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 9.4669, lng: -5.6143,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.1,
  },
  {
    name: 'Pharmacie du Palais de Justice',
    quartier: 'Résidentiel', ville: 'Korhogo', commune: 'Korhogo',
    address: 'Korhogo Résidentiel, près du CHR de Korhogo',
    phone: '+22536853755',
    horaires: 'Lun–Sam 7h30–19h30',
    urgence: false,
    lat: 9.4669, lng: -5.6143,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.9,
  },
  {
    name: 'Pharmacie Soba',
    quartier: 'Quartier Soba', ville: 'Korhogo', commune: 'Korhogo',
    address: 'Quartier Soba, Korhogo',
    phone: '+22507075156',
    horaires: 'Lun–Sam 7h30–19h30',
    urgence: false,
    lat: 9.4475, lng: -5.6169,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.8,
  },
  {
    name: 'Pharmacie du Nord',
    quartier: 'Centre-ville', ville: 'Korhogo', commune: 'Korhogo',
    address: 'Korhogo Centre-ville, Quartier Soba, Korhogo',
    phone: '+22578976317',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 9.4475, lng: -5.6169,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.0,
  },

  // ══════════════════════════════════════════════════════════════════
  // DALOA
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Pharmacie Centrale de Daloa',
    quartier: 'Quartier Commerce', ville: 'Daloa', commune: 'Daloa',
    address: 'Quartier Commerce, Daloa',
    phone: '+22532782243',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 6.8883, lng: -6.4397,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.0,
  },
  {
    name: 'Grande Pharmacie Appaul',
    quartier: 'Quartier Commerce', ville: 'Daloa', commune: 'Daloa',
    address: 'Daloa Quartier Commerce, Daloa',
    phone: '+22532783578',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 6.8883, lng: -6.4397,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc'],
    note: 4.0,
  },
  {
    name: 'Pharmacie du Commerce de Daloa',
    quartier: 'Quartier Commerce', ville: 'Daloa', commune: 'Daloa',
    address: 'Daloa Quartier Commerce, Daloa',
    phone: '+22527337820',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 6.8883, lng: -6.4397,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 3.9,
  },
  {
    name: 'Pharmacie du Carrefour Labia',
    quartier: 'Carrefour Labia', ville: 'Daloa', commune: 'Daloa',
    address: 'Carrefour Labia, Daloa',
    phone: '+22532784992',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 6.8700, lng: -6.4480,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.8,
  },
  {
    name: 'Pharmacie Déloré',
    quartier: 'Route de Man', ville: 'Daloa', commune: 'Daloa',
    address: 'Route de Man, Daloa',
    phone: '+22507676492',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 6.8883, lng: -6.4600,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.8,
  },

  // ══════════════════════════════════════════════════════════════════
  // MAN
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Pharmacie Moderne',
    quartier: 'Près du Marché', ville: 'Man', commune: 'Man',
    address: 'Man, près du Marché central, Man',
    phone: '+22510250302',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 7.4064, lng: -7.5572,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc'],
    note: 4.0,
  },
  {
    name: 'Pharmacie du Commerce de Man',
    quartier: 'Face Marché', ville: 'Man', commune: 'Man',
    address: 'Face au Marché Central, Man',
    phone: '+22527347804',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 7.4064, lng: -7.5572,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.1,
  },
  {
    name: 'Pharmacie de la Mosquée',
    quartier: 'Dioulabougou', ville: 'Man', commune: 'Man',
    address: 'Quartier Dioulabougou, Man',
    phone: '+22527347942',
    horaires: 'Lun–Sam 7h30–19h30',
    urgence: false,
    lat: 7.4139, lng: -7.5538,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.9,
  },
  {
    name: 'Pharmacie Lycée Club',
    quartier: 'Résidentiel', ville: 'Man', commune: 'Man',
    address: 'Quartier Lycée Résidentiel, Man',
    phone: '+22574700943',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 7.3856, lng: -7.5427,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.9,
  },
  {
    name: 'Pharmacie Khianelly',
    quartier: 'Belle Ville', ville: 'Man', commune: 'Man',
    address: 'Quartier Belle Ville, route de Facobly, Man',
    phone: '+22550505055',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 7.3905, lng: -7.3753,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.8,
  },

  // ══════════════════════════════════════════════════════════════════
  // ABENGOUROU / GRAND-BASSAM
  // ══════════════════════════════════════════════════════════════════
  {
    name: 'Pharmacie du Commerce Abengourou',
    quartier: 'Quartier Commerce', ville: 'Abengourou', commune: 'Abengourou',
    address: 'Quartier Commerce, face BICICI, Abengourou',
    phone: '+22535914738',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 6.7157, lng: -3.4801,
    actifs_dispo: ['niacinamide', 'spf', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.0,
  },
  {
    name: 'Pharmacie du Marché Abengourou',
    quartier: 'Grand Marché', ville: 'Abengourou', commune: 'Abengourou',
    address: 'Grand Marché, Abengourou',
    phone: '+22535913189',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 6.7157, lng: -3.4801,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.9,
  },
  {
    name: 'Pharmacie Providence',
    quartier: 'Plateau', ville: 'Abengourou', commune: 'Abengourou',
    address: 'Quartier Plateau, face PETROCI, Abengourou',
    phone: '+22535900901',
    horaires: 'Lun–Sam 7h30–19h30',
    urgence: false,
    lat: 6.7157, lng: -3.4801,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.9,
  },
  {
    name: 'Nouvelle Pharmacie du Carrefour',
    quartier: 'Dioulakro', ville: 'Abengourou', commune: 'Abengourou',
    address: 'Quartier Dioulakro, Abengourou',
    phone: '+22535913503',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 6.7157, lng: -3.4801,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.8,
  },
  {
    name: 'Pharmacie du Petit Marché de Grand-Bassam',
    quartier: 'Petit Marché', ville: 'Grand-Bassam', commune: 'Grand-Bassam',
    address: 'Petit Marché de Grand-Bassam, Grand-Bassam',
    phone: '+22527213030',
    horaires: 'Lun–Sam 8h–20h',
    urgence: false,
    lat: 5.2177, lng: -3.7355,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc', 'acide salicylique'],
    note: 4.0,
  },
  {
    name: 'Pharmacie du Sanwi',
    quartier: 'Ebouakro Extension', ville: 'Grand-Bassam', commune: 'Grand-Bassam',
    address: 'Quartier Ebouakro Extension, près CHR d\'Aboisso, Grand-Bassam',
    phone: '+22527213044',
    horaires: 'Lun–Sam 7h30–20h',
    urgence: false,
    lat: 5.2259, lng: -3.7537,
    actifs_dispo: ['spf', 'niacinamide', 'vitamine c', 'zinc'],
    note: 3.8,
  },
];


const VILLES = ['Toutes', ...new Set(PHARMACIES_DB.map(p => p.ville))];

// Calcul distance Haversine entre 2 points GPS (résultat en km)
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function openItinerary(p) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=driving`;
  window.open(url, '_blank');
}

function callPharmacy(phone) {
  window.open(`tel:${phone}`, '_self');
}

function StarRating({ note }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-bold" style={{ color: '#F5A623' }}>{note}</span>
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <svg key={i} width="9" height="9" viewBox="0 0 10 10">
            <polygon points="5,1 6.2,3.8 9,4.1 7,6 7.6,9 5,7.5 2.4,9 3,6 1,4.1 3.8,3.8"
              fill={i <= Math.round(note) ? '#F5A623' : 'rgba(0,0,0,0.10)'} />
          </svg>
        ))}
      </div>
    </div>
  );
}

function PharmacyCard({ p, index }) {
  const hasDistance = p.distance !== undefined;
  const isUrgent = p.urgence;

  return (
    <motion.div
      className="flex-shrink-0 w-64 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.92)',
        border: `1.5px solid ${isUrgent ? 'rgba(0,168,120,0.25)' : T.border}`
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <div className="h-1" style={{
        background: isUrgent
          ? 'linear-gradient(90deg, #00A878, #00C896)'
          : `linear-gradient(90deg, ${T.primary}, ${T.light})`
      }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <h4 className="font-inter font-bold text-xs text-foreground leading-tight">{p.name}</h4>
              {isUrgent && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(0,168,120,0.12)', color: '#00A878' }}>24h</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {p.quartier} · {p.ville !== 'Abidjan' ? p.ville : p.commune}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StarRating note={p.note} />
            {hasDistance && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: T.bg, color: T.primary }}>
                {formatDistance(p.distance)}
              </span>
            )}
          </div>
        </div>

        {/* Infos */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-start gap-1.5">
            <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: T.primary }} />
            <span className="text-xs text-muted-foreground leading-tight">{p.horaires}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 flex-shrink-0" style={{ color: T.primary }} />
            <span className="text-xs text-muted-foreground">{p.phone}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: T.primary }} />
            <span className="text-xs text-muted-foreground leading-tight">{p.address}</span>
          </div>
        </div>

        {/* Boutons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            className="py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
            style={{ background: T.bg, color: T.primary }}
            onClick={() => openItinerary(p)}
          >
            <Navigation className="w-3 h-3" />Itinéraire
          </button>
          <button
            className="py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
            style={{ background: 'rgba(0,168,120,0.08)', color: '#00A878' }}
            onClick={() => callPharmacy(p.phone)}
          >
            <Phone className="w-3 h-3" />Appeler
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function PharmacySection() {
  const [ville, setVille]           = useState('Toutes');
  const [sortBy, setSortBy]         = useState('distance');
  const [userPos, setUserPos]       = useState(null);
  const [geoStatus, setGeoStatus]   = useState('idle'); // idle | loading | ok | denied

  // Géolocalisation automatique au montage
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      setSortBy('note');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('ok');
        setSortBy('distance');
      },
      () => {
        setGeoStatus('denied');
        setSortBy('note');
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  // Ajout de la distance à chaque pharmacie
  const pharmaciesWithDist = PHARMACIES_DB.map(p => ({
    ...p,
    distance: userPos ? getDistance(userPos.lat, userPos.lng, p.lat, p.lng) : undefined,
  }));

  const filtered = pharmaciesWithDist
    .filter(p => ville === 'Toutes' || p.ville === ville)
    .sort((a, b) => {
      if (sortBy === 'distance' && a.distance !== undefined) return a.distance - b.distance;
      if (sortBy === 'urgence') return (b.urgence ? 1 : 0) - (a.urgence ? 1 : 0);
      return b.note - a.note;
    });

  // Top 3 les plus proches si géoloc disponible
  const nearest = userPos
    ? [...pharmaciesWithDist].sort((a, b) => a.distance - b.distance).slice(0, 1)[0]
    : null;

  return (
    <motion.div className="mx-4 mb-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: T.bg }}>
          <MapPin className="w-4 h-4" style={{ color: T.primary }} />
        </div>
        <div>
          <h3 className="font-inter font-bold text-base text-foreground">Pharmacies en Côte d'Ivoire</h3>
          <p className="text-xs text-muted-foreground">
            {geoStatus === 'ok' ? 'Triées par proximité · Votre position détectée' : 'Appelez avant de vous déplacer'}
          </p>
        </div>
      </div>

      {/* Statut géolocalisation */}
      {geoStatus === 'loading' && (
        <motion.div className="mb-3 p-3 rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(0,168,120,0.07)', border: '1px solid rgba(0,168,120,0.15)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin flex-shrink-0" />
          <p className="text-xs text-primary font-medium">Détection de votre position…</p>
        </motion.div>
      )}

      {geoStatus === 'ok' && nearest && (
        <motion.div className="mb-3 p-3 rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(0,168,120,0.07)', border: '1px solid rgba(0,168,120,0.15)' }}
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <Locate className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <p className="text-xs font-medium text-primary">
            Plus proche : <strong>{nearest.name}</strong> · {formatDistance(nearest.distance)}
          </p>
        </motion.div>
      )}

      {geoStatus === 'denied' && (
        <motion.div className="mb-3 p-3 rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">Position non disponible · Triées par note</p>
        </motion.div>
      )}

      {/* Filtre villes */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
        {VILLES.map(v => (
          <button key={v} onClick={() => setVille(v)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all"
            style={ville === v
              ? { background: T.primary, color: '#fff' }
              : { background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(0,0,0,0.10)', color: 'hsl(var(--muted-foreground))' }
            }>
            {v}
          </button>
        ))}
      </div>

      {/* Tri */}
      <div className="flex gap-3 mb-4">
        {[
          { key: 'distance', label: '📍 Les plus proches', disabled: geoStatus !== 'ok' },
          { key: 'note',     label: '⭐ Mieux notées' },
          { key: 'urgence',  label: '🕐 24h/24' },
        ].map(s => (
          !s.disabled && (
            <button key={s.key} onClick={() => setSortBy(s.key)}
              className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
              style={sortBy === s.key
                ? { background: 'rgba(0,0,0,0.08)', color: 'hsl(var(--foreground))', fontWeight: 700 }
                : { color: 'hsl(var(--muted-foreground))' }}>
              {s.label}
            </button>
          )
        ))}
      </div>

      {/* Cartes */}
      <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
        {filtered.length === 0 ? (
          <div className="flex items-center gap-2 px-2 py-6 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">Aucune pharmacie dans cette ville</p>
          </div>
        ) : (
          filtered.map((p, i) => <PharmacyCard key={i} p={p} index={i} />)
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-3 p-3 rounded-xl"
        style={{ background: 'rgba(231,76,60,0.05)', border: '1px solid rgba(231,76,60,0.12)' }}>
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          📞 <strong>Appelez toujours avant de vous déplacer</strong> pour vérifier la disponibilité des produits dont vous avez besoin.
        </p>
      </div>
    </motion.div>
  );
}