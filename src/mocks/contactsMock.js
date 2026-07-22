export const CONTACTS_MOCK = [
  {
    id: '1',
    name: 'David Mensah',
    relation: 'Frère',
    location: 'Lomé, Togo',
    flag: '🇹🇬',
    phone: '+228 90 12 34 56',
    email: 'david.mensah@dizzitapp.com',
    isBeneficiary: true,
    isSponsor: true,
    avatar: require('../../assets/avatars/david.jpg'),
    flagAsset: require('../../assets/flags/tg.png'),
    recentTransactions: [
      { id: 'tx1', type: 'ENVOI', amount: '25,000 XOF', date: '20 Juillet 2026', status: 'RÉUSSI' },
      { id: 'tx2', type: 'RECHARGE', amount: '5,000 XOF', date: '15 Juillet 2026', status: 'RÉUSSI' }
    ]
  },
  {
    id: '2',
    name: 'Mama Kemi Adebayo',
    relation: 'Mère',
    location: 'Lagos, Nigeria',
    flag: '🇳🇬',
    phone: '+234 802 123 4567',
    email: 'kemi.adebayo@gmail.com',
    isBeneficiary: true,
    isSponsor: true,
    avatar: require('../../assets/avatars/kemi.jpg'),
    flagAsset: require('../../assets/flags/ng.png'),
    recentTransactions: [
      { id: 'tx3', type: 'ENVOI', amount: '50,000 NGN', date: '18 Juillet 2026', status: 'RÉUSSI' }
    ]
  },
  {
    id: '3',
    name: 'Uncle Joseph Mwangi',
    relation: 'Oncle',
    location: 'Nairobi, Kenya',
    flag: '🇰🇪',
    phone: '+254 712 345 678',
    email: 'joseph.mwangi@gmail.com',
    isBeneficiary: true,
    isSponsor: false,
    avatar: require('../../assets/avatars/joseph.jpg'),
    flagAsset: require('../../assets/flags/ke.png'),
    recentTransactions: []
  },
  {
    id: '4',
    name: 'Marie K.',
    relation: 'Sœur',
    location: 'Dakar, Sénégal',
    flag: '🇸🇳',
    phone: '+221 77 123 45 67',
    email: 'marie.k@gmail.com',
    isBeneficiary: true,
    isSponsor: true,
    avatar: require('../../assets/avatars/avatar2.jpg'),
    flagAsset: require('../../assets/flags/sn.png'),
    recentTransactions: []
  },
  {
    id: '5',
    name: 'Ousmane T.',
    relation: 'Ami',
    location: 'Bamako, Mali',
    flag: '🇲🇱',
    phone: '+223 66 12 34 56',
    email: 'ousmane.t@gmail.com',
    isBeneficiary: true,
    isSponsor: false,
    avatar: require('../../assets/avatars/avatar3.jpg'),
    flagAsset: require('../../assets/flags/ml.png'),
    recentTransactions: []
  },
  {
    id: '6',
    name: 'Aïssatou B.',
    relation: 'Famille',
    location: 'Ouagadougou, Burkina Faso',
    flag: '🇧🇫',
    phone: '+226 70 12 34 56',
    email: 'aissatou.b@gmail.com',
    isBeneficiary: true,
    isSponsor: false,
    avatar: require('../../assets/avatars/avatar4.jpg'),
    flagAsset: require('../../assets/flags/bf.png'),
    recentTransactions: []
  },
  {
    id: '7',
    name: 'Kwame A.',
    relation: 'Ami',
    location: 'Accra, Ghana',
    flag: '🇬🇭',
    phone: '+233 24 123 4567',
    email: 'kwame.a@gmail.com',
    isBeneficiary: false,
    isSponsor: true,
    avatar: require('../../assets/avatars/avatar5.jpg'),
    flagAsset: require('../../assets/flags/gh.png'),
    recentTransactions: []
  }
];

export const getContactById = (id) => {
  return CONTACTS_MOCK.find(c => c.id === id) || CONTACTS_MOCK[0];
};
