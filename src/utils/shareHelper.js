import { Share, Platform } from 'react-native';

export const shareInviteLink = async (refCode = 'DZY500') => {
  const inviteUrl = `https://dizzitup.com/invite?ref=${refCode}`;
  const message = `Rejoins-moi sur DizzitUp pour envoyer de l'argent, recharger des mobiles et payer des factures en Afrique sans frais ! Reçois $5 en DZY à l'inscription. Télécharge l'application ou clique ici : ${inviteUrl}`;

  try {
    if (Platform.OS === 'web' && navigator.share) {
      await navigator.share({
        title: 'Invitation DizzitUp',
        text: message,
        url: inviteUrl,
      });
    } else {
      await Share.share(
        {
          title: 'Invitation DizzitUp',
          message: Platform.OS === 'ios' ? message : `${message}`,
          url: inviteUrl,
        },
        {
          dialogTitle: 'Inviter un ami sur DizzitUp',
        }
      );
    }
  } catch (error) {
    console.log('Share invitation cancelled or error:', error);
  }
};

export const shareShopLink = async (shopCode = 'SHOP2026') => {
  const shopUrl = `https://dizzitup.com/shops?ref=${shopCode}`;
  const message = `Découvre les boutiques et services essentiels sur DizzitUp (alimentation, santé, éducation). Visite ou télécharge l'appli : ${shopUrl}`;

  try {
    if (Platform.OS === 'web' && navigator.share) {
      await navigator.share({
        title: 'Boutiques DizzitUp',
        text: message,
        url: shopUrl,
      });
    } else {
      await Share.share(
        {
          title: 'Boutiques DizzitUp',
          message: Platform.OS === 'ios' ? message : `${message}`,
          url: shopUrl,
        },
        {
          dialogTitle: 'Partager le catalogue DizzitUp',
        }
      );
    }
  } catch (error) {
    console.log('Share shop link cancelled or error:', error);
  }
};
