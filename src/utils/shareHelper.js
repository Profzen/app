import { Share, Platform } from 'react-native';

export const shareInviteLink = async (refCode = 'DZY500') => {
  const inviteUrl = `https://dizzitup.com/invite?ref=${refCode}`;
  const message = `Join me on DizzitUp to support wisely your family in Africa by covering their needs while developing local economy. Buy goods, Pay bills, Invest in local businesses. Use my referral code ${refCode} to earn rewards: ${inviteUrl}`;

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

export const handleUserInviteShare = (user, contact = null) => {
  const code = user?.id ? `DZY-${user.id.substring(0, 6).toUpperCase()}` : 'DZY500';
  const inviteUrl = `https://dizzitup.com/invite?ref=${code}`;
  const recipientGreeting = contact?.name ? `Hello ${contact.name}, ` : '';
  const message = `${recipientGreeting}Join me on DizzitUp to support wisely your family in Africa by covering their needs while developing local economy. Buy goods, Pay bills, Invest in local businesses. Use my referral code ${code} to earn rewards: ${inviteUrl}`;
  
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Invitation DizzitUp',
        text: message,
        url: inviteUrl,
      }).catch(() => {});
    } else {
      Share.share(
        {
          title: 'Invitation DizzitUp',
          message: message,
          url: inviteUrl,
        },
        {
          dialogTitle: 'Inviter un ami sur DizzitUp',
        }
      ).catch(() => {});
    }
  } catch (error) {
    console.log('Share invitation cancelled or error:', error);
  }
};

export const shareTransactionSuccess = async ({ caption, cardUri, dialogTitle = 'Share DizzitUp Transaction' }) => {
  try {
    if (cardUri && Platform.OS !== 'web') {
      try {
        const Sharing = require('expo-sharing');
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(cardUri, {
            mimeType: cardUri.endsWith('.pdf') ? 'application/pdf' : 'image/png',
            dialogTitle,
          });
          return true;
        }
      } catch (shareErr) {
        console.warn('expo-sharing error, falling back to Share.share:', shareErr);
      }
    }

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: dialogTitle,
        text: caption,
        url: 'https://dizzitup.com/',
      });
      return true;
    }

    await Share.share({
      title: dialogTitle,
      message: caption,
      url: cardUri || 'https://dizzitup.com/',
    }, {
      dialogTitle,
    });
    return true;
  } catch (error) {
    console.warn('Share error:', error);
    return false;
  }
};
